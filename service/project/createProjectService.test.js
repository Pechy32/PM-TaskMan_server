import { createProjectService } from './createProjectService.js';
import { createProject } from '../../dao/projectDao.js';
import { getUserById } from '../../dao/userDao.js';
import { validateEntity } from '../../helpers/validators/validateEntity.js';

// Mockování všech závislostí
jest.mock('../../dao/projectDao.js');
jest.mock('../../dao/userDao.js');
jest.mock('../../helpers/validators/validateEntity.js');

describe('createProjectService', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Simulace Express.js req a res objektů
    req = {
      body: {
        name: "Nový Projekt",
        ownerId: "user123"
      }
    };
    
    // Res musí mít funkce status() a json(), které se dají řetězit (chaining)
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('mělo by vrátit 400, pokud validace vlastníka (owner) selže', async () => {
    // Nastavíme, aby validátor vrátil chybu
    validateEntity.mockResolvedValue({ valid: false, message: "User not found" });

    await createProjectService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    // createProject by se v tomto případě vůbec neměl volat
    expect(createProject).not.toHaveBeenCalled();
  });

  test('mělo by vytvořit projekt a vrátit 201 při úspěchu', async () => {
    validateEntity.mockResolvedValue({ valid: true });
    const mockCreatedProject = { id: "p1", ...req.body };
    createProject.mockResolvedValue(mockCreatedProject);

    await createProjectService(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCreatedProject);
  });

  test('mělo by vrátit 400, pokud nastane ValidationError v databázi', async () => {
    validateEntity.mockResolvedValue({ valid: true });
    
    // Simulace chyby z Mongoose/DB
    const validationError = new Error();
    validationError.name = "ValidationError";
    validationError.errors = { name: "Path `name` is required." };
    createProject.mockRejectedValue(validationError);

    await createProjectService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: validationError.errors });
  });

  test('mělo by vrátit 500 při neočekávané chybě', async () => {
    validateEntity.mockResolvedValue({ valid: true });
    createProject.mockRejectedValue(new Error("DB Connection Lost"));

    await createProjectService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB Connection Lost" });
  });
});