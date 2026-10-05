function errorMiddleware(err, req, res, next) {
    // Log full details server-side only
    console.error('Unhandled error:', err);

    // If a controller attached a known status/message, respect it.
    // Otherwise, default to a safe generic 500.
    const statusCode = err.statusCode && Number.isInteger(err.statusCode)
        ? err.statusCode
        : 500;

    const message = statusCode === 500
        ? 'Internal server error'
        : (err.message || 'An error occurred');

    res.status(statusCode).json({
        success: false,
        message: message
    });
}

module.exports = errorMiddleware;