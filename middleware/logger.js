function logger(req, res, next) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || 'unknown';
    const startTime = new Date();

    res.on('finish', () => {
        const finishTime = new Date();
        const durationInMs = finishTime.getTime() - startTime.getTime()
        const { statusCode } = res;

        const reset = '\x1b[0m';
        const colors = {
            green: '\x1b[32m',
            orange: '\x1b[33m',
            red: '\x1b[31m',
            white: '\x1b[37m'
        };

        let color = colors.white;
        if (statusCode >= 200 && statusCode < 300) 
            color = colors.green;

        else if (statusCode >= 400 && statusCode < 500) 
            color = colors.orange;

        else if (statusCode >= 500) 
            color = colors.red;

        console.log(
            `${color}[${finishTime.toISOString()}] ${method} ${originalUrl} | ${statusCode} | ${userAgent} | ${durationInMs} ms${reset}`
        );
    
    });

    next();
}

export default logger;
