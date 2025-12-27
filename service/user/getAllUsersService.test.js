import { getAllUsersService } from './getAllUsersService.js';
import { getAllUsers } from "../../dao/userDao.js";

// Mockování DAO vrstvy
jest.mock("../../dao/userDao.js");

describe('getAllUsersService', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {}; // Pro tento GET nepotřebujeme žádná data z requestu
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('mělo by vrátit seznam všech uživatelů se statusem 200', async () => {
    const mockUsers = [
      { _id: "u1", username: "alice", email: "alice@test.com" },
      { _id: "u2", username: "bob", email: "bob@test.com" }
    ];
    
    // Nastavíme mock tak, aby vrátil naše testovací uživatele
    getAllUsers.mockResolvedValue(mockUsers);

    await getAllUsersService(req, res);

    expect(getAllUsers).toHaveBeenCalledTimes(1);
    // Express res.json() automaticky vrací status 200, pokud není řečeno jinak
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  test('mělo by vrátit prázdné pole, pokud v DB nejsou žádní uživatelé', async () => {
    getAllUsers.mockResolvedValue([]);

    await getAllUsersService(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('mělo by vrátit status 500, pokud DAO vyhodí chybu', async () => {
    getAllUsers.mockRejectedValue(new Error("DB error"));

    await getAllUsersService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
  });
});