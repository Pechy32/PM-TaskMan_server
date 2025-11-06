import { getUserByEmail } from '../../dao/userDao.js';
import { createTokens } from './jwtService.js';

export async function loginWithEmail(email, password) {
    const user = await getUserByEmail(email);
    if(!user) 
        throw new Error("UserNotFound");

    if(password !== user.passwordHash)
        throw new Error("WrongPassword");

    // FIXME: isAdmin should be on user
    return createTokens(user.email, "admin");
}