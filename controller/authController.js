import express from 'express';
import { loginWithEmail, registerWithEmail } from '../service/auth/authService.js';
import { refreshToken, generateTokens } from "../service/auth/jwtService.js";
import passport from "passport";

const router = express.Router();

/**
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const tokens = await registerWithEmail(
      name,
      email,
      password
    );

    return res.status(201).json(tokens);
  } catch (err) {
    if (err.message === "EmailAlreadyRegistered") {
      return res.status(409).json({ message: err.message });
    }

    return res.status(400).json({ message: err.message });
  }
});

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const tokens = await loginWithEmail(email, password);

    return res.status(200).json(tokens);
  } catch (err) {
    if (
      err.message === "InvalidCredentials" ||
      err.message === "PasswordLoginNotAllowed"
    ) {
      return res.status(401).json({ message: err.message });
    }

    return res.status(400).json({ message: err.message });
  }
});

// refresh token
router.post('/refresh-token', async (req, res, next) => {
    const oldRefreshToken = req.body.refreshToken;
    return res.send(refreshToken(oldRefreshToken));
})

// Google auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;

    const tokens = generateTokens(user);

    res.status(200).json(tokens);
  }
);

export default router;
