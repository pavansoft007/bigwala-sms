import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";

const TestingRoute=express.Router();

TestingRoute.get('/testing',AdminAuth,(req, res)=>{
    res.status(200).json({});
});
export default TestingRoute;