import type{ NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";

export const userMiddleware = (req:Request,res:Response,next:NextFunction) =>{

    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_PASSWORD)
    if(decoded){
      //@ts-ignore (to tacke errors in typescript)
      req.userId = decoded.id; //solution -> extend the Request type.
      next(); //call the next middle ware
    }else{
        res.status(403).json({
            message: "You're not logged in"
        })
    }
}