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

const contentSchema = new Schema({
  title: String,
  link: String,
  tags:[{type: mongoose.Types.ObjectId, ref: 'Tag'}],
  userId: {type:mongoose.Types.ObjectId, ref:'User', required: true}
})
export const ContentModel = model("Content",contentSchema); //"Content" -> name of the model
