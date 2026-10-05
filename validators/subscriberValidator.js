const isPositiveIntegerString = (value) => {
return (
typeof value === "string" &&
/^\d+$/.test(value) &&
parseInt(value, 10) > 0
);
};

// =====================================================
// VALIDATE SUBSCRIBER ID
// Used by:
// GET /:id
// PATCH /:id/status
// DELETE /:id
// =====================================================

const validateSubscriberId = (req, res, next) => {
const id = req.params.id;

if (
    id === undefined ||
    id === null ||
    id === ""
) {
    return res.status(400).json({
        success: false,
        message: "id is required"
    });
}

if (!isPositiveIntegerString(String(id))) {
    return res.status(400).json({
        success: false,
        message: "id must be a valid positive integer"
    });
}

next();

};

module.exports = {
validateSubscriberId
};
