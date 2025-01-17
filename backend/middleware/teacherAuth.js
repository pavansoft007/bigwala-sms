import jwt from "jsonwebtoken";
import sequelize from "../config/database.js";

const teacherAdminAuth = (requiredPermission) => {
    return async (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }

        try {
            const bearerToken = token.split(' ')[1];
            if (!bearerToken) {
                return res.status(403).json({ message: 'No token provided' });
            }

            const tokenDetails = await jwt.verify(bearerToken, process.env.JWTKEY);

            
            if (tokenDetails.role === 'admin') {
                const [result] = await sequelize.query(
                    'SELECT permissions, r.role_name FROM admins INNER JOIN roles r ON r.role_id = admins.role_id WHERE admin_id = :adminId',
                    {
                        replacements: { adminId: tokenDetails.id },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

                if (result && result.role_name === 'admin') {
                    req.sessionData = tokenDetails;
                    return next();
                }

                const permissions = result.permissions || [];
                if (permissions.includes(requiredPermission)) {
                    req.sessionData = tokenDetails;
                    return next();
                }

                return res.status(403).json({ message: 'Permission denied' });

            } else if (tokenDetails.role === 'teacher-admin' || tokenDetails.role === 'teacher') {
                req.sessionData = tokenDetails;
                return next();
            } else {
                return res.status(403).json({ message: 'You do not have access' });
            }

        } catch (e) {
            console.error(e);
            if (e.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token has expired" });
            }
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
    };
};

export default teacherAdminAuth;