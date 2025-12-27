// middleware/auth.test.js
import authMiddleware from './auth.js'; // Změněno z authMiddleware.js na auth.js
import { verifyToken } from "../service/auth/jwtService.js";
import { getUserRoleForProject } from "../service/auth/authService.js";

jest.mock("../service/auth/jwtService.js");
jest.mock("../service/auth/authService.js");

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.AUTH_ENABLED = "true";
        
        req = {
            method: "GET",
            originalUrl: "/api/projects",
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    test('by měl zavolat next(), pokud je AUTH_ENABLED vypnuto', async () => {
        process.env.AUTH_ENABLED = "false";
        await authMiddleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('by měl zavolat next(), pokud je cesta veřejná (např. login)', async () => {
        req.method = "POST";
        req.originalUrl = "/api/auth/login";
        
        await authMiddleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('by měl vrátit 401, pokud chybí Authorization hlavička', async () => {
        await authMiddleware(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith("Unauthorized");
        expect(next).not.toHaveBeenCalled();
    });

    test('by měl vrátit 401, pokud je token neplatný/expirovaný', async () => {
        req.headers.authorization = "Bearer neplatny-token";
        verifyToken.mockReturnValue(null);

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith("Unauthorized - InvalidOrExpiredToken");
    });

    test('by měl nastavit req.user a zavolat next() pro platný access token', async () => {
        req.headers.authorization = "Bearer platny-token";
        verifyToken.mockReturnValue({ sub: "user123", role: "user", type: "access" });

        await authMiddleware(req, res, next);

        expect(req.user).toEqual({ id: "user123", role: "user" });
        expect(next).toHaveBeenCalled();
    });

    test('by měl zakázat refresh token na jiných než refresh endpointech', async () => {
        req.headers.authorization = "Bearer refresh-token";
        req.originalUrl = "/api/projects";
        verifyToken.mockReturnValue({ sub: "user123", role: "user", type: "refresh" });

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith("Unauthorized - InvalidRefreshPath");
    });
});