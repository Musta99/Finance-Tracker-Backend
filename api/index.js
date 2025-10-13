import app from "../src/server.js";
import connectDB from "../config/db.js";

await connectDB();

export default app;
