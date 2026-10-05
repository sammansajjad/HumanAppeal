const permissionModel = require("../models/permissionModel");
const userModel = require("../models/userModel");

const permissionMiddleware = (permissionName) => {

    return (req, res, next) => {

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (
            typeof permissionName !== "string" ||
            !permissionName.trim()
        ) {
            return res.status(500).json({
                success: false,
                message: "Permission configuration error"
            });
        }

        const permission = permissionName.trim();

        userModel.isSuperAdmin(
            req.user.id,
            (err, isSuperAdmin) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to verify permissions"
                    });
                }

                // Super Admin bypass
                if (isSuperAdmin) {
                    return next();
                }

                // Normal permission check
                permissionModel.checkUserPermission(
                    req.user.id,
                    permission,
                    (err, results) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Unable to verify permissions"
                            });
                        }

                        if (
                            !Array.isArray(results) ||
                            results.length === 0
                        ) {
                            return res.status(403).json({
                                success: false,
                                message: "Forbidden. Permission denied."
                            });
                        }

                        return next();
                    }
                );
            }
        );
    };
};

module.exports = permissionMiddleware;