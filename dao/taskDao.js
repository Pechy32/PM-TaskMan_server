import { Task } from '../model/taskModel.js';

export const getAllTasks = async (filters = {}, options = {}) => {
  const { sort = [] } = options;

  const aggregation = [{ $match: filters }];
  const finalSort = {};
  let needsPriorityOrder = false;

  // Helper function to add priorityOrder field
  const addPriorityOrderField = () => ({
    $addFields: {
      priorityOrder: {
        $switch: {
          branches: [
            { case: { $eq: ['$priority', 'Low'] }, then: 2 },
            { case: { $eq: ['$priority', 'Medium'] }, then: 3 },
            { case: { $eq: ['$priority', 'High'] }, then: 4 },
          ],
          default: 1, // Default for null/undefined priority
        },
      },
    },
  });

  // Helper function to add dueDateExists field - null values are at the end
  const addDueDateExistsField = () => ({
    $addFields: {
      dueDateExists: {
        $cond: {
          if: { $ne: ['$dueDate', null] }, 
          then: 0, 
          else: 1, 
        },
      },
    },
  });

  
  let needsDueDateExistsField = false;

  // final sorting object
  for (const { field, order } of sort) {
    if (field === 'priority') {
      needsPriorityOrder = true;
      finalSort['priorityOrder'] = order === 'desc' ? -1 : 1;
    } else if (field === 'dueDate') {
      needsDueDateExistsField = true; 
      finalSort['dueDateExists'] = order === 'asc' ? 1 : -1; 
      finalSort[field] = order === 'asc' ? 1 : -1;
    } else {
      finalSort[field] = order === 'desc' ? -1 : 1;
    }
  }

  // Default sorting if no specific fields are provided
  if (Object.keys(finalSort).length === 0) {
    needsPriorityOrder = true;
    needsDueDateExistsField = true; 
    Object.assign(finalSort, {
      dueDateExists: 1, 
      dueDate: 1,       
      priorityOrder: -1, 
      created: -1,       
    });
  }

  // Add fields for priorityOrder and dueDateExists if needed
  if (needsDueDateExistsField) {
    aggregation.push(addDueDateExistsField());
  }
  if (needsPriorityOrder) {
    aggregation.push(addPriorityOrderField());
  }

  // Sort the results based on the finalSort object
  if (Object.keys(finalSort).length > 0) {
    aggregation.push({ $sort: finalSort });
  }

  // Agregation
  const tasks = await Task.aggregate(aggregation);
  return tasks;
};

export const createTask = async (data) => {
  const task = new Task(data);
  return await task.save();
};

export const getTask = async (id) => {
  return await Task.findById(id).populate('solver');
};

export const updateTask = async (id, data) => {
  return await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('solver');
};

export const deleteTask = async (id) => {
  return await Task.findByIdAndDelete(id);
};