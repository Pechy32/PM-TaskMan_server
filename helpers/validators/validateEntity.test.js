import { validateEntity } from './validateEntity.js';
import mongoose from 'mongoose';

describe('validateEntity Helper', () => {
    let mockGetEntityFn;

    beforeEach(() => {
        // Pro každý test vytvoříme čerstvou mock funkci
        mockGetEntityFn = jest.fn();
    });

    test('by měl vrátit valid: false, pokud je ID nesmyslný řetězec', async () => {
        const result = await validateEntity('neni-id-123', mockGetEntityFn, 'project');

        expect(result).toEqual({
            valid: false,
            message: 'Invalid project ID'
        });
        // getEntityFn by se v tomto případě vůbec neměla zavolat
        expect(mockGetEntityFn).not.toHaveBeenCalled();
    });

    test('by měl vrátit valid: false, pokud entita v databázi neexistuje', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        // Simulujeme, že DAO vrátí null (nenalezeno)
        mockGetEntityFn.mockResolvedValue(null);

        const result = await validateEntity(validId, mockGetEntityFn, 'user');

        expect(result).toEqual({
            valid: false,
            message: 'Associated user not found'
        });
        expect(mockGetEntityFn).toHaveBeenCalledWith(validId);
    });

    test('by měl vrátit valid: true, pokud entita existuje', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        // Simulujeme, že DAO vrátí nalezený objekt
        mockGetEntityFn.mockResolvedValue({ _id: validId, name: 'Existující entita' });

        const result = await validateEntity(validId, mockGetEntityFn, 'task');

        expect(result).toEqual({ valid: true });
        expect(mockGetEntityFn).toHaveBeenCalledWith(validId);
    });

    test('by měl vrátit valid: false, pokud DAO funkce vyhodí chybu (např. pád DB)', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        mockGetEntityFn.mockRejectedValue(new Error('Database down'));

        const result = await validateEntity(validId, mockGetEntityFn, 'project');

        expect(result).toEqual({
            valid: false,
            message: 'Error checking project existence'
        });
    });
});