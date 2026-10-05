jest.mock("../models/permissionModel", () => ({
    checkUserPermission: jest.fn()
}));

jest.mock("../models/userModel", () => ({
    isSuperAdmin: jest.fn()
}));

const permissionMiddleware =
    require("../middleware/permissionMiddleware");

const permissionModel =
    require("../models/permissionModel");

const userModel =
    require("../models/userModel");


describe("permissionMiddleware", () => {

    let req;
    let res;
    let next;

    beforeEach(() => {

        jest.clearAllMocks();

        req = {
            user: {
                id: 13
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
    });


    test("allows user when required permission is granted", () => {

        userModel.isSuperAdmin.mockImplementation(
            (userId, callback) => {
                callback(null, false);
            }
        );

        permissionModel.checkUserPermission.mockImplementation(
            (userId, permission, callback) => {
                callback(null, [
                    {
                        name: "manage_users"
                    }
                ]);
            }
        );

        const middleware =
            permissionMiddleware("manage_users");

        middleware(req, res, next);

        expect(
            userModel.isSuperAdmin
        ).toHaveBeenCalledWith(
            13,
            expect.any(Function)
        );

        expect(
            permissionModel.checkUserPermission
        ).toHaveBeenCalledWith(
            13,
            "manage_users",
            expect.any(Function)
        );

        expect(next).toHaveBeenCalledTimes(1);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });


    test("denies user when required permission is not granted", () => {

        userModel.isSuperAdmin.mockImplementation(
            (userId, callback) => {
                callback(null, false);
            }
        );

        permissionModel.checkUserPermission.mockImplementation(
            (userId, permission, callback) => {
                callback(null, []);
            }
        );

        const middleware =
            permissionMiddleware("manage_users");

        middleware(req, res, next);

        expect(
            permissionModel.checkUserPermission
        ).toHaveBeenCalledWith(
            13,
            "manage_users",
            expect.any(Function)
        );

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Forbidden. Permission denied."
        });

        expect(next).not.toHaveBeenCalled();
    });


    test("allows Super Admin without checking the requested permission", () => {

        userModel.isSuperAdmin.mockImplementation(
            (userId, callback) => {
                callback(null, true);
            }
        );

        const middleware =
            permissionMiddleware("manage_users");

        middleware(req, res, next);

        expect(
            userModel.isSuperAdmin
        ).toHaveBeenCalledWith(
            13,
            expect.any(Function)
        );

        expect(
            permissionModel.checkUserPermission
        ).not.toHaveBeenCalled();

        expect(next).toHaveBeenCalledTimes(1);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });


    test("returns 401 when req.user is missing", () => {

        req.user = undefined;

        const middleware =
            permissionMiddleware("manage_users");

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Authentication required"
        });

        expect(
            userModel.isSuperAdmin
        ).not.toHaveBeenCalled();

        expect(
            permissionModel.checkUserPermission
        ).not.toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
    });


    test("returns 500 when permission name is invalid", () => {

        const middleware =
            permissionMiddleware("   ");

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Permission configuration error"
        });

        expect(
            userModel.isSuperAdmin
        ).not.toHaveBeenCalled();

        expect(
            permissionModel.checkUserPermission
        ).not.toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
    });


    test("returns 500 when Super Admin verification fails", () => {

        userModel.isSuperAdmin.mockImplementation(
            (userId, callback) => {
                callback(
                    new Error("Database error"),
                    false
                );
            }
        );

        const middleware =
            permissionMiddleware("manage_users");

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unable to verify permissions"
        });

        expect(next).not.toHaveBeenCalled();

        expect(
            permissionModel.checkUserPermission
        ).not.toHaveBeenCalled();
    });


    test("returns 500 when permission verification fails", () => {

        userModel.isSuperAdmin.mockImplementation(
            (userId, callback) => {
                callback(null, false);
            }
        );

        permissionModel.checkUserPermission.mockImplementation(
            (userId, permission, callback) => {
                callback(
                    new Error("Database error"),
                    null
                );
            }
        );

        const middleware =
            permissionMiddleware("manage_users");

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unable to verify permissions"
        });

        expect(next).not.toHaveBeenCalled();
    });

});