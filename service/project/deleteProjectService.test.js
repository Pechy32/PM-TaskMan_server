import { deleteProjectService } from './deleteProjectService.js';
import { deleteProject, getProject } from '../../dao/projectDao.js';

// Mockování DAO vrstvy
jest.mock('../../dao/projectDao.js');

describe('deleteProjectService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mělo by vyhodit "ProjectIdRequired", pokud chybí ID', async () => {
    await expect(deleteProjectService(null, {}))
      .rejects.toThrow("ProjectIdRequired");
  });

  test('mělo by vyhodit "ProjectNotFound", pokud projekt v DB neexistuje', async () => {
    getProject.mockResolvedValue(null);

    await expect(deleteProjectService("123", { role: "admin" }))
      .rejects.toThrow("ProjectNotFound");
  });

  test('mělo by smazat projekt, pokud je uživatel admin', async () => {
    const mockProject = { id: "123", ownerId: "user_999" };
    getProject.mockResolvedValue(mockProject);
    deleteProject.mockResolvedValue(true);

    const user = { role: "admin" };
    await deleteProjectService("123", user);

    // Ověříme, že se smazání skutečně zavolalo
    expect(deleteProject).toHaveBeenCalledWith("123");
  });

  test('mělo by smazat projekt, pokud je uživatel owner', async () => {
    const mockProject = { 
      id: "123", 
      ownerId: "user_456" // Stejné ID jako uživatel
    };
    getProject.mockResolvedValue(mockProject);

    const user = { id: "user_456", role: "user" };
    await deleteProjectService("123", user);

    expect(deleteProject).toHaveBeenCalledWith("123");
  });

  test('mělo by vyhodit "Forbidden", pokud se projekt snaží smazat někdo jiný', async () => {
    const mockProject = { 
      id: "123", 
      ownerId: "owner_id" 
    };
    getProject.mockResolvedValue(mockProject);

    const intruder = { id: "hacker_id", role: "user" };

    await expect(deleteProjectService("123", intruder))
      .rejects.toThrow("Forbidden");
    
    // Důležité: Ověříme, že se deleteProject NIKDY nezavolal
    expect(deleteProject).not.toHaveBeenCalled();
  });
});