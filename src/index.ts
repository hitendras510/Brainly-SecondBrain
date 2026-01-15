import dotenv from "dotenv";
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";

import { UserModel, ContentModel } from "./db.js";
import { userMiddleware } from "./middleware.js";
import { JWT_PASSWORD } from "./config.js";

const app = express();
app.use(express.json());

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

/* ================== AUTH ================== */

// SIGNUP
app.post("/api/v1/signup", async (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { username, password } = result.data;

  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await UserModel.create({
    username,
    password: hashedPassword,
  });

  return res.json({ message: "User created" });
});

// SIGNIN
app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });
  if (!user) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, JWT_PASSWORD);

  return res.json({ token });
});

/* ================== CONTENT ================== */

// CREATE
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { link, type } = req.body;

  await ContentModel.create({
    link,
    type,
    userId: req.userId,
    tags: [],
  });

  return res.json({ message: "Content created" });
});

// GET
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  const content = await ContentModel.find({ userId: req.userId }).populate(
    "userId",
    "username"
  );
  return res.json({ content });
});

// DELETE
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const { contentId } = req.body;

  const result = await ContentModel.deleteOne({
    _id: contentId,
    userId: req.userId,
  });

  if (result.deletedCount === 0) {
    return res.status(403).json({ message: "Not allowed" });
  }

  return res.json({ message: "Content deleted" });
});

/* ================== SHARE ================== */

// CREATE SHARE LINK
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { contentId } = req.body;

  const content = await ContentModel.findOne({
    _id: contentId,
    userId: req.userId,
  });

  if (!content) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const shareLink = Math.random().toString(36).substring(2, 10);

  content.shareLink = shareLink;
  await content.save();

  return res.json({ shareLink });
});

// ACCESS SHARED CONTENT (PUBLIC)
app.get("/api/v1/brain/share/:shareLink", async (req, res) => {
  const { shareLink } = req.params;

  const content = await ContentModel.findOne({ shareLink }).populate(
    "userId",
    "username"
  );

  if (!content) {
    return res.status(404).json({ message: "Invalid link" });
  }

  return res.json({ content });
});

// DELETE SHARE LINK
app.delete("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { contentId } = req.body;

  const content = await ContentModel.findOne({
    _id: contentId,
    userId: req.userId,
  });

  if (!content) {
    return res.status(403).json({ message: "Not authorized" });
  }

  content.shareLink = null;
  await content.save();

  return res.json({ message: "Share removed" });
});

/* ================== SERVER ================== */

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
