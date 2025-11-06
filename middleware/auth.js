import { verifyToken } from '../service/auth/jwtService.js';

const PUBLIC_PATHS_BY_METHOD = {
    "GET": [
        // "/api/users",
    ], 
    "POST": [
        "/api/auth/login",
        // ...
    ],
    "PATCH": [
        // ...
    ],
    "DELETE": [
        // ...
    ],
    //  ...
};

function isRefreshTokenPath(method, url) {
    const REFRESH_METHOD = "GET";
    const REFRESH_PATH = "/api/auth/refresh";
    return method === REFRESH_METHOD && url === REFRESH_PATH;
}

async function authMiddleware(req, res, next) {
    const { method, originalUrl, headers } = req;
    const publicRoutesForMethod = PUBLIC_PATHS_BY_METHOD[method];

    /** should be in format 'Bearer <some-jwt-token>' */
    const { authorization } = headers;

    // if there is missing authorization allow only public routes
    if(!authorization && !publicRoutesForMethod.includes(originalUrl))
        return res.status(401).send("Unathorized");

    if(authorization) {
        const authObj = isAuthTokenValid(authorization);
        if(typeof authObj === "string") 
            return res.status(401).send(`Unathorized - ${authObj}`);

        // refresh type token is allowed for only one endpoint
        if(authObj.type === "refresh" && !isRefreshTokenPath(method, originalUrl)) 
            return res.status(401).send("Unathorized - InvalidRefreshPath");

        // for admins allow everything
        if(authObj.role === "admin") 
            return next();

        // TODO:
    }

    next();
}

function isAuthTokenValid(authToken) {
    const [ tokenType, token ] = authToken.split(" ");

    if(tokenType !== "Bearer") 
        return "AuthError: InvalidAuthorization";

    const verifiedToken = verifyToken(token);
    if(!verifiedToken)
        return "AuthError: InvalidOrExpiredToken";
    
    if(typeof verifiedToken === "string")
        return `AuthError: ${verifiedToken}`;
    
    console.log(verifiedToken)

    return { 
        userId: verifiedToken.userId,
        role: verifiedToken.role,
        type: verifiedToken.type,
    };
}

export default authMiddleware;