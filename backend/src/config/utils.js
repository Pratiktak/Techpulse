const jwt = require('jsonwebtoken');

const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    // The Replit preview loads our app inside an HTTPS iframe, so the auth
    // cookie must be SameSite=None + Secure for the browser to send it back
    // on subsequent requests (otherwise users appear logged out on refresh).
    res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
    });

    return token;
};

module.exports = generateToken;
