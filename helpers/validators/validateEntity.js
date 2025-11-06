import mongoose from "mongoose";

/**
 * Generic validator for checking whether an entity with a given ID exists.
 *
 * @param {string} id - The ID of the entity to validate (e.g., userId, projectId).
 * @param {Function} getEntityFn - The DAO function used to retrieve the entity by ID (e.g., getUser, getProject).
 * @param {string} entityName - The name of the entity (used for human-readable error messages).
 * @returns {Promise<{ valid: boolean, message?: string }>} 
 *          An object containing a validation result and an optional error message.
 */
export async function validateEntity(id, getEntityFn, entityName) {
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { valid: false, message: `Invalid ${entityName} ID` };
  }

  // Check if entity exists
  try {
    const entity = await getEntityFn(id);
    if (!entity) {
      return { valid: false, message: `Associated ${entityName} not found` };
    }
  } catch (err) {
    return { valid: false, message: `Error checking ${entityName} existence` };
  }

  // Validation passed
  return { valid: true };
}
