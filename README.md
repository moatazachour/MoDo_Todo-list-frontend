# Mo-Do

A clean, responsive task management web app with authentication, smart filtering, and a polished UX. Built with **vanilla JavaScript** on the frontend and an **ASP.NET Web API** backend.

🔗 **Live Demo:** [mo-do-todo-list-frontend.vercel.app](https://mo-do-todo-list-frontend.vercel.app/)
🔌 **Backend API:** [modo-todolist.runasp.net](http://modo-todolist.runasp.net)
📘 **API Docs (Swagger):** [modo-todolist.runasp.net/swagger](http://modo-todolist.runasp.net/swagger/index.html)

> 💡 Click **Load Demo** on the login screen to try the app instantly with shared credentials — no signup required.

---

## ✨ Overview

Mo-Do lets users sign up, organize their tasks across smart views (Today, Tomorrow, Earlier, Important), and manage everything through a fast, single-page interface. The app is fully keyboard-aware, mobile-friendly, and ships with a demo account so visitors can try it without signing up.

---

## 🚀 Features

### Authentication
- **Sign Up & Login** with input validation
- **Persistent session** via `localStorage`
- **Demo account** for instant access (`demo` / `demo123`)
- **Profile management** — update username, email, password
- **Account deletion** with confirmation
- Demo credentials are locked to prevent shared-account tampering

### Task Management
- Create, edit, and delete tasks
- Mark tasks as **important** ⭐ or **completed** ✅
- Each task has a title, description, due date, status, and importance flag
- Three status types: **In Progress**, **Completed**, **Overdue**

### Smart Views
- **All** — every task in your list
- **Today** — tasks due today
- **Tomorrow** — tasks due tomorrow
- **Earlier** — overdue tasks (due before today)
- **Important** — starred tasks only
- Live **task counters** (badges) on every view

### UX & Interface
- 🔍 **Live search** by task title within the active view
- 🔔 **Toast notifications** (success / error / info) with auto-dismiss
- 📱 **Responsive sidebar drawer** on mobile with overlay
- ⌨️ **Keyboard shortcuts** — `Esc` closes any open modal or panel
- 🪟 **Reusable modals** for add/edit and confirm-delete flows
- ⏳ Loading spinner and empty-state messaging
- 👤 Avatar initials generated from the username

---

## 🛠️ Tech Stack

| Layer        | Technology                                |
| ------------ | ----------------------------------------- |
| Frontend     | Vanilla JavaScript (ES2020+), HTML5, CSS3 |
| Backend      | ASP.NET Web API (.NET)                    |
| Persistence  | Browser `localStorage` (session)          |
| API Style    | RESTful JSON over `fetch`                 |
| Hosting      | Vercel (frontend) · MonsterASP.NET (backend) |

No frameworks, no build step — just clean, modern JavaScript.

---

## 📁 Project Structure

```
project/
├── index.html          # App shell, modals, templates
├── style.css           # All styling + responsive rules
├── script.js           # Application logic
├── favicon.png         # Site favicon
├── vercel.json         # Vercel rewrite config (proxies /api → backend)
└── README.md
```

The JavaScript is organized into clearly labeled sections:

- **Constants & State** — icons, API base URL, in-memory caches
- **UI References** — grouped DOM lookups (`AuthUI`, `MainUI`, `ProfileUI`, `ModalUI`, `ConfirmUI`)
- **Toast Notifications** — animated, auto-dismissing messages
- **Auth** — validation, signup, login, logout
- **Profile Panel** — view, update, delete account
- **Tasks** — fetching, badge counts, toggling state, add/edit modal, delete
- **Rendering & Filtering** — view/search composition
- **Navigation & Mobile Drawer**
- **Event Listeners** — wired at the bottom

---

## 🔌 API Reference

All endpoints are served under `/api`.

> 💡 **Tip:** Explore and test every endpoint interactively via [Swagger UI](http://modo-todolist.runasp.net/swagger/index.html).

### Users

| Method | Endpoint              | Purpose                  |
| ------ | --------------------- | ------------------------ |
| POST   | `/Users/Signup`       | Register a new user      |
| POST   | `/Users/Login`        | Authenticate a user      |
| PUT    | `/Users/{id}`         | Update profile           |
| DELETE | `/Users/{id}`         | Delete account           |

### Tasks

| Method | Endpoint                       | Purpose                  |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/Tasks/All/{userId}`          | All tasks for a user     |
| GET    | `/Tasks/Today/{userId}`        | Tasks due today          |
| GET    | `/Tasks/Tomorrow/{userId}`     | Tasks due tomorrow       |
| GET    | `/Tasks/Earlier/{userId}`      | Overdue tasks            |
| GET    | `/Tasks/Important/{userId}`    | Important tasks          |
| GET    | `/Tasks/{taskId}`              | Get a single task        |
| POST   | `/Tasks`                       | Create a task            |
| PUT    | `/Tasks/{taskId}`              | Update a task            |
| DELETE | `/Tasks/{taskId}`              | Delete a task            |

### Task Schema

```json
{
  "taskID": 1,
  "title": "Finish README",
  "description": "Write project documentation",
  "issueDate": "2026-04-28T10:00:00Z",
  "dueDate": "2026-04-30",
  "isImportant": true,
  "statusID": 1,
  "statusName": "In Progress",
  "userID": 42
}
```

---

## ⚙️ Getting Started

### Try It Online
Just visit the [live demo](https://mo-do-todo-list-frontend.vercel.app/) and click **Load Demo** on the login screen.

### Run Locally

**Prerequisites**
- A running instance of the ASP.NET Web API backend exposing the `/api` routes above
- A static file server (or your backend serving the frontend assets directly)

**Steps**
1. Clone the repository.
2. Start the backend so `/api` is reachable.
3. Serve `index.html` from the same origin (or configure CORS).
4. Open the app in your browser.

---

## ☁️ Deployment

| Component | Platform                                       |
| --------- | ---------------------------------------------- |
| Frontend  | [Vercel](https://vercel.com/)                  |
| Backend   | [MonsterASP.NET](https://www.monsterasp.net/)  |
| Database  | Hosted alongside the backend on MonsterASP.NET |

### How the Frontend Talks to the Backend

The frontend calls `/api/...` as if the backend were on the same origin. In reality, Vercel **rewrites** those requests server-side and forwards them to the deployed ASP.NET API:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://modo-todolist.runasp.net/api/:path*"
    }
  ]
}
```

This pattern has two nice side effects:

- **No mixed-content errors** — the browser only ever makes HTTPS calls to the Vercel domain; the HTTP hop to the backend happens server-side.
- **No CORS setup needed** — since the browser sees same-origin requests, there's no preflight and no `Access-Control-*` headers to manage on the backend.

---

## 🧠 Implementation Notes

A few decisions worth highlighting:

- **DOM references are grouped** into namespace objects (`AuthUI`, `MainUI`, etc.) to keep selectors centralized and the rest of the code declarative.
- **Event delegation** is used on the task list so newly rendered cards don't need rebinding — a single listener handles toggle, edit, and delete actions via `data-action` attributes.
- **Filters are pure functions** (`getTodayTasks`, `getEarlierTasks`, …) shared between the navigation logic and live search, avoiding duplication.
- **The confirm modal is reused** for both task deletion and account deletion, branched by its title text.
- **Sidebar auto-closes** after navigation on mobile for a native-app feel.

---

## 👤 Author

**Moataz** — backend .NET developer building toward full-stack.
Feel free to open an issue or reach out with feedback.
