import { createTaskService } from './createTaskService.js';
import { createTask, getTaskById } from "../../dao/taskDao.js";
import { getProject } from "../../dao/projectDao.js";
import { getUserById } from "../../dao/userDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

jest.mock("../../dao/taskDao.js");
jest.mock("../../dao/projectDao.js");
jest.mock("../../dao/userDao.js");
jest.mock("../../helpers/validators/validateEntity.js");

describe('createTaskService', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { projectId: "p123" },
            body: { title: "Napsat dokumentaci" },
            user: { id: "u1", role: "user" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('by měl vrátit 403, pokud běžný uživatel není owner ani editor projektu', async () => {
        // 1. Validace projektu projde
        validateEntity.mockResolvedValueOnce({ valid: true });
        // 2. Načtení projektu vrátí data, kde uživatel nefiguruje
        getProject.mockResolvedValue({
            ownerId: "someone_else",
            members: [{ userId: "u2", role: "viewer" }]
        });

        await createTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    test('by měl vrátit 400, pokud přiřazený uživatel (assignedTo) neexistuje', async () => {
        req.body.assignedTo = "nonexistent_user";
        req.user.role = "admin"; // Přeskočíme autorizaci pro zjednodušení

        // První volání validateEntity (projekt) - OK
        validateEntity.mockResolvedValueOnce({ valid: true });
        getProject.mockResolvedValue({ ownerId: "admin" });
        // Druhé volání validateEntity (assignedTo user) - FAIL
        validateEntity.mockResolvedValueOnce({ valid: false, message: "UserNotFound" });

        await createTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "UserNotFound" });
        expect(createTask).not.toHaveBeenCalled();
    });

    test('by měl úspěšně vytvořit task (včetně parentTaskId)', async () => {
        req.body.parentTaskId = "parent1";
        req.user.role = "admin";

        // Všechny validace projdou (Project, User - není v body, ParentTask)
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "admin" });
        
        const mockCreatedTask = { id: "t99", ...req.body, projectId: "p123" };
        createTask.mockResolvedValue(mockCreatedTask);

        await createTaskService(req, res);

        expect(createTask).toHaveBeenCalledWith(expect.objectContaining({
            title: "Napsat dokumentaci",
            parentTaskId: "parent1",
            projectId: "p123"
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCreatedTask);
    });

    test('by měl vrátit 500, pokud selže uložení do databáze', async () => {
        req.user.role = "admin";
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "admin" });
        
        createTask.mockRejectedValue(new Error("Disk full"));

        await createTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Disk full" });
    });
});