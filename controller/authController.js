import express from 'express';

import { createTokens } from '../service/auth/jwtService.js';
import { loginWithEmail } from '../service/auth/authService.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
    const { body } = req;
    if(!body) 
        return res.status(400).send("Bad Request - InvalidInput");

    const { identifier, password } = body;
    if(typeof identifier !== "string" || typeof password !== "string") 
        return res.status(400).send("Bad Request - InvalidInputType");

    let tokens;
    try {
        tokens = await loginWithEmail(identifier, password);
    } catch (error) {
        return res.status(400).send(`Bad Request - ${error.message}`);
    }

    return res.status(200).send(tokens);
});

export default router;