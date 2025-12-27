import { getProjectsForUserContext } from './getAllProjectsService.js';
import { getAllProjects, getProjectsForUser } from '../../dao/projectDao.js';

// Mockování DAO
jest.mock('../../dao/projectDao.js');

describe('getProjectsForUserContext', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mělo by vyhodit "UserRequired", pokud user nebo jeho ID chybí', async () => {
    await expect(getProjectsForUserContext(null))
      .rejects.toThrow("UserRequired");
    
    await expect(getProjectsForUserContext({ role: 'admin' })) // chybí id
      .rejects.toThrow("UserRequired");
  });

  test('mělo by zavolat getAllProjects, pokud je uživatel admin', async () => {
    const mockAllProjects = [{ id: 1 }, { id: 2 }, { id: 3 }];
    getAllProjects.mockResolvedValue(mockAllProjects);

    const user = { id: 'admin1', role: 'admin' };
    const result = await getProjectsForUserContext(user);

    // Ověříme správnost výsledku
    expect(result).toEqual(mockAllProjects);
    // Klíčové: Ověříme, že se volala správná DAO funkce
    expect(getAllProjects).toHaveBeenCalledTimes(1);
    // A že se NEVOLALA funkce pro běžného uživatele
    expect(getProjectsForUser).not.toHaveBeenCalled();
  });

  test('mělo by zavolat getProjectsForUser, pokud je uživatel běžný user', async () => {
    const mockUserProjects = [{ id: 1 }];
    getProjectsForUser.mockResolvedValue(mockUserProjects);

    const user = { id: 'user123', role: 'user' };
    const result = await getProjectsForUserContext(user);

    expect(result).toEqual(mockUserProjects);
    // Ověříme, že se volala funkce s ID uživatele
    expect(getProjectsForUser).toHaveBeenCalledWith('user123');
    // A že se NEVOLALA funkce pro admina
    expect(getAllProjects).not.toHaveBeenCalled();
  });
});