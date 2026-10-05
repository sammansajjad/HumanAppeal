
process.env.JWT_SECRET =
    "test-secret-that-is-at-least-32-characters-long";

jest.mock("../models/userModel", () => ({
    findByEmail: jest.fn()
}));

jest.mock("../models/permissionModel", () => ({
    getUserPermissions: jest.fn()
}));

jest.mock("../utils/jwt", () => ({
    generateToken: jest.fn()
}));

const bcrypt = require("bcrypt");

const authController =
    require("../controllers/authController");

const userModel =
    require("../models/userModel");

const permissionModel =
    require("../models/permissionModel");

const { generateToken } =
    require("../utils/jwt");


describe("authController.login", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        req = {
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

    });


    // =====================================================
    // UNKNOWN EMAIL
    // =====================================================

    test("returns 401 for an unknown email", async () => {

        req.body = {
            email: "unknown@example.com",
            password: "CorrectPassword123"
        };

        userModel.findByEmail.mockImplementation(
            (email, callback) => {
                callback(null, []);
            }
        );

        await authController.login(req, res);

        expect(
            userModel.findByEmail
        ).toHaveBeenCalledWith(
            "unknown@example.com",
            expect.any(Function)
        );

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid email or password"
        });

        expect(permissionModel.getUserPermissions)
            .not.toHaveBeenCalled();

        expect(generateToken)
            .not.toHaveBeenCalled();
    });


    // =====================================================
    // WRONG PASSWORD
    // =====================================================

    test("returns 401 for an incorrect password", async () => {

        req.body = {
            email: "admin@example.com",
            password: "WrongPassword123"
        };

        userModel.findByEmail.mockImplementation(
            (email, callback) => {

                callback(null, [
                    {
                        id: 13,
                        name: "Admin User",
                        email: "admin@example.com",
                        password:
                            "$2b$10$abcdefghijklmnopqrstuu" +
                            "abcdefghijklmnopqrstuuuu",
                        roles: ["Admin"],
                        role_ids: [2]
                    }
                ]);

            }
        );

        jest.spyOn(
            bcrypt,
            "compare"
        ).mockResolvedValue(false);

        await authController.login(req, res);

        expect(
            bcrypt.compare
        ).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid email or password"
        });

        expect(permissionModel.getUserPermissions)
            .not.toHaveBeenCalled();

        expect(generateToken)
            .not.toHaveBeenCalled();

        bcrypt.compare.mockRestore();
    });


    // =====================================================
    // INACTIVE ACCOUNT
    // =====================================================

    test("returns 401 for an inactive account", async () => {

        req.body = {
            email: "inactive@example.com",
            password: "CorrectPassword123"
        };

        /*
         * findByEmail() intentionally filters inactive users
         * with:
         *
         * AND u.is_active = 1
         *
         * Therefore an inactive account produces no result
         * and login returns the same generic authentication
         * failure as an unknown email.
         */

        userModel.findByEmail.mockImplementation(
            (email, callback) => {
                callback(null, []);
            }
        );

        await authController.login(req, res);

        expect(
            userModel.findByEmail
        ).toHaveBeenCalledWith(
            "inactive@example.com",
            expect.any(Function)
        );

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid email or password"
        });

        expect(permissionModel.getUserPermissions)
            .not.toHaveBeenCalled();

        expect(generateToken)
            .not.toHaveBeenCalled();
    });

});

