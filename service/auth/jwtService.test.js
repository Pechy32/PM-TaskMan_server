import { generateTokens, verifyToken, refreshToken } from './jwtService.js';
import jwt from 'jsonwebtoken';

describe('jwtService', () => {
    const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isAdmin: true
    };

    beforeEach(() => {
        // Ujistíme se, že máme secret pro testy
        process.env.JWT_SECRET = 'test_secret_key';
    });

    
    test('by měl vygenerovat access i refresh token pro platného uživatele', () => {
        const tokens = generateTokens(mockUser);

        expect(tokens).toHaveProperty('accessToken');
        expect(tokens).toHaveProperty('refreshToken');
        
        // Dekódování bez verifikace pro kontrolu obsahu
        const decoded = jwt.decode(tokens.accessToken);
        expect(decoded.sub).toBe(mockUser._id);
        expect(decoded.role).toBe('admin');
        expect(decoded.type).toBe('access');
    });

    test('by měl vyhodit chybu, pokud uživatel nemá _id', () => {
        expect(() => generateTokens({})).toThrow("User is required to generate tokens");
    });

    
    test('by měl vrátit payload pro platný token', () => {
        const { accessToken } = generateTokens(mockUser);
        const payload = verifyToken(accessToken);

        expect(payload).not.toBeNull();
        expect(payload.sub).toBe(mockUser._id);
    });

    test('by měl vrátit null pro neplatný token', () => {
        const result = verifyToken('nesmyslny.token.podvrh');
        expect(result).toBeNull();
    });

    test('by měl vrátit null pro expirovaný token', () => {
        // Vytvoříme token s expirací 0 sekund
        const expiredToken = jwt.sign({ sub: '123' }, 'test_secret_key', { expiresIn: '0s' });
        const result = verifyToken(expiredToken);
        expect(result).toBeNull();
    });

    
    test('by měl vygenerovat novou sadu tokenů pro platný refresh token', () => {
        const { refreshToken: oldRefresh } = generateTokens(mockUser);
        
        const newTokens = refreshToken(oldRefresh);

        expect(newTokens).toHaveProperty('accessToken');
        expect(newTokens).toHaveProperty('refreshToken');
        expect(newTokens.accessToken).not.toBe(oldRefresh);
    });

    test('by měl odmítnout access token použitý jako refresh token', () => {
        const { accessToken } = generateTokens(mockUser);
        
        // Pokus o refresh pomocí access tokenu
        const result = refreshToken(accessToken);

        expect(result).toBeNull();
    });
});