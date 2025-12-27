import { 
    getTaskCommentsService, 
    createTaskCommentService, 
    updateCommentService,
    deleteTaskCommentService 
} from './commentService.js';
import { Task } from "../../model/taskModel.js";
import { getProject } from "../../dao/projectDao.js";
import { getTaskById } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

jest.mock("../../model/taskModel.js");
jest.mock("../../dao/projectDao.js");
jest.mock("../../dao/taskDao.js");
jest.mock("../../helpers/validators/validateEntity.js");

describe('Comment Service - Full Coverage', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    /* ============================================================
     * TESTY PRO DELETE COMMENT (Ty v reportu chyběly nejvíce)
     * ============================================================ */
    describe('deleteTaskCommentService', () => {
        test('by měl vrátit 403, pokud uživatel není owner ani admin', async () => {
            req = {
                params: { projectId: "p1", taskId: "t1", commentId: "c1" },
                user: { id: "u1", role: "user" }
            };

            validateEntity.mockResolvedValue({ valid: true });
            getProject.mockResolvedValue({ ownerId: "someone_else", members: [] });

            await deleteTaskCommentService(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
        });

        test('by měl vrátit 404, pokud komentář v poli neexistuje', async () => {
            req = {
                params: { projectId: "p1", taskId: "t1", commentId: "non-existent" },
                user: { id: "u1", role: "admin" } // Admin může mazat
            };

            validateEntity.mockResolvedValue({ valid: true });
            getProject.mockResolvedValue({ ownerId: "u1", members: [] });
            
            const mockTask = {
                projectId: "p1",
                comments: [
                    { _id: { toString: () => "c1" } } // Jiné ID
                ],
                save: jest.fn()
            };
            getTaskById.mockResolvedValue(mockTask);

            await deleteTaskCommentService(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "CommentNotFound" });
        });

        test('by měl úspěšně smazat komentář a vrátit 204 (Admin access)', async () => {
            req = {
                params: { projectId: "p1", taskId: "t1", commentId: "c1" },
                user: { id: "admin-id", role: "admin" }
            };

            validateEntity.mockResolvedValue({ valid: true });
            getProject.mockResolvedValue({ ownerId: "u2", members: [] });

            const mockTask = {
                projectId: "p1",
                comments: {
                    findIndex: jest.fn().mockReturnValue(0),
                    splice: jest.fn()
                },
                save: jest.fn().mockResolvedValue(true)
            };
            getTaskById.mockResolvedValue(mockTask);

            await deleteTaskCommentService(req, res);

            expect(mockTask.comments.splice).toHaveBeenCalledWith(0, 1);
            expect(mockTask.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(204);
        });
    });

    /* ============================================================
     * TESTY PRO UPDATE COMMENT (Větvení autorizace)
     * ============================================================ */
    describe('updateCommentService', () => {
        test('by měl vrátit 400, pokud chybí content v body', async () => {
            req = { params: { commentId: "c1" }, body: {}, user: { id: "u1" } };
            await updateCommentService(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('by měl umožnit editaci adminovi, i když není autor', async () => {
            req = {
                params: { commentId: "c1" },
                body: { content: "Admin update" },
                user: { id: "admin-id", role: "admin" }
            };

            const mockComment = { 
                _id: "c1", 
                authorId: { toString: () => "puvodni-autor" }, 
                content: "stary" 
            };
            const mockTask = {
                comments: { id: jest.fn().mockReturnValue(mockComment) },
                save: jest.fn().mockResolvedValue(true)
            };

            Task.findOne.mockResolvedValue(mockTask);

            await updateCommentService(req, res);

            expect(mockComment.content).toBe("Admin update");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('by měl vrátit 404, pokud Task.findOne nenajde úkol s daným komentářem', async () => {
            req = {
                params: { commentId: "c1" },
                body: { content: "New content" },
                user: { id: "u1" }
            };
            Task.findOne.mockResolvedValue(null);

            await updateCommentService(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "CommentNotFound" });
        });
    });

    /* ============================================================
     * DOPLNĚNÍ OSTATNÍCH CHYBOVÝCH STAVŮ (Branch Coverage)
     * ============================================================ */
    describe('getTaskCommentsService branches', () => {
        test('by měl vrátit 400, pokud selže validace projektu', async () => {
            req = { params: { projectId: "invalid" }, user: { role: "admin" } };
            validateEntity.mockResolvedValue({ valid: false, message: "Invalid project ID" });

            await getTaskCommentsService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid project ID" });
        });
    });
});