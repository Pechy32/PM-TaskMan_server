import { getUserService } from './getUserService.js';
import { getUserById } from "../../dao/userDao.js";
import mongoose from 'mongoose';

// Mockování DAO
jest.mock("../../dao/userDao.js");

describe('getUserService', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('by měl vrátit 400, pokud je ID ve špatném formátu', async () => {
    req = { params: { id: "neplatne-id-123" } };

    await getUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID' });
    expect(getUserById).not.toHaveBeenCalled();
  });

  test('by měl vrátit 404, pokud uživatel nebyl nalezen', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    req = { params: { id: validId } };
    
    // DAO vrátí null (uživatel neexistuje)
    getUserById.mockResolvedValue(null);

    await getUserService(req, res);

    expect(getUserById).toHaveBeenCalledWith(validId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  test('by měl vrátit 200 a data uživatele, pokud existuje', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    req = { params: { id: validId } };
    
    const mockUser = { _id: validId, name: "Test User", email: "test@test.com" };
    getUserById.mockResolvedValue(mockUser);

    await getUserService(req, res);

    expect(res.json).toHaveBeenCalledWith(mockUser);
    // Implicitně se vrací status 200, pokud kód neskončil v .status().json()
  });

  test('by měl vrátit 500, pokud nastane chyba v databázi', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    req = { params: { id: validId } };
    
    getUserById.mockRejectedValue(new Error("Connection lost"));

    await getUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Connection lost" });
  });
});