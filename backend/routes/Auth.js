import express from 'express';

const Auth=express.Router();

Auth.get('/', (req, res)=>{
   res.send({message:"hello there"});
});

Auth.post('/otp-request',(req, res)=>{
   const otp = Math.floor(100000 + Math.random() * 900000).toString();

   const {phone}=req.body;



});

Auth.post('/otp-verify',(req, res)=>{

});

export default Auth;