const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
    return res.status(401).json({ error: "Token requerido" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
    req.user = user; // Adjunta info del usuario a la request
    next();
    });
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }
        
        if (roles.length && !roles.includes(req.user.rol)) {
            return res.status(403).json({ error: "No tienes permisos para esta acción" });
        }
        
        next();
    };
}

module.exports = { authenticateToken, requireRole };