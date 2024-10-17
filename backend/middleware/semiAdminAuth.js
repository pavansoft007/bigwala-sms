import jwt from "jsonwebtoken";
const SemiAdminAuth = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try{
        const tokenDetails=await jwt.verify(token,process.env.JWTKEY);
        console.log(tokenDetails);
        if(tokenDetails.role=== 'admin' && tokenDetails.role === 'teacher-admin' ){
            next();
        }else{
            res.status(403).json({message:"you dont have access"});
        }

    }catch (e) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

export default SemiAdminAuth;