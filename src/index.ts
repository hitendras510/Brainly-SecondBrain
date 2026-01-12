import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "./db.js";
import { ContentModel } from "./db.js";
import {userMiddleware} from "./middleware.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import { JWT_PASSWORD } from "./config.js";

const app = express();
app.use(express.json());

// zod validation
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

app.post("/api/v1/signup", async (req, res) => {
  try {
    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues,
      });
    }

    const { username, password } = result.data;

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username: username,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username,
    password
  });
  if(existingUser){
    const token = jwt.sign({
      id: existingUser._id
    },JWT_PASSWORD);

    res.json({
      token
    })
  }else{
    res.status(403).json({
      message: "Incorrect credenetials"
    })
  }
  res.json({ message: "Signin route" });
});


app.post("/api/v1/content",userMiddleware, async (req, res) => {
  const {link,type} = req.body;
  await ContentModel.create({
    link,
    //@ts-ignore
    type,
    //@ts-ignore
    userId: req.userId,
    tags: [],
  });
  return res.json({ message: "Content created" });
});

app.get("/api/v1/content",userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId: userId
  }).populate("userId","username") //bring userId (by whom it was created), {select}
  return res.json({
   content,
  message: "Content fetched"
   });
});

app.delete("/api/v1/content", async (req, res) => {
  res.json({ message: "Content deleted" });
});

app.delete("/api/v1/brain/share", async (req, res) => {
  res.json({ message: "Share deleted" });
});

app.get("/api/v1/brain/share/:shareLink", async (req, res) => {
  const shareLink = req.params.shareLink;
  res.json({ message: "Shared link accessed", shareLink });
});

app.listen(3000);