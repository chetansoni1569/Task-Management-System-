const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const taskController = require('./taskController');

const MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/task_management_test_db';

const createMockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
};

describe('Task Input Validation and Error Handling (Issue #8)', () => {
  let testAdmin;
  let testUser;
  let existingTask;

  before(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(MONGO_URI);

    testAdmin = await User.create({
      name: 'Validation Admin',
      email: `val_admin_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      role: 'Admin'
    });

    testUser = await User.create({
      name: 'Validation User',
      email: `val_user_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      role: 'User'
    });

    existingTask = await Task.create({
      title: 'Initial Valid Task',
      description: 'Initial Valid Description',
      status: 'Pending',
      priority: 'Medium',
      assignedTo: testUser._id,
      createdBy: testAdmin._id
    });
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  it('rejects task creation with empty or whitespace title', async () => {
    const req = {
      body: {
        title: '   ',
        description: 'Valid Description',
        assignedTo: testUser._id.toString()
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Task title is required/);
  });

  it('rejects task creation with empty or whitespace description', async () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: '   ',
        assignedTo: testUser._id.toString()
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Task description is required/);
  });

  it('allows task creation without assignedTo user (unassigned)', async () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description'
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.task.assignedTo, null);
  });

  it('rejects task creation with invalid assignedTo format', async () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description',
        assignedTo: 'invalid-user-id'
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid user ID format/);
  });

  it('rejects task creation with nonexistent assignedTo user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const req = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description',
        assignedTo: fakeId.toString()
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 404);
    assert.match(res.body.message, /Assigned user not found/);
  });

  it('rejects task creation with invalid status value', async () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description',
        assignedTo: testUser._id.toString(),
        status: 'UnknownStatus'
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid status/);
  });

  it('rejects task creation with invalid priority value', async () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description',
        assignedTo: testUser._id.toString(),
        priority: 'Extreme'
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid priority/);
  });

  it('rejects task creation with invalid due date format', async () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description',
        assignedTo: testUser._id.toString(),
        dueDate: 'not-a-valid-date'
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid due date format/);
  });

  it('creates task with valid data and trims strings', async () => {
    const req = {
      body: {
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
        assignedTo: testUser._id.toString(),
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-12-31'
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.createTask(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.task.title, 'Trimmed Title');
    assert.equal(res.body.task.description, 'Trimmed Description');
    assert.equal(res.body.task.status, 'In Progress');
    assert.equal(res.body.task.priority, 'High');
  });

  it('rejects task update with empty title', async () => {
    const req = {
      params: { id: existingTask._id.toString() },
      body: { title: '   ' },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.updateTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Task title cannot be empty/);
  });

  it('rejects task update with empty description', async () => {
    const req = {
      params: { id: existingTask._id.toString() },
      body: { description: '   ' },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.updateTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Task description cannot be empty/);
  });

  it('rejects task update with invalid status', async () => {
    const req = {
      params: { id: existingTask._id.toString() },
      body: { status: 'NotAStatus' },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.updateTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid status/);
  });

  it('rejects task update with invalid priority', async () => {
    const req = {
      params: { id: existingTask._id.toString() },
      body: { priority: 'SuperHigh' },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.updateTask(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid priority/);
  });

  it('returns 404 when updating nonexistent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const req = {
      params: { id: fakeId.toString() },
      body: { title: 'New Title' },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.updateTask(req, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, 'Task not found');
  });

  it('updates task with valid inputs successfully', async () => {
    const req = {
      params: { id: existingTask._id.toString() },
      body: {
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'Completed',
        priority: 'Low'
      },
      user: testAdmin
    };
    const res = createMockRes();
    await taskController.updateTask(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.task.title, 'Updated Title');
    assert.equal(res.body.task.status, 'Completed');
    assert.equal(res.body.task.priority, 'Low');
  });
});
