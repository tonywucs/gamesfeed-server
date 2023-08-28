const jwt = require('jsonwebtoken')

// middleware that deals with auth tokens that we can use for all the protected routes that require auth
exports.authorize = (req, res, next) => {
    if (!req.headers.authorization) {
        return res
            .status(401)
            .json({
                success: false,
                message: 'This route requires authorization header'
            });
    }

    if (req.headers.authorization.indexOf('Bearer') === -1) {
        return res
            .status(401)
            .json({
                success: false,
                message: 'This route requires Bearer token'
            });
    }

    // because the authorization header comes in "Bearer encrypted-auth-token" format we are only interested in second portion of the token
    const authToken = req.headers.authorization.split(' ')[1];

    // to verify JWT token, we have three arguments: the token, the secret it was signed with and the callback after verifying. The callback comes with two parameters - the error and the decoded token (the payload)
    jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
        // if token has been tampered with or has expired we respond with an error
        if (err) { 
            return res.status(401).json({ success: false, message: 'The token is invalid' });
        }

        // if token is verified we are setting it on the request object for an endpoint to use
        req.jwtDecoded = decoded;
        next();
    });
}