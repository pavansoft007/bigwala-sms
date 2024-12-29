import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import FeeCategory from "../models/FeeCategory.js";

const ManagingFeeCategory = express.Router();

// Create a new fee category
ManagingFeeCategory.post('/api/fee_category', AdminAuth('fee'), async (req, res) => {
    const { category_name } = req.body;
    const school_id = req['sessionData']['school_id'];
    try {
        const newCategory = await FeeCategory.create({
            school_id,
            category_name
        });
        res.status(201).json(newCategory);
    } catch (e) {
        console.error('Error saving fee category:', e);
        res.status(500).json({ message: 'An error occurred while saving the fee category.' });
    }
});

// Get all fee categories for a school
ManagingFeeCategory.get('/api/fee_category', AdminAuth('fee'), async (req, res) => {
    const school_id = req['sessionData']['school_id'];
    try {
        const categories = await FeeCategory.findAll({
            where: { school_id },
            attributes:['category_id','category_name','description']
        });
        res.status(200).json(categories);
    } catch (e) {
        console.error('Error fetching fee categories:', e);
        res.status(500).json({ message: 'An error occurred while fetching the fee categories.' });
    }
});

// Update a fee category by ID
ManagingFeeCategory.put('/api/fee_category/:id', AdminAuth('fee'), async (req, res) => {
    const { id } = req.params;
    const { category_name } = req.body;
    const school_id = req['sessionData']['school_id'];

    try {
        const category = await FeeCategory.findOne({
            where: { category_id:id, school_id },
        });

        if (!category) {
            return res.status(404).json({ message: 'Fee category not found.' });
        }

        category.category_name = category_name;
        await category.save();

        res.status(200).json({ message: 'Fee category updated successfully.', category });
    } catch (e) {
        console.error('Error updating fee category:', e);
        res.status(500).json({ message: 'An error occurred while updating the fee category.' });
    }
});

// Delete a fee category by ID
ManagingFeeCategory.delete('/api/fee_category/:category_id', AdminAuth('fee'), async (req, res) => {
    const { category_id } = req.params;
    const school_id = req['sessionData']['school_id'];

    try {
        const category = await FeeCategory.findOne({
            where: { category_id, school_id },
        });

        if (!category) {
            return res.status(404).json({ message: 'Fee category not found.' });
        }

        await category.destroy();
        res.status(200).json({ message: 'Fee category deleted successfully.' });
    } catch (e) {
        console.error('Error deleting fee category:', e);
        res.status(500).json({ message: 'An error occurred while deleting the fee category.' });
    }
});

export default ManagingFeeCategory;
