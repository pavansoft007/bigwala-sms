import jwt from "jsonwebtoken";
import sequelize from "../config/database.js";

const AdminAuth = (required) => {
    return async (req, res, next) => {
        const token = req.headers["authorization"];
        if (!token) return res.status(403).json({ message: "No token provided" });
        try {
            const bearerToken = token.split(" ")[1];
            if (!bearerToken) return res.status(403).json({ message: "No token provided" });

            const tokenDetails = await jwt.verify(bearerToken, process.env.JWTKEY);
            if (tokenDetails.role === "admin") {
                if (required === "all") {
                    req["sessionData"] = tokenDetails;
                    return next();
                }
                const [result] = await sequelize.query(
                    `SELECT permissions, r.role_name 
                     FROM admins 
                     INNER JOIN roles r ON r.role_id = admins.role_id 
                     WHERE admin_id = :adminId`,
                    {
                        replacements: { adminId: tokenDetails.id },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

                if (result["role_name"] === "admin") {
                    req["sessionData"] = tokenDetails;
                    return next();
                }

                const permissions = result["permissions"];
                for (const item of permissions) {
                    if (item === required) {
                        req["sessionData"] = tokenDetails;
                        return next();
                    }
                }

                return res.status(403).json({ message: "Access denied for this operation" });
            } else {
                return res.status(403).json({ message: "You do not have access" });
            }
        } catch (e) {
            if (e.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token has expired" });
            }
            console.error(e);
            return res.status(500).json({ message: "Failed to authenticate token" });
        }
    };
};

export default AdminAuth;