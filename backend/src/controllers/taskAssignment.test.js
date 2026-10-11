const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management_db';

describe('Task Assignment Backend Features (Issue #6)', () => {
  let testUser1;
  let testUser2;
  let testAdmin;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }

    // Create test team members
    testAdmin = await User.create({
      name: 'Test Assignment Admin',
      email: `admin_${Date.now()}@test.com`,
      password: 'hashedpassword123',
      role: 'Admin'
    });

    testUser1 = await User.create({
      name: 'Test Team Member 1',
      email: `member1_${Date.now()}@test.com`,
      password: 'hashedpassword123',
      role: 'User'
    });

    testUser2 = await User.create({
      name: 'Test Team Member 2',
      email: `member2_${Date.now()}@test.com`,
      password: 'hashedpassword123',
      role: 'User'
    });
  });

  after(async () => {
    // Clean up test data
    if (testAdmin) await User.deleteOne({ _id: testAdmin._id });
    if (testUser1) await User.deleteOne({ _id: testUser1._id });
    if (testUser2) await User.deleteOne({ _id: testUser2._id });
    await Task.deleteMany({ createdBy: testAdmin?._id });
    await mongoose.disconnect();
  });

  it('allows creating a task with a valid assignee ID', async () => {
    const task = await Task.create({
      title: 'Assigned Task Test',
      description: 'Testing assignment to team member 1',
      status: 'Pending',
      priority: 'High',
      assignedTo: testUser1._id,
      createdBy: testAdmin._id
    });

    assert.ok(task._id);
    assert.equal(task.assignedTo.toString(), testUser1._id.toString());

    // Verify populated fields
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email role');
    assert.equal(populated.assignedTo.name, testUser1.name);
    assert.equal(populated.assignedTo.email, testUser1.email);
  });

  it('allows creating an unassigned task (assignedTo: null)', async () => {
    const unassignedTask = await Task.create({
      title: 'Unassigned Task Test',
      description: 'Testing unassigned task handling',
      status: 'Pending',
      priority: 'Medium',
      assignedTo: null,
      createdBy: testAdmin._id
    });

    assert.ok(unassignedTask._id);
    assert.equal(unassignedTask.assignedTo, null);

    const retrieved = await Task.findById(unassignedTask._id).populate('assignedTo', 'name email role');
    assert.equal(retrieved.assignedTo, null);
  });

  it('supports reassigning a task to another team member', async () => {
    const task = await Task.create({
      title: 'Reassignment Test',
      description: 'Initially assigned to member 1',
      status: 'Pending',
      priority: 'Low',
      assignedTo: testUser1._id,
      createdBy: testAdmin._id
    });

    // Reassign to member 2
    task.assignedTo = testUser2._id;
    await task.save();

    const updated = await Task.findById(task._id).populate('assignedTo', 'name email role');
    assert.equal(updated.assignedTo._id.toString(), testUser2._id.toString());
    assert.equal(updated.assignedTo.name, testUser2.name);
  });

  it('supports changing an assigned task to unassigned', async () => {
    const task = await Task.create({
      title: 'Unassigning Test',
      description: 'Initially assigned to member 2',
      status: 'In Progress',
      priority: 'Medium',
      assignedTo: testUser2._id,
      createdBy: testAdmin._id
    });

    // Clear assignment
    task.assignedTo = null;
    await task.save();

    const updated = await Task.findById(task._id).populate('assignedTo', 'name email role');
    assert.equal(updated.assignedTo, null);
  });

  it('verifies team member retrieval excludes passwords and returns required fields', async () => {
    const members = await User.find({}, '_id name email role createdAt').sort({ name: 1 });
    assert.ok(members.length >= 3);

    for (const member of members) {
      assert.ok(member._id);
      assert.ok(member.name);
      assert.ok(member.email);
      assert.equal(member.password, undefined); // password is not selected
    }
  });

  it('rejects task creation if assignee ID does not exist in the database', async () => {
    const taskController = require('./taskController');
    const fakeId = new mongoose.Types.ObjectId();

    const req = {
      body: {
        title: 'Task for nonexistent user',
        description: 'Should fail with 404',
        assignedTo: fakeId.toString()
      },
      user: testAdmin
    };

    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          }
        };
      }
    };

    await taskController.createTask(req, res);
    assert.equal(statusCode, 404);
    assert.equal(jsonResponse.message, 'Assigned user not found');
  });

  it('rejects task creation if assignee ID format is invalid', async () => {
    const taskController = require('./taskController');

    const req = {
      body: {
        title: 'Task for invalid ID format',
        description: 'Should fail with 400',
        assignedTo: 'invalid-id-format'
      },
      user: testAdmin
    };

    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          }
        };
      }
    };

    await taskController.createTask(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResponse.message, 'Invalid user ID format for assignedTo');
  });

  it('rejects task assignment update if assignee ID does not exist in the database', async () => {
    const taskController = require('./taskController');
    const task = await Task.create({
      title: 'Task to update with invalid assignee',
      description: 'Test description',
      assignedTo: testUser1._id,
      createdBy: testAdmin._id
    });

    const fakeId = new mongoose.Types.ObjectId();
    const req = {
      params: { id: task._id.toString() },
      body: { assignedTo: fakeId.toString() },
      user: testAdmin
    };

    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          }
        };
      }
    };

    await taskController.updateTask(req, res);
    assert.equal(statusCode, 404);
    assert.equal(jsonResponse.message, 'Assigned user not found');
  });

  it('fetches users via authController.getUsers successfully', async () => {
    const authController = require('./authController');

    const req = { user: testAdmin };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          }
        };
      }
    };

    await authController.getUsers(req, res);
    assert.equal(statusCode, 200);
    assert.ok(Array.isArray(jsonResponse.users));
    assert.ok(jsonResponse.users.length >= 3);
  });
});
