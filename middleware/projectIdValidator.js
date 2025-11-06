import mongoose from 'mongoose';

import { getProject } from '../dao/projectDao.js';

export async function validateProject(req, res, next) {
    await validateProjectId(req, res, next, req.params.projectId);
}

export async function validateProjectId(req, res, next, projectId) {
    if(!projectId)
        return next();
    
    try {
        let objectId;

        if (mongoose.Types.ObjectId.isValid(projectId)) {
            objectId = projectId;
        } else {
            objectId = new mongoose.Types.ObjectId(projectId);
        }
        
        if (!mongoose.Types.ObjectId.isValid(objectId)) 
            throw new Error("InvalidProjectId")

        const project = await getProject(objectId);
        if(!project) 
            throw new Error("ProjectNotFound")
        
        // put useful project information into `req`
        req.projectId = req.projectId ?? project._id;
        req.projectMembers = req.members ?? (project.members ?? []);

        next();
    } catch (error) {
        return res.status(404).send(`Not Found - ${error.message}`);
    }
}
