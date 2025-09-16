export const errorHandler = function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
};
//# sourceMappingURL=error.middleware.js.map