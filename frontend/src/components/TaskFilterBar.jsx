import React from 'react';

/**
 * TaskFilterBar Component
 *
 * Provides title search, status filter, priority filter, assignee filter,
 * and a "Clear All Filters" button.
 */
function TaskFilterBar({
  searchTerm = '',
  onSearchChange,
  statusFilter = '',
  onStatusChange,
  priorityFilter = '',
  onPriorityChange,
  assigneeFilter = '',
  onAssigneeChange,
  onClearFilters,
  assigneeOptions = [],
  totalCount = 0,
  filteredCount = 0,
}) {
  const hasActiveFilters = Boolean(
    searchTerm.trim() || statusFilter || priorityFilter || assigneeFilter
  );

  // Ensure current assigneeFilter is included in options if it was selected or set
  const allAssignees = [...assigneeOptions];
  if (assigneeFilter && !allAssignees.includes(assigneeFilter)) {
    allAssignees.push(assigneeFilter);
  }

  return (
    <div className="filter-bar" data-testid="task-filter-bar">
      <div className="filter-bar-header">
        <div className="filter-bar-title">
          <span>Search & Filter Tasks</span>
          {hasActiveFilters && (
            <span className="badge badge-in-progress" style={{ fontSize: '11px' }}>
              Filters Active
            </span>
          )}
        </div>
        <div className="filter-results-badge">
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> tasks
        </div>
      </div>

      <div className="filter-grid">
        {/* 1. Search by Title */}
        <div className="filter-group">
          <label htmlFor="searchTitle">Search by Title</label>
          <input
            type="text"
            id="searchTitle"
            data-testid="search-input"
            className="form-control"
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* 2. Filter by Status */}
        <div className="filter-group">
          <label htmlFor="filterStatus">Status</label>
          <select
            id="filterStatus"
            data-testid="status-filter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* 3. Filter by Priority */}
        <div className="filter-group">
          <label htmlFor="filterPriority">Priority</label>
          <select
            id="filterPriority"
            data-testid="priority-filter"
            className="form-control"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* 4. Filter by Assignee */}
        <div className="filter-group">
          <label htmlFor="filterAssignee">Assignee</label>
          <select
            id="filterAssignee"
            data-testid="assignee-filter"
            className="form-control"
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
          >
            <option value="">All Assignees</option>
            {allAssignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Clear All Filters Button */}
        <div className="filter-group">
          <label style={{ visibility: 'hidden' }}>Reset</label>
          <button
            type="button"
            id="clearFiltersBtn"
            data-testid="clear-filters"
            className="btn btn-secondary clear-filters-btn"
            onClick={onClearFilters}
            title="Reset search and all filters"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskFilterBar;
