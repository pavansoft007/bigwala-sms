import jwt from "jsonwebtoken";
import sequelize from "../config/database.js";
const SemiAdminAuth = (required) => {
    return async (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(403).json({ message: 'No token provided' });

        try {
            const bearerToken = token.split(' ')[1];
            if (!bearerToken) return res.status(403).json({ message: 'No token provided' });

            const tokenDetails = await jwt.verify(bearerToken, process.env.JWTKEY);



            if ( tokenDetails.role === 'admin') {
                const [result]=await sequelize.query('SELECT permissions,r.role_name FROM admins INNER  JOIN roles r ON r.role_id=admins.role_id WHERE admin_id='+tokenDetails['id']);
                if(result[0]['role_name'] === 'admin' ){
                    req['sessionData'] = tokenDetails;
                    return next();
                }
                const permissions=result[0]['permissions'];
                permissions.forEach((item)=>{
                    if(item === required){
                        req['sessionData'] = tokenDetails;
                        next();
                    }
                })

                return res.status(404).json({});

            }else if(tokenDetails.role === 'teacher-admin'){
                req['sessionData'] = tokenDetails;
                next();
            }
            else {
                res.status(403).json({ message: 'You do not have access' });
            }
        } catch (e) {
            console.log(e);
            if (e.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token has expired" });
            }
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
    };
};

export default SemiAdminAuth;