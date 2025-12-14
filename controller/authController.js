import express from 'express';
import { loginWithEmail } from '../service/auth/authService.js';
import { refreshToken } from "../service/auth/jwtService.js";
import passport from "passport";

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

router.post('/refresh-token', async (req, res, next) => {
    const oldRefreshToken = req.body.refreshToken;
    return res.send(refreshToken(oldRefreshToken));
})

// Google auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => res.redirect("/")
);

export default router;
