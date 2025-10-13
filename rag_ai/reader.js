import "dotenv/config";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";
import { fileURLToPath } from "url";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Redis } from "@upstash/redis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Gemini's gecko for embedding
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});

// LLM model initialization
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

// Saving embedding to supabase vector store
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// Redis Initialiation
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function ingestPDFIfNeeded(
  pdfRelativePath = "../data/finance_tracker.pdf"
) {
  const { data: existing, error } = await supabaseClient
    .from("documents")
    .select("id")
    .limit(1);

  if (existing && existing.length > 0) {
    console.log("Skipping ingestion — documents already exist in Supabase.");
    return false;
  }
  const pdfPath = path.join(__dirname, pdfRelativePath);
  const loader = new PDFLoader(pdfPath);

  // load the pdf
  const docs = await loader.load();

  // split
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 50,
  });
  let splittedDocs = await splitter.splitDocuments(docs);

  // filter docs if any empty documents presented
  splittedDocs = splittedDocs.filter(
    (d) => d.pageContent && d.pageContent.trim().length > 0
  );
  if (splittedDocs.length === 0)
    throw new Error("No nnon-empty chunks found is PDF");

  // QUick embedding test to ensure API+ model is working fine
  const testVec = await embeddings.embedQuery(
    splittedDocs[0].pageContent.slice(0, 200)
  );

  if (!Array.isArray(testVec) || testVec.length < 1) {
    throw new Error("Embeddings returned empty vector");
  }

  console.log("Embedding test length", testVec.length);

  // If Supabase vector table is already populated, we will move with upsert instead of insert
  console.log(`Ingesting ${splittedDocs.length} chunks into supabase...`);

  // store into supabase vectore store
  const vectorStore = await SupabaseVectorStore.fromDocuments(
    splittedDocs,
    embeddings,
    {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    }
  );

  console.log("Ingestion comppleted");
  return true;
}

// Save the message to Upstash-Redis
async function saveMessage(userId = "default_user", role = "user", text = "") {
  if (!redis) return;
  const key = `chat:${userId}`;
  const entry = JSON.stringify({
    role,
    text,
    ts: Date.now(),
  });
  await redis.lpush(key, entry); // push to left one(newest first)
  await redis.ltrim(key, 0, 199); // Keep last 200 messages
}

// ****** the main RAG Chat function *********
async function ragChat({ userId = "default_user", question = "" }) {
  // 1) Standalone Question
  const rephrasePrompt = ChatPromptTemplate.fromTemplate(
    "Rewrite the user question into a concise standalone question suitable for retrieval:\n\n{question}"
  );

  const rephraseChain = rephrasePrompt.pipe(llm).pipe(new StringOutputParser());
  const standAlone = await rephraseChain.invoke({
    question,
  });
  const query =
    typeof standAlone === "string" && standAlone.length > 0
      ? standAlone
      : question;

  // 2) Retriever from Vector store
  const vectorStore = await SupabaseVectorStore.fromExistingIndex({
    client: supabaseClient,
    tableName: process.env.SUPABASE_TABLE,
    queryName: process.env.SUPABASE_QUERY_NAME,
  }).catch(async (e) => {
    return await SupabaseVectorStore.fromDocuments([], embeddings, {
      client: supabaseClient,
      tableName: process.env.SUPABASE_TABLE,
      queryName: process.env.SUPABASE_QUERY_NAME,
    });
  });
  const retrieve = vectorStore.asRetriever();

  // 3) Retrieve
  const docs = await retrieve._getRelevantDocuments(query);
  // ilter out empties
  const nonEmptyDocs = (docs || []).filter(
    (d) => d.pageContent && d.pageContent.trim().length > 0
  );

  //4) if no docs then ask to contact helpline
  if (!nonEmptyDocs || nonEmptyDocs.length === 0) {
    const fallback =
      "I’m sorry — I couldn’t find anything in the provided documents about that. Please contact our support/helpline for help. Would you like me to provide the contact information?";
    // Save conversation
    await saveMessage(userId, "user", question);
    await saveMessage(userId, "assistant", fallback);
    return { answer: fallback, sourceDocs: [] };
  }

  // 5) Build the context and ask the LLM with friendly tone
  const context = nonEmptyDocs
    .map((d, i) => `Source ${i + 1}:\n${d.pageContent}`)
    .join("\n\n---\n\n");
  const answerPrompt = ChatPromptTemplate.fromTemplate(`
You are a friendly support assistant for a finance-tracker app. Use the following context extracted from the user's documents to answer the user's question.
Be concise, helpful, and friendly. If the answer is not found in the context, say you can't find it and advise contacting support.

Context:
{context}

Question:
{question}

Answer in a friendly, helpful tone:
`);

  const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());
  const answer = await answerChain.invoke({ context, question: query });

  // save
  await saveMessage(userId, "user", question);
  await saveMessage(userId, "assistant", answer);

  // return
  return { answer, sourceDocs: nonEmptyDocs.slice(0, 4) };
}

// run ingestion once (comment out after initial run to avoid duplicate inserts)
// (async () => {
//   try {
//     console.log("Starting ingestion (if needed)...");
//     await ingestPDFIfNeeded("../data/finance_tracker.pdf");
//   } catch (err) {
//     console.warn("Ingest warning:", err.message || err);
//   }

//   // example chat:
//   try {
//     const out = await ragChat({
//       userId: "user_123",
//       question: "What is motlob",
//     });
//     console.log("BOT ANSWER:\n", out.answer);
//     console.log(
//       "SOURCES:\n",
//       out.sourceDocs.map((d) => d.pageContent.slice(0, 200))
//     );
//   } catch (err) {
//     console.error("Chat error:", err);
//   }
// })();

export { ragChat, ingestPDFIfNeeded, redis };
