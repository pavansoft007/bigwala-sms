import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SemiAdminAuth = (required) => {
    return async (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(403).json({ message: 'No token provided' });

        try {
            const bearerToken = token.split(' ')[1];
            if (!bearerToken) return res.status(403).json({ message: 'No token provided' });

            const tokenDetails = await jwt.verify(bearerToken, process.env.JWTKEY);

            if (tokenDetails.role === 'admin') {
                const results = await prisma.$queryRaw`SELECT permissions,r.role_name FROM admins INNER JOIN roles r ON r.role_id=admins.role_id WHERE admin_id=${tokenDetails['id']}`;
                if (results.length > 0 && results[0]['role_name'] === 'admin') {
                    req['sessionData'] = tokenDetails;
                    return next();
                }
                
                const permissions = results.length > 0 ? results[0]['permissions'] : [];
                for (const item of permissions) {
                    if (item === required) {
                        req['sessionData'] = tokenDetails;
                        return next();
                    }
                }

                return res.status(404).json({});

            } else if (tokenDetails.role === 'teacher-admin') {
                req['sessionData'] = tokenDetails;
                return next();
            } else {
                return res.status(403).json({ message: 'You do not have access' });
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