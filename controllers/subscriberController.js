const subscriberModel = require("../models/subscriberModel");


exports.getAllSubscribers = async (req, res) => {
    try {

        const subscribers =
            await subscriberModel.getAllSubscribers();

        const formattedSubscribers = subscribers.map(subscriber => ({
            id: subscriber.id,
            email: subscriber.email,
            name: subscriber.name,
            registeredDate:
                subscriber.subscribed_at ||
                subscriber.created_at,
            status: subscriber.status
        }));

        return res.status(200).json({
            success: true,
            message: "Subscribers loaded successfully.",
            data: formattedSubscribers
        });

    } catch (error) {

        console.error(
            "GET SUBSCRIBERS ERROR:",
            error.code || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load subscribers.",
            data: null
        });
    }
};


exports.getSubscriber = async (req, res) => {
    try {

        const subscriber =
            await subscriberModel.getSubscriberById(
                req.params.id
            );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber not found.",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subscriber loaded successfully.",
            data: {
                id: subscriber.id,
                email: subscriber.email,
                name: subscriber.name,
                registeredDate:
                    subscriber.subscribed_at ||
                    subscriber.created_at,
                status: subscriber.status
            }
        });

    } catch (error) {

        console.error(
            "GET SUBSCRIBER ERROR:",
            error.code || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load subscriber.",
            data: null
        });
    }
};


exports.createSubscriber = async (req, res) => {
    try {

        let { email, name } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
                data: null
            });
        }

        email = email.trim().toLowerCase();

        if (name) {
            name = name.trim();
        } else {
            name = null;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
                data: null
            });
        }

        const existing =
            await subscriberModel.getSubscriberByEmail(email);

        if (existing) {

            if (existing.status === "unsubscribed") {

                await subscriberModel.updateSubscriberStatus(
                    existing.id,
                    "active"
                );

                return res.status(200).json({
                    success: true,
                    message: "Subscription reactivated.",
                    data: {
                        id: existing.id,
                        email,
                        status: "active"
                    }
                });
            }

            return res.status(409).json({
                success: false,
                message: "This email is already subscribed.",
                data: null
            });
        }

        const subscriber =
            await subscriberModel.createSubscriber(
                email,
                name
            );

        return res.status(201).json({
            success: true,
            message: "Successfully subscribed.",
            data: subscriber
        });

    } catch (error) {

        console.error(
            "CREATE SUBSCRIBER ERROR:",
            error.code || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to subscribe.",
            data: null
        });
    }
};


exports.updateStatus = async (req, res) => {
    try {

        const { status } = req.body;

        if (!["active", "unsubscribed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscriber status.",
                data: null
            });
        }

        const subscriber =
            await subscriberModel.getSubscriberById(
                req.params.id
            );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber not found.",
                data: null
            });
        }

        await subscriberModel.updateSubscriberStatus(
            req.params.id,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Subscriber status updated.",
            data: {
                status
            }
        });

    } catch (error) {

        console.error(
            "UPDATE SUBSCRIBER STATUS ERROR:",
            error.code || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update subscriber status.",
            data: null
        });
    }
};


exports.deleteSubscriber = async (req, res) => {
    try {

        const subscriber =
            await subscriberModel.getSubscriberById(
                req.params.id
            );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber not found.",
                data: null
            });
        }

        await subscriberModel.deleteSubscriber(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Subscriber removed successfully.",
            data: null
        });

    } catch (error) {

        console.error(
            "DELETE SUBSCRIBER ERROR:",
            error.code || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to remove subscriber.",
            data: null
        });
    }
};