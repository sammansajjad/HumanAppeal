const nodemailer = require("nodemailer");
const inquiryModel = require("../models/inquiryModel");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const createInquiry = (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    inquiryModel.createInquiry(
        { name, email, subject, message },
        (err, result) => {
            if (err) {
                console.error("CREATE INQUIRY ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to submit inquiry."
                });
            }

            transporter.sendMail(
                {
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_TO,
                    replyTo: email,
                    subject: `New Inquiry: ${subject}`,
                    text: `From: ${name} (${email})\n\n${message}`
                },
                (mailErr) => {
                    if (mailErr) {
                        console.error(
                            "INQUIRY EMAIL ERROR:",
                            mailErr
                        );
                    } else {
                        console.log("Notification email sent.");
                    }
                }
            );

            return res.status(201).json({
                success: true,
                message: "Inquiry submitted successfully.",
                id: result.insertId
            });
        }
    );
};

const getAllInquiries = (req, res) => {
    inquiryModel.getAllInquiries((err, results) => {
        if (err) {
            console.error("GET ALL INQUIRIES ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch inquiries."
            });
        }

        return res.status(200).json({
            success: true,
            data: results
        });
    });
};

module.exports = {
    createInquiry,
    getAllInquiries
};