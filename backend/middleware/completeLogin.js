import jwt from "jsonwebtoken";
const TeacherAuth = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try{
        const bearerToken = token.split(' ')[1];
        if (!bearerToken) return res.status(403).json({ message: 'No token provided' });

        const tokenDetails=await jwt.verify(bearerToken,process.env.JWTKEY);
        if(tokenDetails.role=== 'admin' || tokenDetails.role === 'teacher-admin' || tokenDetails.role === 'teacher' ||
            tokenDetails.role === 'student' ){
            req['sessionData']=tokenDetails;
            next();
        }else{
            res.status(403).json({message:"you dont have access"});
        }

    }catch (e) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

export default TeacherAuth;