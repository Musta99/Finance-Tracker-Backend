import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String },
  currency: { type: String, default: "BDT" },
  createdAt: { type: Date, default: Date.now },
});

// Hash the password before saving to DB
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare hashed password with the provided password
UserSchema.methods.comparePassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.password);
};

export default mongoose.model("User", UserSchema);
