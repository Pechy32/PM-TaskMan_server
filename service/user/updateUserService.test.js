import { updateUserService } from './updateUserService.js';
import { updateUser } from "../../dao/userDao.js";
import mongoose from 'mongoose';

jest.mock("../../dao/userDao.js");

describe('updateUserService', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('by měl vrátit 400, pokud je ID neplatné', async () => {
    req = { params: { id: 'invalid-id' }, body: { name: 'New Name' } };

    await updateUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID' });
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('by měl vrátit 404, pokud uživatel k aktualizaci neexistuje', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    req = { params: { id: validId }, body: { name: 'New Name' } };
    
    updateUser.mockResolvedValue(null);

    await updateUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  test('by měl úspěšně aktualizovat uživatele a vrátit data', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const updateData = { name: 'Updated Name' };
    req = { params: { id: validId }, body: updateData };
    
    const mockUpdatedUser = { _id: validId, ...updateData, email: 'test@test.com' };
    updateUser.mockResolvedValue(mockUpdatedUser);

    await updateUserService(req, res);

    expect(updateUser).toHaveBeenCalledWith(validId, updateData);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
  });

  test('by měl vrátit 400 při chybě validace (ValidationError)', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    req = { params: { id: validId }, body: { email: 'invalid-email' } };

    const valError = new Error();
    valError.name = 'ValidationError';
    valError.errors = { email: { message: 'Invalid email format' } };
    
    updateUser.mockRejectedValue(valError);

    await updateUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: valError.errors });
  });
});