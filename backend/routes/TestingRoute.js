import express from "express";
import semiAdminAuth from "../middleware/semiAdminAuth.js";

const TestingRoute=express.Router();

TestingRoute.get('/testing',semiAdminAuth('gallery'),(req, res)=>{
    res.status(200).json({ message:"hello there" });
});
export default TestingRoute;