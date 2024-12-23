import jwt from "jsonwebtoken";
const StudentAuth = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try{
        const bearerToken = token.split(' ')[1];
        if (!bearerToken) return res.status(403).json({ message: 'No token provided' });
        const tokenDetails=await jwt.verify(bearerToken,process.env.JWTKEY);

        if(tokenDetails.role=== 'student'){
            req['sessionData']=tokenDetails;
            next();
        }else{
            res.status(403).json({message:"you dont have access"});
        }

    }catch (e) {
        if (e.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token has expired" });
        }
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

export default StudentAuth;