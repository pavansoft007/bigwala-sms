import jwt from "jsonwebtoken";

const otpTokenVerification = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const bearerToken = token.split(' ')[1];
        console.log('Bearer Token:', bearerToken); // For debugging
        if (!bearerToken) return res.status(403).json({ message: 'No token provided' });

        const tokenDetails = await jwt.verify(bearerToken, process.env.JWTKEY);
        console.log('Decoded Token Details:', tokenDetails); // For debugging

        if (tokenDetails) {
            req['tokenDetails'] = tokenDetails; 
            next();
        } else {
            res.status(403).json({ message: "You don't have access" });
        }
    } catch (e) {
        console.error('Token verification failed:', e); 
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

export default otpTokenVerification;
