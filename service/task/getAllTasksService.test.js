import { getAllTasksService } from './getAllTasksService.js';
import { getAllTasks, getSubtasks } from "../../dao/taskDao.js";

jest.mock("../../dao/taskDao.js");

describe('getAllTasksService', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {}; // getAllTasksService nevyužívá žádná data z req
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('by měl vrátit seznam úkolů i s jejich podúkoly', async () => {
        // Příprava mock dat pro úkoly
        const mockTask1 = { 
            _id: "t1", 
            title: "Task 1", 
            toObject: jest.fn().mockReturnValue({ _id: "t1", title: "Task 1" }) 
        };
        const mockTask2 = { 
            _id: "t2", 
            title: "Task 2", 
            toObject: jest.fn().mockReturnValue({ _id: "t2", title: "Task 2" }) 
        };

        getAllTasks.mockResolvedValue([mockTask1, mockTask2]);
        
        // Nastavení různých podúkolů pro různé tasky
        getSubtasks.mockImplementation((id) => {
            if (id === "t1") return Promise.resolve([{ title: "Sub A" }]);
            if (id === "t2") return Promise.resolve([{ title: "Sub B" }]);
            return Promise.resolve([]);
        });

        await getAllTasksService(req, res);

        expect(getAllTasks).toHaveBeenCalledTimes(1);
        expect(getSubtasks).toHaveBeenCalledTimes(2);
        
        // Ověření finální struktury
        expect(res.json).toHaveBeenCalledWith([
            { _id: "t1", title: "Task 1", subtasks: [{ title: "Sub A" }] },
            { _id: "t2", title: "Task 2", subtasks: [{ title: "Sub B" }] }
        ]);
    });

    test('by měl vrátit 500, pokud selže načítání úkolů', async () => {
        getAllTasks.mockRejectedValue(new Error("Database connection lost"));

        await getAllTasksService(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Database connection lost" });
    });

    test('by měl vrátit prázdné pole, pokud v databázi nejsou žádné úkoly', async () => {
        getAllTasks.mockResolvedValue([]);

        await getAllTasksService(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
        expect(getSubtasks).not.toHaveBeenCalled();
    });
});