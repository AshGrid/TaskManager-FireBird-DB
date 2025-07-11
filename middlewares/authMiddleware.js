

import jwt from 'jsonwebtoken';



export function verifyToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const role = decoded.email;
        console.log(role);
        req.user = decoded; // Attach the decoded token data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
}

export function verifyAdmin(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const role = decoded.role;
        console.log(role);
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
            req.user = decoded;
             // Attach the decoded token data to the request object
            next();
        }
        else{
            return res.status(403).json({ error: "not Admin." });
        }
         // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
}


export function verifySuperAdmin(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const role = decoded.role;
        console.log(role);
        if (role === "SUPER_ADMIN") {
            req.user = decoded;
            // Attach the decoded token data to the request object
            next();
        }
        else{
            return res.status(403).json({ error: "not authorized ." });
        }
        // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
}


