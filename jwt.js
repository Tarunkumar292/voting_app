const jwt = require('jsonwebtoken');

// Middleware for protecting routes
const jwtAuthMiddleware = (req, res, next) => {
    // Check if the Authorization header is present
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Token Not Found' });

    // Ensure the token is in "Bearer <token>" format
    const token = authorization.split(' ')[1]; // Extract the token
    if (!token) return res.status(401).json({ error: 'Unauthorized, Token Missing' });

    try {
        // Verify the token with the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user data to the request object (req.user)
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error(err);

        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Malformed token' });
        }

        // General error handling for other issues
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Function to generate JWT token
const generateToken = (userData) => {
    // Generate a new JWT token using user data and a secret key
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30m' }); // Token valid for 30 minutes
};

module.exports = { jwtAuthMiddleware, generateToken };
