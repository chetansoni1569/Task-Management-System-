# 📋 Task Management System — Backend API

A clean, beginner-friendly RESTful API built with **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication** for college assignments.

This backend implements role-based task management where **Admins** have full control over creating and assigning tasks, while **Users** can view only their assigned tasks and update task progress.

---

## 🚀 1. Tech Stack & Why We Used Each

If your teacher or examiner asks why each package was chosen, here is the simple explanation:

| Technology / Package | Purpose | Why We Used It |
| :--- | :--- | :--- |
| **Node.js** | JavaScript Runtime | Allows running JavaScript outside the browser on the backend server. |
| **Express.js** | Web Framework | Simplifies routing, middleware handling, and HTTP request/response processing. |
| **MongoDB Atlas / Mongoose** | Database & ODM | NoSQL database with Mongoose schemas to easily model `User` and `Task` documents. |
| **jsonwebtoken (JWT)** | Token Authentication | Issues encrypted, stateless tokens so users stay logged in securely. |
| **bcryptjs** | Password Hashing | Hashes passwords with salt rounds so plain-text passwords are never stored in the database. |
| **dotenv** | Environment Variables | Keeps sensitive secrets (`MONGO_URI`, `JWT_SECRET`, `PORT`) safe in `.env`. |
| **cors** | Middleware | Enables Cross-Origin Resource Sharing so frontend applications can communicate with this API. |
| **nodemon** | Dev Tool | Automatically restarts the server whenever code files are changed. |

---

## 📁 2. Folder Structure Explained

```text
assignment 4/
├── src/
│   ├── config/
│   │   └── db.js                 # Connects to MongoDB Atlas using Mongoose
│   ├── models/
│   │   ├── User.js               # User schema (name, email, password, role)
│   │   └── Task.js               # Task schema (title, description, status, priority, dueDate, assignedTo)
│   ├── controllers/
│   │   ├── authController.js     # Logic for user registration and login
│   │   └── taskController.js     # Logic for CRUD operations and role restrictions
│   ├── routes/
│   │   ├── authRoutes.js         # Routes for /api/auth (register, login)
│   │   └── taskRoutes.js         # Routes for /api/tasks (CRUD endpoints)
│   ├── middleware/
│   │   ├── authMiddleware.js     # Verifies JWT token from Authorization header
│   │   └── roleMiddleware.js     # Restricts access based on user role (Admin vs User)
│   └── server.js                 # Main server entry point (Express app & listeners)
├── .env                          # Local secret environment variables (ignored by Git)
├── .env.example                  # Template showing which variables are needed
├── .gitignore                    # Prevents node_modules and .env from being committed
├── package.json                  # Project dependencies and npm scripts
└── README.md                     # Documentation and setup guide
```

---

## 🛠️ 3. Quick Setup & How to Run Locally

### Step 1: Clone or Open the Project
Open terminal in the project directory:
```bash
cd "assignment 4"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables
Create a file named `.env` in the root folder (or copy from `.env.example`):
```env
PORT=5055
MONGO_URI=mongodb://127.0.0.1:27017/task_management_db
JWT_SECRET=your_jwt_secret_key_here
```
> **Note on macOS**: Port 5000 is often reserved by macOS for AirPlay Receiver (`ControlCenter`). We use port `5055` to avoid port conflict errors.

### Step 4: Run the Server
- **Development mode** (auto-restart with nodemon):
  ```bash
  npm run dev
  ```
- **Standard mode**:
  ```bash
  npm start
  ```

Once started, you will see:
```text
Server is running on http://localhost:5055
MongoDB Connected successfully: ...
```

---

## ☁️ 4. How to Connect MongoDB Atlas (Cloud Database)

If you want to connect to MongoDB Atlas in the cloud instead of local MongoDB:

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign in.
2. Create a free **M0 Cluster**.
3. Under **Database Access**, create a user (e.g., `dbUser`) with a password (e.g., `mypassword123`).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. In your cluster dashboard, click **Connect** -> **Drivers** -> **Node.js**.
6. Copy the connection string and paste it into your `.env` file:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/task_manager?retryWrites=true&w=majority
   ```
7. Restart the server (`npm run dev`).

---

## 🔒 5. Role-Based Permissions Matrix

| Action | API Route | HTTP Method | Admin Access | User Access |
| :--- | :--- | :---: | :---: | :---: |
| Register User | `/api/auth/register` | `POST` | Public | Public |
| Login | `/api/auth/login` | `POST` | Public | Public |
| View All Tasks | `/api/tasks` | `GET` | ✅ Views all tasks | ❌ Only views their assigned tasks |
| View Single Task | `/api/tasks/:id` | `GET` | ✅ Views any task | ❌ Only if assigned to them |
| Create Task | `/api/tasks` | `POST` | ✅ Can create & assign | ❌ Blocked (403 Forbidden) |
| Update Task | `/api/tasks/:id` | `PUT` | ✅ Full edit | ⚠️ Can ONLY change `status` of own task |
| Delete Task | `/api/tasks/:id` | `DELETE` | ✅ Can delete | ❌ Blocked (403 Forbidden) |

---

## 📡 6. Complete API Testing (cURL & Postman)

### Issue 1: Authentication APIs

#### 1. Register an Admin
- **URL**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Admin Sagar",
    "email": "admin@example.com",
    "password": "password123",
    "role": "Admin"
  }
  ```
- **cURL Command**:
  ```bash
  curl -X POST http://localhost:5055/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name": "Admin Sagar", "email": "admin@example.com", "password": "password123", "role": "Admin"}'
  ```

#### 2. Register a Regular Student User
- **URL**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Aman Verma",
    "email": "aman.student@example.com",
    "password": "password123"
  }
  ```
- **cURL Command**:
  ```bash
  curl -X POST http://localhost:5055/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name": "Aman Verma", "email": "aman.student@example.com", "password": "password123"}'
  ```

#### 3. Login
- **URL**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **cURL Command**:
  ```bash
  curl -X POST http://localhost:5055/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@example.com", "password": "password123"}'
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6aca36cb002b127988d054e7",
      "name": "Admin Sagar",
      "email": "admin@example.com",
      "role": "Admin"
    }
  }
  ```
> Copy the `token` from the response. You will send this token in the header:  
> `Authorization: Bearer <your_token>`

---

### Issues 2 & 3: Task CRUD & Role-Based Access

#### 4. Create Task (Admin Only)
- **URL**: `POST /api/tasks`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body**:
  ```json
  {
    "title": "Complete Database Assignment",
    "description": "Design schema and submit documentation report",
    "status": "Pending",
    "priority": "High",
    "dueDate": "2026-10-25",
    "assignedTo": "<STUDENT_USER_ID>"
  }
  ```
- **cURL Command**:
  ```bash
  curl -X POST http://localhost:5055/api/tasks \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -d '{
      "title": "Complete Database Assignment",
      "description": "Design schema and submit documentation report",
      "status": "Pending",
      "priority": "High",
      "dueDate": "2026-10-25",
      "assignedTo": "<STUDENT_USER_ID>"
    }'
  ```

#### 5. Normal User Tries to Create Task (Security Check)
- **URL**: `POST /api/tasks`
- **Headers**: `Authorization: Bearer <STUDENT_TOKEN>`
- **Expected Result**: `403 Forbidden`
  ```json
  {
    "message": "Access denied. Role 'User' is not allowed to access this resource."
  }
  ```

#### 6. Get All Tasks (Admin vs User)
- **URL**: `GET /api/tasks`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Behavior**:
  - If sent with **Admin Token**: Returns all tasks in the database.
  - If sent with **User Token**: Returns only tasks assigned to that user.

#### 7. Get Single Task by ID
- **URL**: `GET /api/tasks/:id`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Behavior**:
  - Admin can view any task.
  - Regular user can view only if the task is assigned to them (otherwise `403 Forbidden`).

#### 8. Update Task Status (Regular User)
- **URL**: `PUT /api/tasks/:id`
- **Headers**: `Authorization: Bearer <STUDENT_TOKEN>`
- **Body**:
  ```json
  {
    "status": "In Progress"
  }
  ```
- **cURL Command**:
  ```bash
  curl -X PUT http://localhost:5055/api/tasks/<TASK_ID> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <STUDENT_TOKEN>" \
    -d '{"status": "In Progress"}'
  ```
> If a regular user tries to update `title` or `priority`, the API blocks them with `400 Bad Request: "Regular users can only update the task status"`.

#### 9. Update Task (Admin Full Edit)
- **URL**: `PUT /api/tasks/:id`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body**:
  ```json
  {
    "title": "Updated Task Title",
    "priority": "Low",
    "status": "Completed"
  }
  ```

#### 10. Delete Task (Admin Only)
- **URL**: `DELETE /api/tasks/:id`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Behavior**:
  - Admin receives `200 OK: "Task deleted successfully"`.
  - Regular user receives `403 Forbidden: "Access denied. Role 'User' is not allowed to access this resource."`.

---

## 👥 7. Team Leader GitHub Workflow (3 Issues & Branches)

As the team leader, you have 3 GitHub Issues assigned to your team members:
1. **Issue 1**: User Authentication API
2. **Issue 2**: Task CRUD APIs
3. **Issue 3**: Authentication Middleware and Role-Based Access

Here is the step-by-step Git branching strategy so team members do not conflict with each other:

### 1. Branch Strategy
- `main` branch: Stable, working code (only updated when PRs are approved and merged).
- Feature branches:
  - `feature/issue-1-auth` for Member 1
  - `feature/issue-2-tasks` for Member 2
  - `feature/issue-3-rbac` for Member 3

```text
main ────────────────────────────────────────────────────────── (Leader Merges PRs)
   \                                   ▲            ▲            ▲
    ├── feature/issue-1-auth ──────────┘ (PR 1)     │            │
    ├── feature/issue-2-tasks ──────────────────────┘ (PR 2)     │
    └── feature/issue-3-rbac ────────────────────────────────────┘ (PR 3)
```

### 2. Instructions for Team Members

#### For Member 1 (Issue 1 — Authentication):
```bash
# 1. Pull latest main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/issue-1-auth

# 3. Work on files:
#    - src/models/User.js
#    - src/controllers/authController.js
#    - src/routes/authRoutes.js

# 4. Commit and push branch to GitHub
git add src/models/User.js src/controllers/authController.js src/routes/authRoutes.js
git commit -m "feat: implement user registration and login with bcrypt and jwt"
git push -u origin feature/issue-1-auth

# 5. Open Pull Request on GitHub:
#    Base: main  <--  Compare: feature/issue-1-auth
```

#### For Member 2 (Issue 2 — Task CRUD):
```bash
# 1. Create feature branch
git checkout main
git checkout -b feature/issue-2-tasks

# 2. Work on files:
#    - src/models/Task.js
#    - src/controllers/taskController.js
#    - src/routes/taskRoutes.js

# 3. Commit and push branch
git add src/models/Task.js src/controllers/taskController.js src/routes/taskRoutes.js
git commit -m "feat: implement task schema and CRUD endpoints"
git push -u origin feature/issue-2-tasks

# 4. Open Pull Request on GitHub
```

#### For Member 3 (Issue 3 — Middleware & RBAC):
```bash
# 1. Create feature branch
git checkout main
git checkout -b feature/issue-3-rbac

# 2. Work on files:
#    - src/middleware/authMiddleware.js
#    - src/middleware/roleMiddleware.js

# 3. Commit and push branch
git add src/middleware/authMiddleware.js src/middleware/roleMiddleware.js
git commit -m "feat: implement JWT verification and role-based access middleware"
git push -u origin feature/issue-3-rbac

# 4. Open Pull Request on GitHub
```

### 3. Team Leader Review Process (You)
1. Go to your repository on GitHub -> **Pull Requests** tab.
2. Review the files changed in each PR:
   - Check that passwords are never logged or stored in plain text.
   - Verify `req.user.role` is checked, not `req.body.role`.
   - Ensure error responses return proper HTTP status codes (`400`, `401`, `403`, `404`).
3. Click **Merge Pull Request** -> **Confirm Merge** once verified.
4. Keep branches organized and close the corresponding GitHub Issues!

---

## 🎓 8. College Viva / Exam Questions & Answers

1. **Q: Why do we use `bcrypt` instead of storing plain text passwords?**
   *A: Plain text passwords in a database can be stolen if the database is leaked. Bcrypt hashes passwords using one-way cryptographic algorithms with a random "salt", making brute-force decryption practically impossible.*

2. **Q: How does JWT authentication work?**
   *A: When a user logs in, the server creates a digital signature token containing the user's ID and role, signed with a secret key (`JWT_SECRET`). On every subsequent request, the client sends this token in the `Authorization: Bearer <token>` header, allowing the server to identify the user without querying the database password.*

3. **Q: Why shouldn't we trust `req.body.role` for permissions?**
   *A: A malicious user can easily modify the request body in Postman and send `"role": "Admin"`. Instead, we extract the authenticated user identity and role from the verified JWT token (`req.user.role`), which cannot be tampered with by the client.*

4. **Q: What is the difference between 401 Unauthorized and 403 Forbidden?**
   *A: 401 Unauthorized means the user is not authenticated (no token or invalid token). 403 Forbidden means the user is authenticated, but their role does not have permission to perform that action (e.g., a student trying to delete a task).*
