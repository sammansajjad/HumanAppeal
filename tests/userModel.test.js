
jest.mock("../models/db", () => ({
    query: jest.fn()
}));

const db = require("../models/db");

const userModel =
    require("../models/userModel");


describe("userModel soft-delete, restore, and timestamps", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    // =====================================================
    // UPDATE USER
    // =====================================================

    test("updateUser sets updated_at and does not update soft-deleted users", done => {

        db.query.mockImplementation(
            (sql, params, callback) => {

                callback(null, {
                    affectedRows: 1
                });

            }
        );

        /*
         * updateUser uses db.getConnection(), so mock the
         * connection separately for the transactional flow.
         */

        db.getConnection = jest.fn((callback) => {

            const connection = {

                beginTransaction: jest.fn((cb) => cb(null)),

                query: jest.fn((sql, params, cb) => {

                    if (sql.includes("UPDATE users")) {

                        expect(sql).toContain(
                            "updated_at = NOW()"
                        );

                        expect(sql).toContain(
                            "WHERE id = ?"
                        );

                        expect(sql).toContain(
                            "AND deleted_at IS NULL"
                        );

                        cb(null, {
                            affectedRows: 1
                        });

                        return;
                    }

                    if (sql.includes("DELETE FROM model_has_roles")) {

                        cb(null, {
                            affectedRows: 0
                        });

                        return;
                    }

                }),

                commit: jest.fn((cb) => cb(null)),

                rollback: jest.fn((cb) => cb(null)),

                release: jest.fn()

            };

            callback(null, connection);

        });


        userModel.updateUser(
            13,
            "Test User",
            "test@example.com",
            null,
            1,
            [],
            (err, result) => {

                expect(err).toBeNull();

                expect(result).toEqual({
                    affectedRows: 1
                });

                done();

            }
        );

    });


    // =====================================================
    // DELETE USER
    // =====================================================

    test("deleteUser sets deleted_at and only targets non-deleted users", done => {

        db.query.mockImplementation(
            (sql, params, callback) => {

                expect(sql).toContain(
                    "SET deleted_at = NOW()"
                );

                expect(sql).toContain(
                    "WHERE id = ?"
                );

                expect(sql).toContain(
                    "AND deleted_at IS NULL"
                );

                expect(params).toEqual([13]);

                callback(null, {
                    affectedRows: 1
                });

            }
        );


        userModel.deleteUser(
            13,
            (err, result) => {

                expect(err).toBeNull();

                expect(result).toEqual({
                    affectedRows: 1
                });

                expect(db.query)
                    .toHaveBeenCalledTimes(1);

                done();

            }
        );

    });


    // =====================================================
    // RESTORE USER
    // =====================================================

    test("restoreUser clears deleted_at, updates timestamp, and only targets deleted users", done => {

        db.query.mockImplementation(
            (sql, params, callback) => {

                expect(sql).toContain(
                    "deleted_at = NULL"
                );

                expect(sql).toContain(
                    "updated_at = NOW()"
                );

                expect(sql).toContain(
                    "WHERE id = ?"
                );

                expect(sql).toContain(
                    "AND deleted_at IS NOT NULL"
                );

                expect(params).toEqual([13]);

                callback(null, {
                    affectedRows: 1
                });

            }
        );


        userModel.restoreUser(
            13,
            (err, result) => {

                expect(err).toBeNull();

                expect(result).toEqual({
                    affectedRows: 1
                });

                expect(db.query)
                    .toHaveBeenCalledTimes(1);

                done();

            }
        );

    });

});