const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response, defaultError) => {
  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || defaultError);
  }
  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return handleResponse(response, 'Login failed');
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(response, 'Registration failed');
};

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/auth/users`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data;
};

export const getTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response, 'Failed to fetch tasks');
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
  });
  return handleResponse(response, 'Failed to create task');
};

export const updateTask = async (id, taskData) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
  });
  return handleResponse(response, 'Failed to update task');
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response, 'Failed to delete task');
};

export const updateTaskStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  return handleResponse(response, 'Failed to update task status');
};
