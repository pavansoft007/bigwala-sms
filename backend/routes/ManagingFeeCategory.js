import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import FeeCategory from "../models/FeeCategory.js";

const ManagingFeeCategory=express.Router();

ManagingFeeCategory.post('/api/fee_category',AdminAuth('fee'),async (req,res)=>{
    const { category_name }=req.body;
    const school_id=req['sessionData']['school_id'];
    try{
        const newCategory=await FeeCategory.create({
            school_id,
            category_name
        })
        res.status(204).json(newCategory);

    }catch (e) {
        console.error('Error fetching students:', e);
        res.status(500).json({message: 'An error occurred while saving the fee category',});
    }
});

export default ManagingFeeCategory;