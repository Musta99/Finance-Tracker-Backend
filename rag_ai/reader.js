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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});

// const embeddings = new FakeEmbeddings();

try {
  const pdfPath = path.join(__dirname, "../data/finance_tracker.pdf");
  const loader = new PDFLoader(pdfPath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 20,
  });

  const splittedDocs = await splitter.splitDocuments(docs);

  // Saving embedding to supabase vector store
  const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
  );

  const vectorStore = await SupabaseVectorStore.fromDocuments(
    splittedDocs,
    embeddings,
    {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    }
  );

  // retrieve from vectore store
  const retrieve = vectorStore.asRetriever();

  // promting, templating, piping, invoking the LLM
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const promptTemplate = ChatPromptTemplate.fromTemplate(
    "Please convert my question to standalone question that is understood by LLM: {question}"
  );

  const res = response.map((r) => r.pageContent).join("\n");

  const chain = promptTemplate
    .pipe(llm)
    .pipe(new StringOutputParser())
    .pipe(retrieve)
    .pipe(res);

  const response = await chain.invoke({
    question:
      "I bought a t-shirt from your shop but it colud be unmatched with my size, and that is why I want to know the process of contacting your support system.",
  });

  print(response);
} catch (err) {
  console.log("Some error occured", err);
}

/**
 * 1. Create a standalone question from user input and also save the user input to conversation memory
 * 2. Embedde the stand alone question
 * 3. Store the embeddings to the vector store and find the nearest semantic match from vectore store
 * 4. find the answer from the llm using nearest match, user input and conversation memory
 * 5. response to user
 */
