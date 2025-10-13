import dotenv from "dotenv";
import connectDB from "../config/db.js";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 5000;

// Immediately Invoked Async Function where it does not require to call as It is called immediately after being defined
(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running at ${port}`);
    });
  } catch (err) {
    console.log("Some error occured", err);
  }
})();

export default app;
