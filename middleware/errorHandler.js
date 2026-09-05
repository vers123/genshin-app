function notFoundHandler(req, res) {
    res.status(404).json({
        error: `Route not found: ${req.method} ${req.originalUrl}`
    });
}

function errorHandler(err, req, res, _next) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
}

module.exports = { notFoundHandler, errorHandler };
