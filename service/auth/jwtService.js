import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "some_real_secret";

const ACCESS_TOKEN_TTL = "1h";
const REFRESH_TOKEN_TTL = "7d";


export function generateTokens(user) {
  if (!user?._id) {
    throw new Error("User is required to generate tokens");
  }

  const basePayload = {
    sub: user._id.toString(),     
    email: user.email,
    role: user.isAdmin ? "admin" : "user",
  };

  const accessToken = jwt.sign(
    { ...basePayload, type: "access" },
    SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = jwt.sign(
    { ...basePayload, type: "refresh" },
    SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

  return { accessToken, refreshToken };
}


export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function refreshToken(oldRefreshToken) {
  const payload = verifyToken(oldRefreshToken);

  if (!payload || payload.type !== "refresh") {
    return null;
  }

  const user = {
    _id: payload.sub,
    email: payload.email,
    isAdmin: payload.role === "admin",
  };

  return generateTokens(user);
}
