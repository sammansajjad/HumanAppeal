process.env.JWT_SECRET =
    "test-secret-that-is-at-least-32-characters-long";

jest.mock("../models/userModel", () => ({
    isUserActive: jest.fn()
}));

const jwt = require("jsonwebtoken");

const authenticateToken =
    require("../middleware/authMiddleware");

const userModel =
    require("../models/userModel");


describe("authMiddleware", () => {

    let req;
    let res;
    let next;

    const JWT_SECRET =
        process.env.JWT_SECRET;

    beforeEach(() => {

        jest.clearAllMocks();

        req = {
            headers: {
                authorization: ""
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
    });


    // =====================================================
    // EXPIRED TOKEN
    // =====================================================

    test("returns 401 for an expired token", () => {

        const expiredToken = jwt.sign(
            {
                id: 13,
                role: "Admin"
            },
            JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: -10
            }
        );

        req.headers.authorization =
            `Bearer ${expiredToken}`;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Authentication token expired"
        });

        expect(next).not.toHaveBeenCalled();

        expect(
            userModel.isUserActive
        ).not.toHaveBeenCalled();
    });


    // =====================================================
    // MALFORMED TOKEN
    // =====================================================

    test("returns 401 for a malformed token", () => {

        req.headers.authorization =
            "Bearer this-is-not-a-valid-jwt";

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid authentication token"
        });

        expect(next).not.toHaveBeenCalled();

        expect(
            userModel.isUserActive
        ).not.toHaveBeenCalled();
    });


    // =====================================================
    // DEACTIVATED USER
    // =====================================================

    test("returns 401 when the authenticated user is deactivated", () => {

        const token = jwt.sign(
            {
                id: 13,
                role: "Admin"
            },
            JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "1h"
            }
        );

        req.headers.authorization =
            `Bearer ${token}`;

        userModel.isUserActive.mockImplementation(
            (userId, callback) => {
                callback(null, false);
            }
        );

        authenticateToken(req, res, next);

        expect(
            userModel.isUserActive
        ).toHaveBeenCalledWith(
            13,
            expect.any(Function)
        );

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Authentication required"
        });

        expect(next).not.toHaveBeenCalled();
    });

});