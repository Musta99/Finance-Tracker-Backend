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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});

// const embeddings = new FakeEmbeddings();

try {
  // const pdfPath = path.join(__dirname, "../data/finance_tracker.pdf");
  // const loader = new PDFLoader(pdfPath);
  // const docs = await loader.load();

  // const splitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 200,
  //   chunkOverlap: 20,
  // });

  // const splittedDocs = await splitter.splitDocuments(docs);

  // // Saving embedding to supabase vector store
  // const supabaseClient = createClient(
  //   process.env.SUPABASE_URL,
  //   process.env.SUPABASE_API_KEY
  // );

  // const vectorStore = await SupabaseVectorStore.fromDocuments(
  //   splittedDocs,
  //   embeddings,
  //   {
  //     client: supabaseClient,
  //     tableName: "documents",
  //   }
  // );

  // promting, templating, piping, invoking the LLM
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const promptTemplate = ChatPromptTemplate.fromTemplate(
    "Tell me the difference between: {subject}"
  );

  const chain = promptTemplate.pipe(llm);

  const response = await chain.invoke({
    subject: "fromtemplate and fromDocument in langchain",
  });

  console.log(response.content);
} catch (err) {
  console.log("Some error occured", err);
}
