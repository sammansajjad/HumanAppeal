
jest.mock("../models/db", () => ({
    query: jest.fn()
}));

const db = require("../models/db");

const menuItemModel =
    require("../models/menuItemModel");


describe("menuItemModel soft-delete, restore, and timestamps", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    // =====================================================
    // UPDATE MENU ITEM
    // =====================================================

    test("updateItem sets updated_at and only updates non-deleted items", async () => {

        db.query.mockImplementation(
            (sql, params, callback) => {

                expect(sql).toContain(
                    "updated_at = NOW()"
                );

                expect(sql).toContain(
                    "WHERE id = ?"
                );

                expect(sql).toContain(
                    "AND deleted_at IS NULL"
                );

                expect(params).toEqual([
                    10,
                    null,
                    "Home",
                    null,
                    "custom",
                    "/",
                    "_self",
                    0,
                    1,
                    13
                ]);

                callback(null, {
                    affectedRows: 1
                });

            }
        );

        const result =
            await menuItemModel.updateItem(
                13,
                {
                    menu_id: 10,
                    parent_id: null,
                    label_en: "Home",
                    label_ur: null,
                    type: "custom",
                    url: "/",
                    target: "_self",
                    sort_order: 0,
                    is_active: 1
                }
            );

        expect(result).toEqual({
            affectedRows: 1
        });

        expect(db.query)
            .toHaveBeenCalledTimes(1);
    });


    // =====================================================
    // DELETE MENU ITEM
    // =====================================================

    test("deleteItem sets deleted_at and only targets non-deleted items", async () => {

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

        const result =
            await menuItemModel.deleteItem(13);

        expect(result).toEqual({
            affectedRows: 1
        });

        expect(db.query)
            .toHaveBeenCalledTimes(1);
    });


    // =====================================================
    // RESTORE MENU ITEM
    // =====================================================

    test("restoreMenuItem clears deleted_at, updates timestamp, and only targets deleted items", async () => {

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

        const result =
            await menuItemModel.restoreMenuItem(13);

        expect(result).toEqual({
            affectedRows: 1
        });

        expect(db.query)
            .toHaveBeenCalledTimes(1);
    });

});
