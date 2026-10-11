# Task Management System — Frontend

A simple, beginner-friendly Task Management System frontend built using **React** and **Vite**. This project is designed following basic college CRUD architecture principles without unnecessary complex abstractions or external UI frameworks.

---

## 🛠 Tech Stack

- **Framework**: React 19 (Functional Components)
- **Build Tool**: Vite
- **Routing**: React Router (`react-router-dom`)
- **Styling**: Basic Vanilla CSS (`src/index.css`)
- **API Communication**: Native `fetch()` API (`src/services/api.js`)

---

## 📁 Folder Structure

```text
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Header with user role badge, navigation links & logout
│   ├── pages/
│   │   ├── Landing.jsx         # Landing page with introduction and login/register buttons
│   │   ├── Login.jsx           # Email and password login form
│   │   ├── Register.jsx        # User registration form with role selection (User / Admin)
│   │   ├── TaskDashboard.jsx   # User dashboard: view assigned tasks and update status
│   │   └── TaskManagement.jsx  # Admin page: add, view, edit, and delete tasks
│   ├── services/
│   │   └── api.js              # Centralized fetch() functions for backend communication
│   ├── hooks/                  # Empty hooks folder
│   ├── App.jsx                 # Application routes and authentication state
│   ├── main.jsx                # React root entry point
│   └── index.css               # Clean, basic CSS styling for the application
├── public/                     # Static assets
├── .env                        # Environment variables (Backend API URL)
├── .env.example                # Example environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (version 18 or above recommended)
- npm

### 2. Installation
Open your terminal, navigate to the `frontend` directory, and install dependencies:
```bash
cd frontend
npm install
```

### 3. Configure Backend URL
Ensure your `.env` file points to your running backend:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open the URL shown in the terminal (usually `http://localhost:5173`) in your web browser.

---

## 🔌 Backend API Integration

The frontend connects to the backend through functions in `src/services/api.js`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user (expects `email`, `password`) |
| `POST` | `/api/auth/register` | Register new user (expects `name`, `email`, `password`, `role`) |
| `GET` | `/api/tasks` | Fetch all tasks |
| `POST` | `/api/tasks` | Admin creates task (`title`, `description`, `status`, `priority`, `dueDate`, `assignedUser`) |
| `PUT` | `/api/tasks/:id` | Admin updates task details |
| `DELETE` | `/api/tasks/:id` | Admin deletes task |
| `PATCH` | `/api/tasks/:id/status` | User updates task status (`Pending`, `In Progress`, `Completed`) |

---

## 👥 User Roles & Features

1. **Regular User**:
   - Views tasks assigned to them on the **Task Dashboard** (`/dashboard`).
   - Updates the status of assigned tasks (`Pending`, `In Progress`, `Completed`).
2. **Admin**:
   - Access to **Task Management** (`/manage`).
   - Full CRUD capability: Add new tasks, edit existing tasks, delete tasks, and assign to users.
3. **Authentication**:
   - Login and Registration forms with validation feedback.
   - Session stored in `localStorage`.
   - Logout clears user session and redirects to Landing page.
