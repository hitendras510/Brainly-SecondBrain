import dotenv from "dotenv";
dotenv.config();

import mongoose, { model, Schema } from "mongoose";


mongoose.connect(process.env.MONGO_URL as string);

mongoose.connection.on("error", (err) => {
  console.log(err);
});

mongoose.connection.on("open", () => {
  console.log("Connected to MONGODB");
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const UserModel = model("User", UserSchema);

const contentSchema = new mongoose.Schema({
  link: { type: String },
  title: { type: String },
  type: { type: String },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // ✅ ADD THIS
  shareLink: { type: String, unique: true, sparse: true },
});

export const ContentModel = model("Content",contentSchema); //"Content" -> name of the model
