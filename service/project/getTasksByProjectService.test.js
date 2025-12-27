import { getTasksByProjectService } from './getTasksByProjectService.js';
import { getProject } from "../../dao/projectDao.js";
import { getTasksByProject, getSubtasks } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

jest.mock("../../dao/projectDao.js");
jest.mock("../../dao/taskDao.js");
jest.mock("../../helpers/validators/validateEntity.js");

describe('getTasksByProjectService', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { projectId: "proj123" },
            user: { id: "user1", role: "user" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('by měl vrátit 400, pokud validace projektu selže', async () => {
        validateEntity.mockResolvedValue({ valid: false, message: "Invalid project" });

        await getTasksByProjectService(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid project" });
    });

    test('by měl vrátit 403, pokud uživatel není admin, owner ani member', async () => {
        validateEntity.mockResolvedValue({ valid: true });
        // Simulujeme projekt, kde uživatel user1 nefiguruje
        getProject.mockResolvedValue({
            ownerId: "someone_else",
            members: [{ userId: "another_user" }]
        });

        await getTasksByProjectService(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    test('by měl vrátit tasky i se subtasky pro admina', async () => {
        req.user.role = "admin";
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "any" });

        // Mockujeme tasky - musí mít metodu toObject()!
        const mockTask = { 
            _id: "task1", 
            title: "Udělat testy", 
            toObject: jest.fn().mockReturnValue({ _id: "task1", title: "Udělat testy" }) 
        };
        const mockSubtasks = [{ title: "Subtask A" }];

        getTasksByProject.mockResolvedValue([mockTask]);
        getSubtasks.mockResolvedValue(mockSubtasks);

        await getTasksByProjectService(req, res);

        expect(res.json).toHaveBeenCalledWith([
            { _id: "task1", title: "Udělat testy", subtasks: mockSubtasks }
        ]);
        expect(getSubtasks).toHaveBeenCalledWith("task1");
    });

    test('by měl vrátit 500, pokud selže databáze při načítání tasků', async () => {
        validateEntity.mockResolvedValue({ valid: true });
        getProject.mockResolvedValue({ ownerId: "user1", members: [] });
        getTasksByProject.mockRejectedValue(new Error("Database error"));

        await getTasksByProjectService(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
});