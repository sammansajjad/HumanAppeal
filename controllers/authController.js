const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");
const permissionModel = require("../models/permissionModel");

const { generateToken } = require("../utils/jwt");

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {

    try {

        // -------------------------------------------------
        // INPUT
        // -------------------------------------------------

        let { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // -------------------------------------------------
        // NORMALIZE EMAIL
        // -------------------------------------------------

        email = email.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // -------------------------------------------------
        // BASIC EMAIL VALIDATION
        // -------------------------------------------------

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        const results = await new Promise((resolve, reject) => {

            userModel.findByEmail(email, (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(results);

            });

        });

        // -------------------------------------------------
        // USER NOT FOUND / INACTIVE
        // -------------------------------------------------
        // findByEmail() only returns non-deleted, active users.
        // Therefore an inactive user is intentionally handled
        // as an authentication failure here.

        if (!results || results.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        const user = results[0];

        // -------------------------------------------------
        // PASSWORD HASH
        // -------------------------------------------------

        if (
            typeof user.password !== "string" ||
            !user.password
        ) {

            console.error(
                `Invalid password hash for user ID ${user.id}`
            );

            return res.status(500).json({
                success: false,
                message: "Unable to authenticate user"
            });

        }

        // -------------------------------------------------
        // BCRYPT COMPATIBILITY
        // -------------------------------------------------

        const hash =
            user.password.startsWith("$2y$")
                ? user.password.replace("$2y$", "$2b$")
                : user.password;

        // -------------------------------------------------
        // PASSWORD VERIFICATION
        // -------------------------------------------------

        const passwordMatches =
            await bcrypt.compare(password, hash);

        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // -------------------------------------------------
        // LOAD PERMISSIONS
        // -------------------------------------------------

        const permissions =
            await permissionModel.getUserPermissions(user.id);

        // -------------------------------------------------
        // GENERATE JWT
        // -------------------------------------------------

        const token = generateToken(user);

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                role_ids: user.role_ids,
                permissions
            }

        });

    } catch (error) {

        // -------------------------------------------------
        // SERVER-SIDE LOGGING
        // -------------------------------------------------

        console.error(
            "Login error:",
            error.code || error.message
        );

        // -------------------------------------------------
        // SAFE CLIENT RESPONSE
        // -------------------------------------------------

        return res.status(500).json({
            success: false,
            message: "Unable to process login"
        });

    }

};

// =====================================================
// CURRENT USER
// =====================================================

const me = async (req, res) => {

    try {

        const authUser = req.user;

        if (!authUser || !authUser.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // -------------------------------------------------
        // LOAD CURRENT USER
        // -------------------------------------------------

        const user = await new Promise((resolve, reject) => {

            userModel.getUserById(
                authUser.id,
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    if (!results || results.length === 0) {
                        return resolve(null);
                    }

                    resolve(results[0]);
                }
            );

        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // -------------------------------------------------
        // VERIFY ACCOUNT IS ACTIVE
        // -------------------------------------------------

        if (Number(user.is_active) !== 1) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // -------------------------------------------------
        // LOAD CURRENT PERMISSIONS
        // -------------------------------------------------

        const permissions =
            await permissionModel.getUserPermissions(user.id);

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                role_ids: user.role_ids,
                permissions
            }

        });

    } catch (error) {

        console.error(
            "Auth /me error:",
            error.code || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve user information"
        });

    }

};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    login,
    me
};