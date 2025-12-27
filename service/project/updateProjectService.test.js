import { updateProjectService } from './updateProjectService.js';
import { getProject, updateProject } from "../../dao/projectDao.js";

jest.mock("../../dao/projectDao.js");

describe('updateProjectService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Admin by měl mít možnost aktualizovat jakákoliv data', async () => {
    const mockProject = { id: "p1", ownerId: "user99", members: [] };
    const updateData = { name: "Nový název", ownerId: "hack" };
    const user = { role: "admin" };

    getProject.mockResolvedValue(mockProject);
    updateProject.mockResolvedValue({ ...mockProject, ...updateData });

    const result = await updateProjectService("p1", user, updateData);

    expect(updateProject).toHaveBeenCalledWith("p1", updateData);
    expect(result.ownerId).toBe("hack");
  });

  test('Editor by měl mít možnost měnit pouze name a description', async () => {
    const mockProject = { 
      id: "p1", 
      ownerId: "admin_user", 
      members: [{ userId: "editor1", role: "editor" }] 
    };
    // Editor se pokouší změnit jméno (povoleno) a ownerId (zakázáno)
    const updateData = { name: "Změněno", ownerId: "editor1" };
    const user = { id: "editor1", role: "user" };

    getProject.mockResolvedValue(mockProject);

    await updateProjectService("p1", user, updateData);

    // KLÍČOVÝ TEST: updateProject nesmí dostat ownerId!
    expect(updateProject).toHaveBeenCalledWith("p1", { name: "Změněno" });
  });

  test('Editor by měl dostat Forbidden, pokud neposílá žádná povolená pole', async () => {
    const mockProject = { 
        id: "p1", 
        ownerId: "admin_user", 
        members: [{ userId: "editor1", role: "editor" }] 
    };
    const updateData = { someEvilField: "value" };
    const user = { id: "editor1", role: "user" };

    getProject.mockResolvedValue(mockProject);

    await expect(updateProjectService("p1", user, updateData))
      .rejects.toThrow("Forbidden");
    
    expect(updateProject).not.toHaveBeenCalled();
  });

  test('Viewer (člen bez role editor) by měl dostat Forbidden', async () => {
    const mockProject = { 
      id: "p1", 
      ownerId: "owner1", 
      members: [{ userId: "viewer1", role: "viewer" }] 
    };
    const user = { id: "viewer1", role: "user" };

    getProject.mockResolvedValue(mockProject);

    await expect(updateProjectService("p1", user, { name: "Zkusím to" }))
      .rejects.toThrow("Forbidden");
  });
});