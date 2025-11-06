import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || "some_real_secret";

const ACCESS_TOKEN_TTL = '5m';
const REFRESH_TOKEN_TTL = '7d';

export function createTokens(userIdentifier, role) {
    const common = {
        userIdentifier,
        role,
    };

    const now = Date.now();

    const accessToken = jwt.sign(
        { ...common, type: 'access', issuedAt: now },
        SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = jwt.sign(
        { ...common, type: 'refresh', issuedAt: now },
        SECRET,
        { expiresIn: REFRESH_TOKEN_TTL }
    );

    return { accessToken, refreshToken };
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return null;
    }
}

export function refreshToken(oldRefreshToken) {
    const payload = verifyToken(oldRefreshToken);
    if (!payload || payload.type !== 'refresh') {
        return null;
    }

    const { userId, role } = payload;
    return createTokens(userId, role);
}
