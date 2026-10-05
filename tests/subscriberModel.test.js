
jest.mock("../models/db", () => ({
    promise: jest.fn()
}));

const db = require("../models/db");

const subscriberModel =
    require("../models/subscriberModel");


describe("subscriberModel status, soft-delete, and timestamps", () => {

    let execute;

    beforeEach(() => {

        jest.clearAllMocks();

        execute = jest.fn();

        db.promise.mockReturnValue({
            execute
        });

    });


    // =====================================================
    // ACTIVE STATUS
    // =====================================================

    test("updateSubscriberStatus active sets updated_at and only updates non-deleted subscribers", async () => {

        execute.mockResolvedValue([
            {
                affectedRows: 1
            }
        ]);

        const result =
            await subscriberModel.updateSubscriberStatus(
                13,
                "active"
            );

        expect(execute).toHaveBeenCalledTimes(1);

        const [sql, params] =
            execute.mock.calls[0];

        expect(sql).toContain(
            "status = 'active'"
        );

        expect(sql).toContain(
            "subscribed_at = NOW()"
        );

        expect(sql).toContain(
            "unsubscribed_at = NULL"
        );

        expect(sql).toContain(
            "updated_at = NOW()"
        );

        expect(sql).toContain(
            "WHERE id = ?"
        );

        expect(sql).toContain(
            "AND deleted_at IS NULL"
        );

        expect(params).toEqual([13]);

        expect(result).toEqual({
            affectedRows: 1
        });

    });


    // =====================================================
    // UNSUBSCRIBED STATUS
    // =====================================================

    test("updateSubscriberStatus unsubscribed sets updated_at and only updates non-deleted subscribers", async () => {

        execute.mockResolvedValue([
            {
                affectedRows: 1
            }
        ]);

        const result =
            await subscriberModel.updateSubscriberStatus(
                13,
                "unsubscribed"
            );

        expect(execute).toHaveBeenCalledTimes(1);

        const [sql, params] =
            execute.mock.calls[0];

        expect(sql).toContain(
            "status = 'unsubscribed'"
        );

        expect(sql).toContain(
            "unsubscribed_at = NOW()"
        );

        expect(sql).toContain(
            "updated_at = NOW()"
        );

        expect(sql).toContain(
            "WHERE id = ?"
        );

        expect(sql).toContain(
            "AND deleted_at IS NULL"
        );

        expect(params).toEqual([13]);

        expect(result).toEqual({
            affectedRows: 1
        });

    });


    // =====================================================
    // SOFT DELETE
    // =====================================================

    test("deleteSubscriber sets deleted_at and only targets non-deleted subscribers", async () => {

        execute.mockResolvedValue([
            {
                affectedRows: 1
            }
        ]);

        const result =
            await subscriberModel.deleteSubscriber(13);

        expect(execute).toHaveBeenCalledTimes(1);

        const [sql, params] =
            execute.mock.calls[0];

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

        expect(result).toEqual({
            affectedRows: 1
        });

    });

});