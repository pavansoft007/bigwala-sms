import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import Fee_type from "../models/Fee_type.js";

const ManagingFeeTypes = express.Router();

ManagingFeeTypes.post('/api/fee_type', AdminAuth('exam timetable'), async (req, res) => {
    const { fee_type_name, description, standard, fee } = req.body;
    const school_id = req['sessionData']['school_id'];
    try {
        const newFeeType = await Fee_type.create({
            school_id,
            fee_type_name,
            description,
            standard,
            fee
        });
        res.json(newFeeType);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in saving the new fee type' });
    }
});


ManagingFeeTypes.get('/api/fee_type', AdminAuth('exam timetable'), async (req, res) => {
    const school_id = req['sessionData']['school_id'];
    try {
        const feeTypes = await Fee_type.findAll({
            where: { school_id }
        });
        res.json(feeTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in fetching fee types' });
    }
});


ManagingFeeTypes.put('/api/fee_type/:id', AdminAuth('exam timetable'), async (req, res) => {
    const { id } = req.params;
    const { fee_type_name, description, standard, fee } = req.body;
    const school_id = req['sessionData']['school_id'];
    try {
        const feeType = await Fee_type.findOne({
            where: { id, school_id }
        });

        if (!feeType) {
            return res.status(404).json({ message: 'Fee type not found' });
        }

        await feeType.update({
            fee_type_name,
            description,
            standard,
            fee
        });

        res.json({ message: 'Fee type updated successfully', feeType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in updating fee type' });
    }
});


ManagingFeeTypes.delete('/api/fee_type/:id', AdminAuth('exam timetable'), async (req, res) => {
    const { id } = req.params;
    const school_id = req['sessionData']['school_id'];
    try {
        const feeType = await Fee_type.findOne({
            where: { id, school_id }
        });

        if (!feeType) {
            return res.status(404).json({ message: 'Fee type not found' });
        }

        await feeType.destroy();
        res.json({ message: 'Fee type deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in deleting fee type' });
    }
});

export default ManagingFeeTypes;
