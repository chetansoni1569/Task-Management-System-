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

describe('Task Status Management (Issue #5)', () => {
  let testAdmin;
  let testUser1;
  let testUser2;
  let taskForUser1;
  let taskForUser2;

  before(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(MONGO_URI);

    testAdmin = await User.create({
      name: 'Status Test Admin',
      email: `admin_status_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      role: 'Admin'
    });

    testUser1 = await User.create({
      name: 'Status Test Member 1',
      email: `user1_status_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      role: 'User'
    });

    testUser2 = await User.create({
      name: 'Status Test Member 2',
      email: `user2_status_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      role: 'User'
    });

    taskForUser1 = await Task.create({
      title: 'Task for User 1',
      description: 'Initial Pending Task',
      status: 'Pending',
      priority: 'Medium',
      assignedTo: testUser1._id,
      createdBy: testAdmin._id
    });

    taskForUser2 = await Task.create({
      title: 'Task for User 2',
      description: 'Another Task',
      status: 'Pending',
      priority: 'High',
      assignedTo: testUser2._id,
      createdBy: testAdmin._id
    });
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  it('updates task status to "In Progress" via updateTaskStatus', async () => {
    const req = {
      params: { id: taskForUser1._id.toString() },
      body: { status: 'In Progress' },
      user: testUser1
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Task status updated successfully');
    assert.ok(res.body.task);
    assert.equal(res.body.task.status, 'In Progress');

    const persisted = await Task.findById(taskForUser1._id);
    assert.equal(persisted.status, 'In Progress');
  });

  it('updates task status to "Completed" via updateTaskStatus', async () => {
    const req = {
      params: { id: taskForUser1._id.toString() },
      body: { status: 'Completed' },
      user: testUser1
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.task.status, 'Completed');

    const persisted = await Task.findById(taskForUser1._id);
    assert.equal(persisted.status, 'Completed');
  });

  it('updates task status back to "Pending" via updateTaskStatus', async () => {
    const req = {
      params: { id: taskForUser1._id.toString() },
      body: { status: 'Pending' },
      user: testUser1
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.task.status, 'Pending');

    const persisted = await Task.findById(taskForUser1._id);
    assert.equal(persisted.status, 'Pending');
  });

  it('allows Admin to update status of any task', async () => {
    const req = {
      params: { id: taskForUser1._id.toString() },
      body: { status: 'Completed' },
      user: testAdmin
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.task.status, 'Completed');

    const persisted = await Task.findById(taskForUser1._id);
    assert.equal(persisted.status, 'Completed');
  });

  it('rejects invalid task status with 400 Bad Request', async () => {
    const req = {
      params: { id: taskForUser1._id.toString() },
      body: { status: 'InvalidStatus' },
      user: testUser1
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid status/);
  });

  it('rejects empty or missing status with 400 Bad Request', async () => {
    const req = {
      params: { id: taskForUser1._id.toString() },
      body: {},
      user: testUser1
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Invalid status/);
  });

  it('returns 404 Not Found when updating a nonexistent task ID', async () => {
    const nonexistentId = new mongoose.Types.ObjectId();
    const req = {
      params: { id: nonexistentId.toString() },
      body: { status: 'In Progress' },
      user: testUser1
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, 'Task not found');
  });

  it('returns 403 Forbidden when a user tries to update another user’s task', async () => {
    const req = {
      params: { id: taskForUser2._id.toString() },
      body: { status: 'Completed' },
      user: testUser1
    };
    const res = createMockRes();

    await taskController.updateTaskStatus(req, res);

    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /Access denied/);
  });

  it('validates status in updateTask endpoint for Admin and User', async () => {
    const reqAdminInvalid = {
      params: { id: taskForUser1._id.toString() },
      body: { status: 'WrongStatus' },
      user: testAdmin
    };
    const resAdminInvalid = createMockRes();
    await taskController.updateTask(reqAdminInvalid, resAdminInvalid);
    assert.equal(resAdminInvalid.statusCode, 400);

    const reqUserValid = {
      params: { id: taskForUser1._id.toString() },
      body: { status: 'In Progress' },
      user: testUser1
    };
    const resUserValid = createMockRes();
    await taskController.updateTask(reqUserValid, resUserValid);
    assert.equal(resUserValid.statusCode, 200);
    assert.equal(resUserValid.body.task.status, 'In Progress');
  });
});
