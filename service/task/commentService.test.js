import { 
    getTaskCommentsService, 
    createTaskCommentService, 
    updateCommentService 
} from './commentService.js';
import { Task } from "../../model/taskModel.js";
import { getProject } from "../../dao/projectDao.js";
import { getTaskById } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

// Mockování závislostí
jest.mock("../../model/taskModel.js");
jest.mock("../../dao/projectDao.js");
jest.mock("../../dao/taskDao.js");
jest.mock("../../helpers/validators/validateEntity.js");

describe('Comment Service', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    describe('getTaskCommentsService', () => {
        test('by měl vrátit 403, pokud viewer není členem projektu', async () => {
            req = {
                params: { projectId: "p1", taskId: "t1" },
                user: { id: "u1", role: "user" }
            };
            
            validateEntity.mockResolvedValue({ valid: true });
            getProject.mockResolvedValue({ 
                ownerId: "other", 
                members: [] // Uživatel není členem
            });

            await getTaskCommentsService(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
        });

        test('by měl vrátit 404, pokud task nepatří do daného projektu', async () => {
            req = {
                params: { projectId: "p1", taskId: "t1" },
                user: { id: "u1", role: "admin" }
            };

            validateEntity.mockResolvedValue({ valid: true });
            getProject.mockResolvedValue({ ownerId: "u1", members: [] });
            // Task má jiné projectId
            getTaskById.mockResolvedValue({ projectId: "JINY_PROJEKT", comments: [] });

            await getTaskCommentsService(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "TaskNotInProject" });
        });
    });

    describe('createTaskCommentService', () => {
        test('by měl úspěšně přidat komentář a zavolat .save()', async () => {
            req = {
                params: { projectId: "p1", taskId: "t1" },
                body: { content: "Testovaci komentar" },
                user: { id: "u1", role: "admin" }
            };

            validateEntity.mockResolvedValue({ valid: true });
            getProject.mockResolvedValue({ ownerId: "u1", members: [] });
            
            // Simulace Mongoose objektu s metodou save() a push()
            const mockTask = {
                projectId: "p1",
                comments: {
                    push: jest.fn(),
                    length: 1,
                    0: { content: "Testovaci komentar", authorId: "u1" }
                },
                save: jest.fn().mockResolvedValue(true)
            };
            getTaskById.mockResolvedValue(mockTask);

            await createTaskCommentService(req, res);

            expect(mockTask.comments.push).toHaveBeenCalled();
            expect(mockTask.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateCommentService', () => {
        test('by měl vrátit 403, pokud se o editaci pokusí někdo jiný než autor', async () => {
            req = {
                params: { commentId: "c1" },
                body: { content: "Nova verze" },
                user: { id: "hacker", role: "user" }
            };

            const mockComment = { 
                _id: "c1", 
                authorId: "puvodni_autor",
                content: "stary obsah" 
            };
            const mockTask = {
                comments: {
                    id: jest.fn().mockReturnValue(mockComment)
                },
                save: jest.fn()
            };

            Task.findOne.mockResolvedValue(mockTask);

            await updateCommentService(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
            expect(mockTask.save).not.toHaveBeenCalled();
        });
    });
});