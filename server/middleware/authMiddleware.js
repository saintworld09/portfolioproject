const jwt = require("jsonwebtoken");

/*
|--------------------------------------------------------------------------
| AUTHENTICATE TOKEN
|--------------------------------------------------------------------------
|
| Required authentication middleware.
|
| Use this middleware on protected routes where a valid JWT is mandatory.
|
| If the request does not contain a valid token:
| - 401 Unauthorized is returned.
|
| If the token is valid:
| - decoded JWT data is stored in req.user.
|
| Expected JWT payload:
|
| {
|     userId: user.id,
|     role: user.role
| }
|
|--------------------------------------------------------------------------
*/

const authenticateToken = (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message:
                    "Access token is required",
            });
        }

        const parts =
            authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer" ||
            !parts[1]
        ) {
            return res.status(401).json({
                message:
                    "Invalid authorization format",
            });
        }

        const token =
            parts[1];

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.user =
            decoded;

        next();
    } catch (error) {
        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            message:
                "Invalid or expired token",
        });
    }
};


/*
|--------------------------------------------------------------------------
| OPTIONAL AUTHENTICATE TOKEN
|--------------------------------------------------------------------------
|
| Optional authentication middleware.
|
| This middleware is different from authenticateToken().
|
| It allows BOTH:
|
| 1. Authenticated requests
|    - A valid Bearer token is provided.
|    - The decoded user is stored in req.user.
|
| 2. Public requests
|    - No Authorization header is provided.
|    - The request continues without req.user.
|
| This is useful for endpoints that have different behavior depending
| on whether the visitor is authenticated.
|
| Example:
|
| GET /api/projects
|
| Authenticated:
|     Authorization: Bearer <token>
|     -> req.user is available
|     -> controller can return the authenticated user's projects
|
| Public:
|     No token
|     -> req.user remains undefined
|     -> controller can use portfolioSlug
|
| IMPORTANT:
|
| If an Authorization header IS provided but the token is invalid,
| the request is rejected rather than silently treating the user
| as a public visitor.
|
|--------------------------------------------------------------------------
*/

const optionalAuthenticateToken = (
    req,
    res,
    next
) => {
    try {
        const authHeader =
            req.headers.authorization;

        /*
        |----------------------------------------------------------------------
        | No Authorization header
        |----------------------------------------------------------------------
        |
        | This is allowed because authentication is optional.
        |
        */

        if (!authHeader) {
            return next();
        }

        /*
        |----------------------------------------------------------------------
        | Validate Authorization format
        |----------------------------------------------------------------------
        */

        const parts =
            authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer" ||
            !parts[1]
        ) {
            return res.status(401).json({
                message:
                    "Invalid authorization format",
            });
        }

        const token =
            parts[1];

        /*
        |----------------------------------------------------------------------
        | Verify JWT
        |----------------------------------------------------------------------
        */

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        /*
        |----------------------------------------------------------------------
        | Attach authenticated user
        |----------------------------------------------------------------------
        */

        req.user =
            decoded;

        next();
    } catch (error) {
        console.error(
            "Optional authentication error:",
            error.message
        );

        return res.status(401).json({
            message:
                "Invalid or expired token",
        });
    }
};


/*
|--------------------------------------------------------------------------
| AUTHORIZE ADMIN
|--------------------------------------------------------------------------
|
| This middleware must be used AFTER authenticateToken().
|
| It verifies that:
|
| 1. The request has an authenticated user.
| 2. The authenticated user's role is ADMIN.
|
|--------------------------------------------------------------------------
*/

const authorizeAdmin = (
    req,
    res,
    next
) => {
    if (!req.user) {
        return res.status(401).json({
            message:
                "Authentication required",
        });
    }

    if (
        req.user.role !==
        "ADMIN"
    ) {
        return res.status(403).json({
            message:
                "Admin access required",
        });
    }

    next();
};


/*
|--------------------------------------------------------------------------
| EXPORT MIDDLEWARE
|--------------------------------------------------------------------------
*/

module.exports = {
    authenticateToken,
    optionalAuthenticateToken,
    authorizeAdmin,
};
