import { verifyToken } from '../service/auth/jwtService.js';
import { getUserRoleForProject } from '../service/auth/authService.js';

const PUBLIC_PATHS_BY_METHOD = {
    "GET": [
        // "/api/users",
    ], 
    "POST": [
        "/api/users",
        "/api/auth/login",
        "/api/auth/refresh-token",
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
    const [ trimmedUrl ] = originalUrl.split("?")
    const publicRoutesForMethod = PUBLIC_PATHS_BY_METHOD[method];

    const isPublicApi = publicRoutesForMethod.includes(originalUrl);
    if(isPublicApi) 
        return next();

    /** should be in format 'Bearer <some-jwt-token>' */
    const { authorization } = headers;

    // if there is missing authorization allow only public routes
    if(!authorization && !isPublicApi)
        return res.status(401).send("Unathorized");

    if(authorization) {
        const authObj = isAuthTokenValid(authorization);
        if(typeof authObj === "string") 
            return res.status(401).send(`Unathorized - ${authObj}`);

        const { userId, userType, tokenType } = authObj;

        // refresh type token is allowed for only one endpoint
        if(tokenType === "refresh" && !isRefreshTokenPath(method, originalUrl)) 
            return res.status(401).send("Unathorized - InvalidRefreshPath");

        // for admins allow everything
        if(userType === "admin")
            return next();

        if(!trimmedUrl.includes("/api/projects")) {
            // project specific authorization
            const { projectId } = req;
            const userRoleInProject = await getUserRoleForProject(userId, projectId);

            if(!userRoleInProject) {
                return res.status(401).send("Unathorized - NotMemberOfProject");
            }

            req.userRoleInProject = userRoleInProject;
        }

        return next();
    }

    // total fallback in case previous process fails
    return res.status(401).send("Unathorized");
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
    
    return { 
        userId: verifiedToken.userIdentifier,
        userType: verifiedToken.userType,
        tokenType: verifiedToken.type,
    };
}

export default authMiddleware;
