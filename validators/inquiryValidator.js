const validateString = (value, fieldName, maxLength) => {
    if (typeof value !== "string") {
        return `${fieldName} must be a string.`;
    }

    if (!value.trim()) {
        return `${fieldName} cannot be empty.`;
    }

    if (value.length > maxLength) {
        return `${fieldName} must not exceed ${maxLength} characters.`;
    }

    return null;
};


const validateEmail = (value) => {
    if (typeof value !== "string") {
        return "Email must be a string.";
    }

    if (!value.trim()) {
        return "Email cannot be empty.";
    }

    if (value.length > 254) {
        return "Email must not exceed 254 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value.trim())) {
        return "Please provide a valid email address.";
    }

    return null;
};


const validateCreateInquiry = (req, res, next) => {
    const { name, email, subject, message } = req.body || {};

    const nameError = validateString(name, "Name", 255);

    if (nameError) {
        return res.status(400).json({
            success: false,
            message: nameError
        });
    }

    const emailError = validateEmail(email);

    if (emailError) {
        return res.status(400).json({
            success: false,
            message: emailError
        });
    }

    const subjectError = validateString(subject, "Subject", 255);

    if (subjectError) {
        return res.status(400).json({
            success: false,
            message: subjectError
        });
    }

    const messageError = validateString(message, "Message", 5000);

    if (messageError) {
        return res.status(400).json({
            success: false,
            message: messageError
        });
    }

    next();
};


module.exports = {
    validateCreateInquiry
};