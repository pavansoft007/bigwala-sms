import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";

const TestingRoute=express.Router();

TestingRoute.get('/testing',(req, res)=>{
    res.status(200).json({ message:"hello there" });
});
export default TestingRoute;