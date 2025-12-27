import { validateProject, validateProjectId } from './projectIdValidator.js';
import { getProject } from '../dao/projectDao.js';
import mongoose from 'mongoose';

// Mockování DAO vrstvy
jest.mock('../dao/projectDao.js');

describe('projectIdValidator Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {},
            // Připravíme prázdné objekty, které middleware doplňuje
            projectId: null,
            projectMembers: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });



    test('by měl zavolat next(), pokud projectId není zadáno', async () => {
        await validateProjectId(req, res, next, null);
        
        expect(next).toHaveBeenCalled();
        expect(getProject).not.toHaveBeenCalled();
    });

    test('by měl vrátit 404, pokud projekt v databázi neexistuje', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        getProject.mockResolvedValue(null);

        await validateProjectId(req, res, next, validId);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not Found - ProjectNotFound');
        expect(next).not.toHaveBeenCalled();
    });

    test('by měl úspěšně nastavit data do req a zavolat next(), pokud projekt existuje', async () => {
        const validId = new mongoose.Types.ObjectId();
        const mockProject = {
            _id: validId,
            members: [{ userId: 'u1', role: 'admin' }]
        };
        getProject.mockResolvedValue(mockProject);

        await validateProjectId(req, res, next, validId.toString());

        // Ověření, že data byla "přibalena" k požadavku
        expect(req.projectId).toEqual(validId);
        expect(req.projectMembers).toEqual(mockProject.members);
        expect(next).toHaveBeenCalled();
    });

    test('by měl vrátit 404, pokud je ID v neplatném formátu a Mongoose selže', async () => {
        // "short" není validní ObjectId
        await validateProjectId(req, res, next, "short");

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Not Found'));
    });


    test('validateProject by měl automaticky vzít ID z req.params.projectId', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        req.params.projectId = validId;
        getProject.mockResolvedValue({ _id: validId, members: [] });

        await validateProject(req, res, next);

        expect(getProject).toHaveBeenCalledWith(expect.anything());
        expect(next).toHaveBeenCalled();
    });
});