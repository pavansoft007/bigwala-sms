import express from "express";

const Attendance=express.Router();

Attendance.get('/mobileAPI/attendance',(req, res)=>{

    res.send('Attendance');
});

export default Attendance;
