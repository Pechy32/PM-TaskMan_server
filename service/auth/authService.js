import { getUserByEmail, getUser } from '../../dao/userDao.js';
import { getProject } from '../../dao/projectDao.js';

import { createTokens } from './jwtService.js';

export async function loginWithEmail(email, password) {
    const user = await getUserByEmail(email);
    if(!user) 
        throw new Error("UserNotFound");

    if(password !== user.passwordHash)
        throw new Error("WrongPassword");

    return createTokens(user.email, user.isAdmin ? "admin" : "user");
}

export async function getUserRoleForProject(userIdentifier, projectIdentifier) {
    // find specific project
    const project = await getProject(projectIdentifier);
    if(!project)
        throw new Error("ProjectNotFound")
    
    // is owner?
    const ownerUser = await getUser(project.ownerId)
    if(ownerUser.email === userIdentifier)
        return "owner";

    // is member? With what role?
    const userAsMember = project.members.find(m => m.user === userIdentifier);
    if(userAsMember && userAsMember.role)
        return userAsMember.role; // "editor" | "viewer"

    return false;
}