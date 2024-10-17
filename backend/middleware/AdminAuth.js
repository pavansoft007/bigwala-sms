import jwt from "jsonwebtoken";
const AdminAuth = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try{
        const tokenDetails=await jwt.verify(token,process.env.JWTKEY);
        if(tokenDetails.role=== 'admin'){
            req['sessionData']=tokenDetails;
            next();
        }else{
            res.status(403).json({message:"you dont have access"});
        }

    }catch (e) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

export default AdminAuth;