import React, { useState, useEffect, useMemo } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getUsers } from '../services/api';
import TaskFilterBar from '../components/TaskFilterBar';
import { filterTasks, getUniqueAssignees, getTaskAssigneeName } from '../utils/filterTasks';

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const fetchAllTasks = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getTasks();
      const taskList = Array.isArray(data) ? data : (data.tasks || []);
      setTasks(taskList);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const data = await getUsers();
      const memberList = Array.isArray(data) ? data : (data.users || []);
      setTeamMembers(memberList);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  useEffect(() => {
    fetchAllTasks();
    fetchTeamMembers();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('Pending');
    setPriority('Medium');
    setDueDate('');
    setAssignedTo('');
    setEditingTaskId(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (!title || !title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }

    if (!description || !description.trim()) {
      setErrorMessage('Task description is required.');
      return;
    }

    if (!dueDate) {
      setErrorMessage('Due date is required.');
      return;
    }

    setSubmitting(true);

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      assignedTo: assignedTo ? assignedTo : null,
    };

    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, taskPayload);
        setSuccessMessage('Task updated successfully!');
      } else {
        await createTask(taskPayload);
        setSuccessMessage('Task created successfully!');
      }

      resetForm();
      fetchAllTasks();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (task) => {
    const taskId = task._id || task.id;
    setEditingTaskId(taskId);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setStatus(task.status || 'Pending');
    setPriority(task.priority || 'Medium');
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    
    const assignedId = task.assignedTo && typeof task.assignedTo === 'object'
      ? (task.assignedTo._id || task.assignedTo.id)
      : (task.assignedTo || '');
    setAssignedTo(assignedId || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (taskId) => {
    if (deletingId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    setDeletingId(taskId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteTask(taskId);
      setSuccessMessage('Task deleted successfully!');
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId && t.id !== taskId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete task.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container">
      <div className="card-header">
        <div>
          <h1 className="card-title">Task Management (Admin)</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Add, edit, view, and delete tasks for all team members.
          </p>
        </div>
        <button onClick={fetchAllTasks} className="btn btn-secondary btn-sm">
          Refresh List
        </button>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>
          {editingTaskId ? 'Edit Task' : 'Add New Task'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="form-group">
              <label htmlFor="taskTitle">Task Title *</label>
              <input
                type="text"
                id="taskTitle"
                className="form-control"
                placeholder="e.g. Design Login Page"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo">Assign To Team Member</label>
              <select
                id="assignedTo"
                name="assignedTo"
                className="form-control"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => {
                  const memberId = member._id || member.id;
                  return (
                    <option key={memberId} value={memberId}>
                      {member.name} ({member.email})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="taskDescription">Description *</label>
            <textarea
              id="taskDescription"
              className="form-control"
              placeholder="Enter brief task details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                type="date"
                id="dueDate"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? (editingTaskId ? 'Updating Task...' : 'Adding Task...')
                : (editingTaskId ? 'Update Task' : 'Add Task')}
            </button>
            {editingTaskId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Task Filters Bar */}
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

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#1e293b' }}>
          All Tasks ({tasks.length})
        </h2>

        {loading ? (
          <div className="empty-state">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No tasks created yet. Use the form above to add a task.</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p style={{ marginTop: '6px', marginBottom: '14px' }}>
              No tasks match your current search and filter criteria.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-secondary btn-sm"
              id="clearFiltersEmptyBtn"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const taskId = task._id || task.id;
                  const assigneeName = getTaskAssigneeName(task) || 'Unassigned';

                  return (
                    <tr key={taskId}>
                      <td>
                        <strong>{task.title}</strong>
                      </td>
                      <td style={{ maxWidth: '240px' }}>{task.description}</td>
                      <td>
                        <span
                          className={`badge ${
                            task.status === 'Completed'
                              ? 'badge-completed'
                              : task.status === 'In Progress'
                              ? 'badge-in-progress'
                              : 'badge-pending'
                          }`}
                        >
                          {task.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            task.priority === 'High'
                              ? 'badge-priority-high'
                              : task.priority === 'Medium'
                              ? 'badge-priority-medium'
                              : 'badge-priority-low'
                          }`}
                        >
                          {task.priority || 'Low'}
                        </span>
                      </td>
                      <td>{task.dueDate || '-'}</td>
                      <td>{assigneeName}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleEditClick(task)}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(taskId)}
                            className="btn btn-danger btn-sm"
                            disabled={deletingId === taskId}
                          >
                            {deletingId === taskId ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskManagement;
