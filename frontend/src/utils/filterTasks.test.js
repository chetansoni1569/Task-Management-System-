import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterTasks, getUniqueAssignees, getTaskAssigneeName } from './filterTasks.js';

const mockTasks = [
  {
    _id: '1',
    title: 'Design Login Page',
    description: 'Create responsive mockup for login',
    status: 'Pending',
    priority: 'High',
    assignedTo: { _id: 'u1', name: 'Alice Smith', email: 'alice@example.com' },
  },
  {
    _id: '2',
    title: 'Implement Authentication API',
    description: 'JWT login and registration endpoints',
    status: 'In Progress',
    priority: 'High',
    assignedUser: 'Bob Jones',
  },
  {
    _id: '3',
    title: 'Setup MongoDB Database',
    description: 'Create collections and indexes',
    status: 'Completed',
    priority: 'Medium',
    assignedTo: 'Charlie Brown',
  },
  {
    _id: '4',
    title: 'Write Unit Tests for Task Service',
    description: 'Coverage for CRUD and filtering logic',
    status: 'Pending',
    priority: 'Low',
    assignedTo: { _id: 'u2', name: 'Alice Smith', email: 'alice@example.com' },
  },
  {
    _id: '5',
    title: 'Design Dashboard UI',
    description: 'Task cards and status update controls',
    status: 'In Progress',
    priority: 'Medium',
    assignedUser: 'Dana Scully',
  },
  {
    _id: '6',
    title: 'Deploy to Production Server',
    description: 'Configure reverse proxy and SSL',
    status: 'Pending',
    priority: 'Low',
    assignedTo: null,
    assignedUser: '',
  },
];

describe('Search tasks by title (case-insensitive)', () => {
  it('finds tasks matching lowercase query', () => {
    const results = filterTasks(mockTasks, { searchTerm: 'design' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['1', '5']
    );
  });

  it('finds tasks matching uppercase query', () => {
    const results = filterTasks(mockTasks, { searchTerm: 'DESIGN' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['1', '5']
    );
  });

  it('finds tasks matching mixed case query with whitespace', () => {
    const results = filterTasks(mockTasks, { searchTerm: '  lOgIn  ' });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '1');
  });

  it('returns all tasks when search term is empty or whitespace only', () => {
    const results = filterTasks(mockTasks, { searchTerm: '   ' });
    assert.equal(results.length, 6);
  });

  it('returns empty array when no title matches', () => {
    const results = filterTasks(mockTasks, { searchTerm: 'nonexistent-query-xyz' });
    assert.equal(results.length, 0);
  });
});

describe('Filter by status', () => {
  it('filters by "Pending"', () => {
    const results = filterTasks(mockTasks, { statusFilter: 'Pending' });
    assert.equal(results.length, 3);
    assert.deepEqual(
      results.map((t) => t._id),
      ['1', '4', '6']
    );
  });

  it('filters by "In Progress" (case-insensitive)', () => {
    const results = filterTasks(mockTasks, { statusFilter: 'in progress' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['2', '5']
    );
  });

  it('filters by "Completed"', () => {
    const results = filterTasks(mockTasks, { statusFilter: 'Completed' });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '3');
  });

  it('returns all tasks when statusFilter is empty', () => {
    const results = filterTasks(mockTasks, { statusFilter: '' });
    assert.equal(results.length, 6);
  });
});

describe('Filter by priority', () => {
  it('filters by "High"', () => {
    const results = filterTasks(mockTasks, { priorityFilter: 'High' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['1', '2']
    );
  });

  it('filters by "Medium"', () => {
    const results = filterTasks(mockTasks, { priorityFilter: 'Medium' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['3', '5']
    );
  });

  it('filters by "Low"', () => {
    const results = filterTasks(mockTasks, { priorityFilter: 'Low' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['4', '6']
    );
  });

  it('returns all tasks when priorityFilter is empty', () => {
    const results = filterTasks(mockTasks, { priorityFilter: '' });
    assert.equal(results.length, 6);
  });
});

describe('Filter by assignee', () => {
  it('filters by populated assignee name (Alice Smith)', () => {
    const results = filterTasks(mockTasks, { assigneeFilter: 'Alice Smith' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['1', '4']
    );
  });

  it('filters by populated assignee email (alice@example.com)', () => {
    const results = filterTasks(mockTasks, { assigneeFilter: 'alice@example.com' });
    assert.equal(results.length, 2);
    assert.deepEqual(
      results.map((t) => t._id),
      ['1', '4']
    );
  });

  it('filters by assignedUser string (Bob Jones)', () => {
    const results = filterTasks(mockTasks, { assigneeFilter: 'Bob Jones' });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '2');
  });

  it('filters by assignedTo string (Charlie Brown)', () => {
    const results = filterTasks(mockTasks, { assigneeFilter: 'Charlie Brown' });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '3');
  });

  it('filters by "Unassigned"', () => {
    const results = filterTasks(mockTasks, { assigneeFilter: 'Unassigned' });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '6');
  });

  it('returns all tasks when assigneeFilter is empty', () => {
    const results = filterTasks(mockTasks, { assigneeFilter: '' });
    assert.equal(results.length, 6);
  });
});

describe('Multi-filter and search working together', () => {
  it('combines title search and status filter', () => {
    const results = filterTasks(mockTasks, {
      searchTerm: 'design',
      statusFilter: 'Pending',
    });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '1');
  });

  it('combines title search, status, and priority', () => {
    const results = filterTasks(mockTasks, {
      searchTerm: 'design',
      statusFilter: 'In Progress',
      priorityFilter: 'Medium',
    });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '5');
  });

  it('combines all 4: title, status, priority, and assignee', () => {
    const results = filterTasks(mockTasks, {
      searchTerm: 'login',
      statusFilter: 'Pending',
      priorityFilter: 'High',
      assigneeFilter: 'Alice Smith',
    });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, '1');
  });

  it('returns empty array when filter combination has no match', () => {
    const results = filterTasks(mockTasks, {
      searchTerm: 'login',
      statusFilter: 'Completed', // Task 1 is Pending
    });
    assert.equal(results.length, 0);
  });
});

describe('Clear all filters', () => {
  it('returns all original tasks when resetting all filters to initial empty values', () => {
    // 1. Apply multiple restrictive filters
    const filtered = filterTasks(mockTasks, {
      searchTerm: 'setup',
      statusFilter: 'Completed',
      priorityFilter: 'Medium',
      assigneeFilter: 'Charlie Brown',
    });
    assert.equal(filtered.length, 1);

    // 2. Clear all filters (reset state)
    const cleared = filterTasks(mockTasks, {
      searchTerm: '',
      statusFilter: '',
      priorityFilter: '',
      assigneeFilter: '',
    });
    assert.equal(cleared.length, mockTasks.length);
  });
});

describe('Assignee helper utilities', () => {
  it('extracts unique, sorted assignees from tasks', () => {
    const assignees = getUniqueAssignees(mockTasks);
    assert.deepEqual(assignees, [
      'Alice Smith',
      'Bob Jones',
      'Charlie Brown',
      'Dana Scully',
    ]);
  });

  it('extracts correct assignee name across different task formats', () => {
    assert.equal(getTaskAssigneeName(mockTasks[0]), 'Alice Smith');
    assert.equal(getTaskAssigneeName(mockTasks[1]), 'Bob Jones');
    assert.equal(getTaskAssigneeName(mockTasks[2]), 'Charlie Brown');
    assert.equal(getTaskAssigneeName(mockTasks[5]), '');
    assert.equal(getTaskAssigneeName(null), '');
  });
});
