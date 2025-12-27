import { updateTaskService } from './updateTaskService.js';
import { getProject } from "../../dao/projectDao.js";
import { getTaskById, updateTask } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

jest.mock("../../dao/projectDao.js");
jest.mock("../../dao/taskDao.js");
jest.mock("../../helpers/validators/validateEntity.js");

describe('updateTaskService', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { projectId: "p1", taskId: "t1" },
            body: { title: "Nový název úkolu", status: "done" },
            user: { id: "u1", role: "user" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('by měl vrátit 403, pokud uživatel nemá roli editor ani není owner', async () => {
        validateEntity.mockResolvedValueOnce({ valid: true }); // Projekt OK
        getProject.mockResolvedValue({
            ownerId: "someone_else",
            members: [{ userId: "u1", role: "viewer" }] // Jen viewer
        });

        await updateTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
        expect(updateTask).not.toHaveBeenCalled();
    });

    test('by měl vrátit 404, pokud task nepatří do projektu', async () => {
        req.user.role = "admin"; // Admin projde autorizací
        validateEntity.mockResolvedValue({ valid: true }); // Všechny validace projdou
        getProject.mockResolvedValue({ ownerId: "admin" });
        // Task existuje, ale v jiném projektu
        getTaskById.mockResolvedValue({ _id: "t1", projectId: "JINY_PROJEKT" });

        await updateTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "TaskNotInProject" });
        expect(updateTask).not.toHaveBeenCalled();
    });

    test('by měl úspěšně aktualizovat task, pokud je uživatel Editor', async () => {
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({
            ownerId: "admin",
            members: [{ userId: "u1", role: "editor" }]
        });
        getTaskById.mockResolvedValue({ _id: "t1", projectId: "p1" });
        
        const mockUpdatedTask = { _id: "t1", title: "Nový název úkolu", status: "done" };
        updateTask.mockResolvedValue(mockUpdatedTask);

        await updateTaskService(req, res);

        expect(updateTask).toHaveBeenCalledWith("t1", req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUpdatedTask);
    });

    test('by měl vrátit 500, pokud updateTask vyhodí chybu', async () => {
        req.user.role = "admin";
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "admin" });
        getTaskById.mockResolvedValue({ _id: "t1", projectId: "p1" });
        
        updateTask.mockRejectedValue(new Error("Database error"));

        await updateTaskService(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
});