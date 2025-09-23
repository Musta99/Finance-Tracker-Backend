import mongoose from "mongoose";

const connectDB = async () => {
  const dbURI = process.env.MONGODB_URI;
  if (!dbURI) throw new Error("No URI found to connect to DB");

  await mongoose.connect(dbURI);

  console.log("DB Connected");
};

export default connectDB;
