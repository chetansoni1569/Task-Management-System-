import React, { useState, useEffect, useMemo } from 'react';
import { getTasks, updateTaskStatus } from '../services/api';
import TaskFilterBar from '../components/TaskFilterBar';
import { filterTasks, getUniqueAssignees, getTaskAssigneeName } from '../utils/filterTasks';

function TaskDashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await getTasks();
      const data = response?.data ?? response;
      const taskList = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
          ? data.tasks
          : [];

      const isAdmin = Boolean(user && user.role && user.role.toLowerCase() === 'admin');

      if (!isAdmin) {
        const myTasks = taskList.filter((task) => {
          const assignee = getTaskAssigneeName(task);
          const userEmail = (user.email || '').toLowerCase();
          const userName = (user.name || '').toLowerCase();
          const userId = user._id || user.id || '';

          const assignedToObj = task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo : null;
          const assignedId = (assignedToObj ? (assignedToObj._id || assignedToObj.id) : '') || '';

          return (
            (assignee && assignee.toLowerCase() === userEmail) ||
            (assignee && assignee.toLowerCase() === userName) ||
            (assignedId && userId && assignedId.toString() === userId.toString()) ||
            (task.assignedUser && task.assignedUser.toLowerCase() === userEmail) ||
            (task.assignedUser && task.assignedUser.toLowerCase() === userName)
          );
        });
        setTasks(myTasks);
      } else {
        setTasks(taskList);
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load tasks from server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleStatusChange = async (taskId, newStatus) => {
    if (updatingTaskId === taskId) return;
    setUpdatingTaskId(taskId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateTaskStatus(taskId, newStatus);
      setSuccessMessage('Task status updated successfully!');

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId || t.id === taskId ? { ...t, status: newStatus } : t))
      );

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Could not update task status.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setAssigneeFilter('');
  };

  const assigneeOptions = useMemo(() => {
    return getUniqueAssignees(tasks);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, {
      searchTerm,
      statusFilter,
      priorityFilter,
      assigneeFilter,
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  const getStatusBadgeClass = (status) => {
    if (status === 'Completed') return 'badge badge-completed';
    if (status === 'In Progress') return 'badge badge-in-progress';
    return 'badge badge-pending';
  };

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'High') return 'badge badge-priority-high';
    if (priority === 'Medium') return 'badge badge-priority-medium';
    return 'badge badge-priority-low';
  };

  return (
    <div className="container">
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="card-title">My Task Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            View your assigned tasks and update your current progress.
          </p>
        </div>
        <button onClick={fetchTasks} className="btn btn-secondary btn-sm">
          Refresh Tasks
        </button>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Search and Filters Bar */}
      <TaskFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        onClearFilters={handleClearFilters}
        assigneeOptions={assigneeOptions}
        totalCount={tasks.length}
        filteredCount={filteredTasks.length}
      />

      {loading ? (
        <div className="empty-state">Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks assigned</h3>
          <p style={{ marginTop: '6px' }}>You currently have no tasks assigned to you.</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p style={{ marginTop: '6px', marginBottom: '14px' }}>
            No tasks match your current search and filter criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="btn btn-secondary btn-sm"
            id="clearFiltersEmptyBtn"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="task-grid">
          {filteredTasks.map((task) => {
            const taskId = task._id || task.id;
            const assigneeName = getTaskAssigneeName(task) || 'Unassigned';

            return (
              <div key={taskId} className="task-item">
                <div>
                  <div className="badges-row">
                    <span className={getStatusBadgeClass(task.status)}>
                      {task.status || 'Pending'}
                    </span>
                    <span className={getPriorityBadgeClass(task.priority)}>
                      {task.priority || 'Low'} Priority
                    </span>
                  </div>

                  <h3 className="task-item-title">{task.title}</h3>
                  <p className="task-item-desc">{task.description}</p>
                </div>

                <div>
                  <div className="task-meta">
                    <div>
                      <strong>Due Date:</strong> {task.dueDate || 'No due date'}
                    </div>
                    <div>
                      <strong>Assigned To:</strong> {assigneeName}
                    </div>
                  </div>

                  <div className="task-actions">
                    <label style={{ fontSize: '13px', fontWeight: '500' }}>
                      Update Status:
                    </label>
                    <select
                      className="form-control"
                      style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }}
                      value={task.status || 'Pending'}
                      onChange={(e) => handleStatusChange(taskId, e.target.value)}
                      disabled={updatingTaskId === taskId}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    {updatingTaskId === taskId && (
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
                        Updating...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TaskDashboard;
