import { loginWithEmail, getUserRoleForProject } from './authService.js';
import { getUserByEmail } from "../../dao/userDao.js";
import { getProject } from "../../dao/projectDao.js";
import { generateTokens } from "./jwtService.js";

jest.mock("../../dao/userDao.js");
jest.mock("../../dao/projectDao.js");
jest.mock("./jwtService.js");

describe('authService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    
    describe('loginWithEmail', () => {
        test('by měl vyhodit chybu, pokud uživatel neexistuje', async () => {
            getUserByEmail.mockResolvedValue(null);
            await expect(loginWithEmail('test@test.com', 'heslo'))
                .rejects.toThrow("UserNotFound");
        });

        test('by měl vyhodit chybu, pokud uživatel nemá nastavené heslo (např. Google login)', async () => {
            getUserByEmail.mockResolvedValue({ email: 'test@test.com' }); // chybí passwordHash
            await expect(loginWithEmail('test@test.com', 'heslo'))
                .rejects.toThrow("PasswordLoginNotAllowed");
        });

        test('by měl vyhodit chybu při špatném hesle', async () => {
            getUserByEmail.mockResolvedValue({ email: 'a@a.cz', passwordHash: 'spravne-heslo' });
            await expect(loginWithEmail('a@a.cz', 'spatne-heslo'))
                .rejects.toThrow("WrongPassword");
        });

        test('by měl vrátit tokeny při úspěšném přihlášení', async () => {
            const mockUser = { _id: 'u1', email: 'a@a.cz', passwordHash: 'tajne' };
            getUserByEmail.mockResolvedValue(mockUser);
            generateTokens.mockReturnValue({ accessToken: 'at', refreshToken: 'rt' });

            const result = await loginWithEmail('a@a.cz', 'tajne');

            expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
            expect(generateTokens).toHaveBeenCalledWith(mockUser);
        });
    });

    
    describe('getUserRoleForProject', () => {
        const userId = 'user123';
        const projectId = 'proj123';

        test('by měl vrátit "owner", pokud ID souhlasí s ownerId projektu', async () => {
            getProject.mockResolvedValue({
                _id: projectId,
                ownerId: userId,
                members: []
            });

            const role = await getUserRoleForProject(userId, projectId);
            expect(role).toBe('owner');
        });

        test('by měl vrátit specifickou roli člena (editor/viewer)', async () => {
            getProject.mockResolvedValue({
                _id: projectId,
                ownerId: 'differentUser',
                members: [{ user: userId, role: 'editor' }]
            });

            const role = await getUserRoleForProject(userId, projectId);
            expect(role).toBe('editor');
        });

        test('by měl vrátit false, pokud uživatel není owner ani člen', async () => {
            getProject.mockResolvedValue({
                _id: projectId,
                ownerId: 'someone',
                members: [{ user: 'anotherUser', role: 'viewer' }]
            });

            const role = await getUserRoleForProject(userId, projectId);
            expect(role).toBe(false);
        });

        test('by měl vyhodit chybu, pokud projekt neexistuje', async () => {
            getProject.mockResolvedValue(null);
            await expect(getUserRoleForProject(userId, projectId))
                .rejects.toThrow("ProjectNotFound");
        });
    });
});