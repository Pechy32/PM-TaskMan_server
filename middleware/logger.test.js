import logger from './logger.js';

describe('logger Middleware', () => {
    let req, res, next;
    let consoleSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Sledujeme console.log a zabráníme skutečnému vypisování do terminálu během testů
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        req = {
            method: 'GET',
            originalUrl: '/api/tasks',
            get: jest.fn().mockReturnValue('Jest-Test-Agent')
        };

        // res v Expressu je EventEmitter, musíme simulovat metodu 'on'
        res = {
            statusCode: 200,
            on: jest.fn()
        };

        next = jest.fn();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    test('by měl zavolat next() okamžitě', () => {
        logger(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('by měl zaregistrovat listener na událost "finish"', () => {
        logger(req, res, next);
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    test('by měl vypsat zelený log pro status 200', () => {
        logger(req, res, next);

        // Získáme callback funkci, která byla zaregistrována na 'finish'
        const finishCallback = res.on.mock.calls.find(call => call[0] === 'finish')[1];

        // Simulujeme dokončení požadavku
        res.statusCode = 200;
        finishCallback();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('\x1b[32m')); // green color code
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('GET /api/tasks | 200'));
    });

    test('by měl vypsat oranžový log pro status 400', () => {
        logger(req, res, next);
        const finishCallback = res.on.mock.calls.find(call => call[0] === 'finish')[1];

        res.statusCode = 404;
        finishCallback();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('\x1b[33m')); // orange color code
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('404'));
    });

    test('by měl vypsat červený log pro status 500', () => {
        logger(req, res, next);
        const finishCallback = res.on.mock.calls.find(call => call[0] === 'finish')[1];

        res.statusCode = 500;
        finishCallback();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('\x1b[31m')); // red color code
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('500'));
    });

    test('by měl použít "unknown", pokud user-agent chybí', () => {
        req.get.mockReturnValue(null);
        logger(req, res, next);
        const finishCallback = res.on.mock.calls.find(call => call[0] === 'finish')[1];

        finishCallback();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('unknown'));
    });
});