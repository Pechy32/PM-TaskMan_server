import { deleteTaskService } from './deleteTaskService.js';
import { getProject } from "../../dao/projectDao.js";
import { getTaskById, deleteTask } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

jest.mock("../../dao/projectDao.js");
jest.mock("../../dao/taskDao.js");
jest.mock("../../helpers/validators/validateEntity.js");

describe('deleteTaskService', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { projectId: "p1", taskId: "t1" },
            user: { id: "user_owner", role: "user" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    test('by měl vrátit 403, pokud uživatel není admin ani owner projektu', async () => {
        validateEntity.mockResolvedValueOnce({ valid: true }); // projekt ok
        getProject.mockResolvedValue({ ownerId: "someone_else" });

        await deleteTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
        expect(deleteTask).not.toHaveBeenCalled();
    });

    test('by měl vrátit 404, pokud task nepatří do projektu', async () => {
        req.user.role = "admin"; // Admin projde autorizací
        
        // 1. Validace projektu
        validateEntity.mockResolvedValueOnce({ valid: true });
        getProject.mockResolvedValue({ ownerId: "admin" });
        // 2. Validace tasku
        validateEntity.mockResolvedValueOnce({ valid: true });
        // 3. Task existuje, ale patří jinam
        getTaskById.mockResolvedValue({ projectId: "UPLNE_JINY_PROJEKT" });

        await deleteTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "TaskNotInProject" });
        expect(deleteTask).not.toHaveBeenCalled();
    });

    test('by měl úspěšně smazat task a vrátit 204 (Admin)', async () => {
        req.user.role = "admin";
        
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "any" });
        getTaskById.mockResolvedValue({ projectId: "p1" });
        deleteTask.mockResolvedValue(true);

        await deleteTaskService(req, res);

        expect(deleteTask).toHaveBeenCalledWith("t1");
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    test('by měl vrátit 500, pokud selže DAO vrstva', async () => {
        req.user.role = "admin";
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "any" });
        getTaskById.mockResolvedValue({ projectId: "p1" });
        
        deleteTask.mockRejectedValue(new Error("Database failure"));

        await deleteTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Database failure" });
    });
});