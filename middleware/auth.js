import { verifyToken } from "../service/auth/jwtService.js";
import { getUserRoleForProject } from "../service/auth/authService.js";

const PUBLIC_PATHS_BY_METHOD = {
    GET: [
        "/api/users/me",
    ],
    POST: [
        "/api/users",
        "/api/auth/login",
        "/api/auth/refresh-token",
    ],
    PATCH: [],
    DELETE: [],
};

function isRefreshTokenPath(method, url) {
    return method === "POST" && url === "/api/auth/refresh-token";
}

async function authMiddleware(req, res, next) {
    if (process.env.AUTH_ENABLED !== "true") {
        return next();
    }

    const { method, originalUrl, headers } = req;
    const trimmedUrl = originalUrl.split("?")[0];

    const publicRoutes = PUBLIC_PATHS_BY_METHOD[method] || [];
    const isPublicApi = publicRoutes.includes(trimmedUrl);

    if (isPublicApi) {
        return next();
    }

    const { authorization } = headers;

    if (!authorization) {
        return res.status(401).send("Unauthorized");
    }

    const authObj = parseAndVerifyToken(authorization);
    if (typeof authObj === "string") {
        return res.status(401).send(authObj);
    }

    const { userId, userType, tokenType } = authObj;

    // refresh token is only allowed on refresh endpoint
    if (tokenType === "refresh" && !isRefreshTokenPath(method, trimmedUrl)) {
        return res.status(401).send("Unauthorized - InvalidRefreshPath");
    }

    // pass on user info
    req.user = {
        id: userId,
        role: userType,
    };

    // admin has full access
    if (userType === "admin") {
        return next();
    }

    // project authorization
    if (trimmedUrl.startsWith("/api/projects")) {
        const { projectId } = req;

        const userRoleInProject = await getUserRoleForProject(
            userId,
            projectId
        );

        if (!userRoleInProject) {
            return res.status(403).send("Forbidden - NotMemberOfProject");
        }

        req.userRoleInProject = userRoleInProject;
    }

    return next();
}

function parseAndVerifyToken(authHeader) {
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return "Unauthorized - InvalidAuthorizationHeader";
    }

    const payload = verifyToken(token);
    if (!payload) {
        return "Unauthorized - InvalidOrExpiredToken";
    }

    return {
        userId: payload.sub,
        userType: payload.role,
        tokenType: payload.type,
    };
}

export default authMiddleware;
