import { getTaskService } from './getTaskService.js';
import { getProject } from "../../dao/projectDao.js";
import { getTaskById } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

jest.mock("../../dao/projectDao.js");
jest.mock("../../dao/taskDao.js");
jest.mock("../../helpers/validators/validateEntity.js");

describe('getTaskService', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { projectId: "p1", taskId: "t1" },
            user: { id: "u1", role: "user" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('by měl vrátit 400, pokud validace projektu selže', async () => {
        validateEntity.mockResolvedValueOnce({ valid: false, message: "Invalid project" });

        await getTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid project" });
    });

    test('by měl vrátit 403, pokud uživatel není členem ani ownerem projektu', async () => {
        validateEntity.mockResolvedValueOnce({ valid: true }); // Projekt OK
        getProject.mockResolvedValue({
            ownerId: "someone_else",
            members: []
        });

        await getTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    test('by měl vrátit 404, pokud task neexistuje (validace tasku selže)', async () => {
        // 1. Projekt validace OK
        validateEntity.mockResolvedValueOnce({ valid: true });
        getProject.mockResolvedValue({ ownerId: "u1", members: [] });
        // 2. Task validace FAIL
        validateEntity.mockResolvedValueOnce({ valid: false, message: "Task not found" });

        await getTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Task not found" });
    });

    test('by měl vrátit 404, pokud task patří do jiného projektu', async () => {
        validateEntity.mockResolvedValue({ valid: true }); // Všechny validace OK
        getProject.mockResolvedValue({ ownerId: "u1", members: [] });
        getTaskById.mockResolvedValue({ projectId: "JINY_PROJEKT" });

        await getTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "TaskNotInProject" });
    });

    test('by měl vrátit task, pokud je uživatel admin', async () => {
        req.user.role = "admin";
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "any" });
        const mockTask = { _id: "t1", projectId: "p1", title: "Test Task" };
        getTaskById.mockResolvedValue(mockTask);

        await getTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTask);
    });
});