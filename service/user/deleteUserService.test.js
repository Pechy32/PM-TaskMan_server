import { deleteUserService } from './deleteUserService.js';
import { deleteUser } from "../../dao/userDao.js";
import mongoose from 'mongoose';

// Mockujeme DAO
jest.mock("../../dao/userDao.js");

describe('deleteUserService', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('by měl vrátit 400, pokud je formát ID neplatný', async () => {
    req = { params: { id: "neplatne-id-123" } };

    await deleteUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID' });
    // Důležité: deleteUser se nesmí zavolat
    expect(deleteUser).not.toHaveBeenCalled();
  });

  test('by měl úspěšně smazat uživatele při platném ID', async () => {
    // Vygenerujeme validní Mongoose ID pro test
    const validId = new mongoose.Types.ObjectId().toString();
    req = { params: { id: validId } };
    
    const mockMessage = "User deleted successfully";
    deleteUser.mockResolvedValue(mockMessage);

    await deleteUserService(req, res);

    expect(deleteUser).toHaveBeenCalledWith(validId);
    expect(res.json).toHaveBeenCalledWith({ message: mockMessage });
  });

  test('by měl vrátit 500, pokud DAO vyhodí chybu', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    req = { params: { id: validId } };
    
    deleteUser.mockRejectedValue(new Error("Internal DB Error"));

    await deleteUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal DB Error" });
  });
});