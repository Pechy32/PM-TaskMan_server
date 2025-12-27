import { createUserService } from './createUserService.js';
import { createUser } from "../../dao/userDao.js";

// Mockování DAO
jest.mock("../../dao/userDao.js");

describe('createUserService', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        username: "johndoe",
        email: "john@example.com",
        password: "securePassword123"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('mělo by vytvořit uživatele a vrátit status 201', async () => {
    const mockUser = { _id: "u1", ...req.body };
    createUser.mockResolvedValue(mockUser);

    await createUserService(req, res);

    expect(createUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  test('mělo by vrátit 400, pokud nastane ValidationError (např. chybějící email)', async () => {
    // Simulace chyby validace z Mongoose
    const valError = new Error();
    valError.name = 'ValidationError';
    valError.errors = { email: { message: 'Email is required' } };
    
    createUser.mockRejectedValue(valError);

    await createUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: valError.errors });
  });

  test('mělo by vrátit 500 při neočekávané chybě serveru', async () => {
    createUser.mockRejectedValue(new Error("Unexpected DB crash"));

    await createUserService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Unexpected DB crash" });
  });
});