import { getProjectService } from './getProjectService.js';
import { getProject } from '../../dao/projectDao.js';

// 1. Řekneme Jestu, aby automaticky zamaskoval funkce v tomto modulu
jest.mock('../../dao/projectDao.js');

describe('getProjectService', () => {
  
  // Před každým testem vyčistíme historii volání mocků
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mělo by vyhodit chybu "ProjectIdRequired", pokud chybí ID', async () => {
    await expect(getProjectService(null, {}))
      .rejects.toThrow("ProjectIdRequired");
  });

  test('mělo by vyhodit chybu "ProjectNotFound", pokud projekt neexistuje', async () => {
    // Definujeme, co má vrátit mockovaná databáze
    getProject.mockResolvedValue(null);

    await expect(getProjectService("123", {}))
      .rejects.toThrow("ProjectNotFound");
  });

  test('mělo by vrátit projekt, pokud je uživatel admin', async () => {
    const mockProject = { id: "123", name: "Tajný projekt" };
    getProject.mockResolvedValue(mockProject);

    const user = { role: "admin" };
    const result = await getProjectService("123", user);

    expect(result).toEqual(mockProject);
    // Ověříme, že se databáze skutečně volala s naším ID
    expect(getProject).toHaveBeenCalledWith("123");
  });

  test('mělo by vrátit projekt, pokud je uživatel owner', async () => {
    const mockProject = { 
      id: "123", 
      ownerId: "user_456", 
      members: [] 
    };
    getProject.mockResolvedValue(mockProject);

    const user = { id: "user_456", role: "user" };
    const result = await getProjectService("123", user);

    expect(result).toEqual(mockProject);
  });

  test('mělo by vyhodit "Forbidden", pokud uživatel nemá přístup', async () => {
    const mockProject = { 
      id: "123", 
      ownerId: "someone_else", 
      members: [] 
    };
    getProject.mockResolvedValue(mockProject);

    const user = { id: "user_789", role: "user" };
    
    await expect(getProjectService("123", user))
      .rejects.toThrow("Forbidden");
  });
});