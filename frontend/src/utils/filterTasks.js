/**
 * Utility functions for filtering tasks and extracting assignee information.
 */

/**
 * Safely extracts a displayable assignee name from a task.
 *
 * @param {Object} task
 * @returns {string}
 */
export function getTaskAssigneeName(task) {
  if (!task) return '';
  if (task.assignedTo && typeof task.assignedTo === 'object') {
    return task.assignedTo.name || task.assignedTo.email || '';
  }
  if (typeof task.assignedUser === 'string' && task.assignedUser.trim() !== '') {
    return task.assignedUser.trim();
  }
  if (typeof task.assignedTo === 'string' && task.assignedTo.trim() !== '') {
    return task.assignedTo.trim();
  }
  return '';
}

/**
 * Extracts a sorted list of unique assignee names from a list of tasks.
 *
 * @param {Array} tasks
 * @returns {Array<string>}
 */
export function getUniqueAssignees(tasks) {
  if (!Array.isArray(tasks)) return [];
  const set = new Set();
  tasks.forEach((task) => {
    const assignee = getTaskAssigneeName(task);
    if (assignee) {
      set.add(assignee);
    }
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Filters a list of tasks based on title search, status, priority, and assignee.
 * Supports case-insensitive title search and all combinations of filters.
 *
 * @param {Array} tasks
 * @param {Object} [filters]
 * @param {string} [filters.searchTerm]
 * @param {string} [filters.statusFilter]
 * @param {string} [filters.priorityFilter]
 * @param {string} [filters.assigneeFilter]
 * @returns {Array} Filtered tasks
 */
export function filterTasks(
  tasks,
  { searchTerm = '', statusFilter = '', priorityFilter = '', assigneeFilter = '' } = {}
) {
  if (!Array.isArray(tasks)) return [];

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedStatus = statusFilter.trim().toLowerCase();
  const normalizedPriority = priorityFilter.trim().toLowerCase();
  const normalizedAssignee = assigneeFilter.trim().toLowerCase();

  return tasks.filter((task) => {
    // 1. Title Search (case-insensitive)
    if (normalizedSearch) {
      const title = (task.title || '').toLowerCase();
      if (!title.includes(normalizedSearch)) {
        return false;
      }
    }

    // 2. Status Filter
    if (normalizedStatus) {
      const status = (task.status || '').toLowerCase();
      if (status !== normalizedStatus) {
        return false;
      }
    }

    // 3. Priority Filter
    if (normalizedPriority) {
      const priority = (task.priority || '').toLowerCase();
      if (priority !== normalizedPriority) {
        return false;
      }
    }

    // 4. Assignee Filter
    if (normalizedAssignee) {
      if (task.assignedTo && typeof task.assignedTo === 'object') {
        const name = (task.assignedTo.name || '').toLowerCase();
        const email = (task.assignedTo.email || '').toLowerCase();
        const id = (task.assignedTo._id || task.assignedTo.id || '').toString().toLowerCase();

        const match =
          name === normalizedAssignee ||
          email === normalizedAssignee ||
          id === normalizedAssignee ||
          name.includes(normalizedAssignee) ||
          email.includes(normalizedAssignee);

        if (!match) return false;
      } else {
        const userStr = (
          task.assignedUser ||
          (typeof task.assignedTo === 'string' ? task.assignedTo : '') ||
          ''
        )
          .trim()
          .toLowerCase();

        if (normalizedAssignee === 'unassigned') {
          if (userStr !== '' && userStr !== 'unassigned') return false;
        } else if (userStr !== normalizedAssignee && !userStr.includes(normalizedAssignee)) {
          return false;
        }
      }
    }

    return true;
  });
}
