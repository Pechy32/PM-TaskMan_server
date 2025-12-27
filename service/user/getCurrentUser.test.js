import { getCurrentUser } from './getCurrentUser.js';
import { getUserById } from "../../dao/userDao.js";

// Mockování DAO
jest.mock("../../dao/userDao.js");

describe('getCurrentUser', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mělo by vyhodit "UserIdRequired", pokud není zadáno ID', async () => {
    await expect(getCurrentUser(null))
      .rejects.toThrow("UserIdRequired");
  });

  test('mělo by vyhodit "UserNotFound", pokud uživatel v DB neexistuje', async () => {
    getUserById.mockResolvedValue(null);

    await expect(getCurrentUser("nonexistent123"))
      .rejects.toThrow("UserNotFound");
  });

  test('mělo by vrátit správně transformovaný objekt uživatele', async () => {
    const mockDbUser = {
      _id: "user123",
      name: "Jan Novák",
      email: "jan@novak.cz",
      isAdmin: false,
      googleId: "google-abc-123", // Uživatel má propojený Google
      createdAt: new Date("2023-01-01"),
      password: "HashedPassword" // Citlivý údaj, který by ve výstupu neměl být
    };

    getUserById.mockResolvedValue(mockDbUser);

    const result = await getCurrentUser("user123");

    // Ověření struktury
    expect(result).toEqual({
      id: "user123",
      name: "Jan Novák",
      email: "jan@novak.cz",
      isAdmin: false,
      googleLinked: true, // Ověření logiky !!user.googleId
      createdAt: mockDbUser.createdAt
    });

    // Ujistíme se, že se heslo nevrací
    expect(result.password).toBeUndefined();
  });

  test('mělo by nastavit googleLinked na false, pokud googleId chybí', async () => {
    const mockDbUser = {
      _id: "u1",
      googleId: null // nebo undefined
    };

    getUserById.mockResolvedValue(mockDbUser);

    const result = await getCurrentUser("u1");
    expect(result.googleLinked).toBe(false);
  });
});