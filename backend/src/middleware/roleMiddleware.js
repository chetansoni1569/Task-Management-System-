const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user && req.user.role ? req.user.role.toLowerCase() : "";
        const roles = allowedRoles.map((r) => r.toLowerCase());

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user ? req.user.role : "Unknown"}' is not allowed to access this resource.`
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };
