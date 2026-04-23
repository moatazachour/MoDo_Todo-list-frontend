// =============================================================================
// CONSTANTS & GLOBAL STATE
// =============================================================================

const ICONS = {
  success: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

const API_BASE = "http://modo-todolist.runasp.net/api";

let currentUserObj;
let allTasks = [];

// =============================================================================
// UI ELEMENT REFERENCES
// =============================================================================

const AuthUI = {
  authScreen: document.querySelector("#auth-screen"),
  // Tabs
  tabLogin: document.querySelector("#tab-login"),
  tabSignup: document.querySelector("#tab-signup"),
  // Login Form
  formLogin: document.querySelector("#form-login"),
  loginUsername: document.querySelector("#login-username"),
  loginPassword: document.querySelector("#login-password"),
  btnLogin: document.querySelector("#btn-login"),
  // SignUp Form
  formSignup: document.querySelector("#form-signup"),
  signupUsername: document.querySelector("#signup-username"),
  signupEmail: document.querySelector("#signup-email"),
  signupPassword: document.querySelector("#signup-password"),
  btnSignup: document.querySelector("#btn-signup"),
  // Demo Button
  btnLoadDemo: document.querySelector("#btn-load-demo"),
};

const ProfileUI = {
  profileOverlay: document.querySelector("#profile-overlay"),
  profilePanel: document.querySelector("#profile-panel"),
  profileAvatar: document.querySelector("#profile-avatar-lg"),
  profileClose: document.querySelector("#profile-close"),
  profileForm: document.querySelector("#profile-form"),
  profileUserId: document.querySelector("#profile-user-id"),
  profileUsername: document.querySelector("#profile-username"),
  profileEmail: document.querySelector("#profile-email"),
  profileCurrentPassword: document.querySelector("#profile-current-password"),
  profileNewPassword: document.querySelector("#profile-new-password"),
  profileMessage: document.querySelector("#profile-message"),
  btnDeleteAccount: document.querySelector("#btn-delete-account"),
};

const MainUI = {
  appScreen: document.querySelector("#app"),

  // Sidebar
  navAll: document.querySelector("#nav-all"),
  badgeAll: document.querySelector("#badge-all"),
  navToday: document.querySelector("#nav-today"),
  badgeToday: document.querySelector("#badge-today"),
  navTomorrow: document.querySelector("#nav-tomorrow"),
  badgeTomorrow: document.querySelector("#badge-tomorrow"),
  navEarlier: document.querySelector("#nav-earlier"),
  badgeEarlier: document.querySelector("#badge-earlier"),
  navImportant: document.querySelector("#nav-important"),
  badgeImportant: document.querySelector("#badge-important"),
  userAvatarInitials: document.querySelector("#user-avatar-initials"),
  userDisplayName: document.querySelector("#user-display-name"),
  userDisplayEmail: document.querySelector("#user-display-email"),
  btnLogout: document.querySelector("#btn-logout"),
  sidebarUserTile: document.querySelector("#sidebar-user-tile"),

  // Main Content — Header
  viewTitle: document.querySelector("#view-title"),
  searchInput: document.querySelector("#search-input"),
  btnAddTask: document.querySelector("#btn-add-task"),

  // Main Content — Task Area
  loadingSpinner: document.querySelector("#loading-spinner"),
  emptyState: document.querySelector("#empty-state"),
  taskList: document.querySelector("#task-list"),
  taskCardTemplate: document.querySelector("#task-card-tpl"),
  btnIsImportant: document.querySelector(".btn-icon.star"),
};

const ModalUI = {
  modalOverlay: document.querySelector("#modal-overlay"),
  modalTitle: document.querySelector("#modal-heading"),
  modalClose: document.querySelector("#modal-close"),
  taskForm: document.querySelector("#task-form"),
  taskId: document.querySelector("#task-id"),
  taskTitle: document.querySelector("#task-title"),
  taskDescription: document.querySelector("#task-description"),
  taskDueDate: document.querySelector("#task-due-date"),
  taskStatus: document.querySelector("#task-status"),
  taskIsImportant: document.querySelector("#task-is-important"),
  modalError: document.querySelector("#modal-error"),
  modalCancel: document.querySelector("#modal-cancel"),
  modalSubmit: document.querySelector("#modal-submit"),
};

const ConfirmUI = {
  confirmOverlay: document.querySelector("#confirm-overlay"),
  confirmDelete: document.querySelector("#confirm-delete"),
  confirmCancel: document.querySelector("#confirm-cancel"),
  confirmTitle: document.querySelector(".confirm-title"),
};

const toastContainer = document.querySelector("#toast-container");

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================

function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");
  toast.classList.add("toast", type);

  const toastIcon = document.createElement("div");
  toastIcon.classList.add("toast-icon");
  toastIcon.innerHTML = ICONS[type] ?? ICONS.info;

  const toastMessage = document.createElement("span");
  toastMessage.textContent = message;

  // Icon goes inside toast, not alongside it
  toast.appendChild(toastIcon);
  toast.appendChild(toastMessage);
  toastContainer.appendChild(toast);

  // Auto-remove with the toastOut animation
  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove());
  }, duration);
}

// =============================================================================
// AUTH — VALIDATION
// =============================================================================

function validateUsername(username) {
  if (!username) {
    showToast("Username is empty!", "error");
    return false;
  }
  // TODO: Database checking if username already exists
  return true;
}

function validateEmail(email) {
  if (!email || !email.includes("@")) {
    showToast("Valid email is required", "error");
    return false;
  }
  // TODO: Database checking if email already exists
  return true;
}

function validatePassword(password) {
  if (!password) {
    showToast("Password is empty!", "error");
    return false;
  }
  return true;
}

function validateSigninInputs(username, email, password) {
  const isUsernameValid = validateUsername(username);
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);

  return isUsernameValid && isEmailValid && isPasswordValid;
}

function validateLoginInputs(username, password) {
  const isUsernameValid = validateUsername(username);
  const isPasswordValid = validatePassword(password);

  return isUsernameValid && isPasswordValid;
}

// =============================================================================
// AUTH — SIGN UP / LOGIN / LOGOUT
// =============================================================================

function toggleAuthTabs() {
  AuthUI.tabLogin.classList.toggle("active");
  AuthUI.tabSignup.classList.toggle("active");
  AuthUI.formLogin.classList.toggle("active");
  AuthUI.formSignup.classList.toggle("active");
}

async function signUp(event) {
  event.preventDefault();
  const username = AuthUI.signupUsername.value.trim();
  const email = AuthUI.signupEmail.value.trim();
  const password = AuthUI.signupPassword.value.trim();

  if (!validateSigninInputs(username, email, password)) return;

  try {
    const response = await fetch(`${API_BASE}/Users/Signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: username,
        password: password,
        email: email,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Signup failed", "error");
      return;
    }

    const data = await response.json();

    const newUser = {
      id: data?.userID,
      userName: data.userName,
      password: data.password,
      email: data.email,
    };

    showToast("Account created!", "success");

    localStorage.setItem("currentUser", JSON.stringify(newUser));
    currentUserObj = newUser;
    AuthUI.authScreen.style.setProperty("display", "none");
    MainUI.appScreen.classList.add("visible");
    load();
  } catch (error) {
    showToast(error, "error");
  }
}

async function login(event) {
  event.preventDefault();
  const username = AuthUI.loginUsername.value.trim();
  const password = AuthUI.loginPassword.value.trim();

  if (!validateLoginInputs(username, password)) return;

  try {
    const response = await fetch(`${API_BASE}/Users/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: username,
        password: password,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Login failed", "error");
      return;
    }

    const data = await response.json();

    const loggedUser = {
      id: data.userID,
      userName: data.userName,
      password: data.password,
      email: data.email,
    };

    showToast(`Welcome Back ${loggedUser.userName}!`, "success");

    localStorage.setItem("currentUser", JSON.stringify(loggedUser));
    currentUserObj = loggedUser;
    AuthUI.authScreen.style.setProperty("display", "none");
    MainUI.appScreen.classList.add("visible");
    load();
  } catch (error) {
    showToast(error, "error");
  }
}

function logout() {
  AuthUI.authScreen.style.setProperty("display", "flex");
  MainUI.appScreen.classList.remove("visible");

  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  const userObj = JSON.parse(currentUser);
  AuthUI.loginUsername.value = userObj.userName;
  AuthUI.loginPassword.value = userObj.password;

  localStorage.removeItem("currentUser");
}

// =============================================================================
// PROFILE PANEL
// =============================================================================

function emptyProfilePanel() {
  ProfileUI.profileAvatar.textContent = "?";

  ProfileUI.profileUserId.value = null;
  ProfileUI.profileUsername.value = "";
  ProfileUI.profileEmail.value = "";
  ProfileUI.profileCurrentPassword.value = "";
  ProfileUI.profileNewPassword.value = "";
  ProfileUI.profileMessage.style.display = "none";
  ProfileUI.profileMessage.textContent = "";
}

function openProfilePanel() {
  emptyProfilePanel();
  ProfileUI.profileOverlay.classList.add("open");
  ProfileUI.profilePanel.classList.add("open");
  const usernameFirstInitials = currentUserObj.userName
    .slice(0, 2)
    .toUpperCase();
  ProfileUI.profileAvatar.textContent = usernameFirstInitials;

  ProfileUI.profileUserId.value = currentUserObj.id;
  ProfileUI.profileUsername.value = currentUserObj.userName;
  ProfileUI.profileEmail.value = currentUserObj.email;
}

function showProfileMessage(message) {
  ProfileUI.profileMessage.style.display = "block";
  ProfileUI.profileMessage.textContent = message;
}

function validateCurrentPassword(password) {
  return currentUserObj.password === password;
}

function getProfileFormData() {
  const updatedUser = {};
  const userId = parseInt(ProfileUI.profileUserId.value);

  const username = ProfileUI.profileUsername.value.trim();
  if (!username) {
    showProfileMessage("Username is required!");
    return null;
  }

  const email = ProfileUI.profileEmail.value.trim();
  if (!email || !email.includes("@")) {
    showProfileMessage("Valid email is required");
    return null;
  }

  const currentPassword = ProfileUI.profileCurrentPassword.value.trim();
  if (!validateCurrentPassword(currentPassword)) {
    showProfileMessage("Current password is wrong!");
    return null;
  }

  const newPassword = ProfileUI.profileNewPassword.value.trim();

  updatedUser.userID = userId;
  updatedUser.userName = username;
  updatedUser.email = email;
  updatedUser.currentPassword = currentPassword;
  updatedUser.newPassword = newPassword;

  return updatedUser;
}

function updateLocalStorage(updatedUser) {
  currentUserObj = updatedUser;
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
}

function refreshPageAfterUpdatingProfile() {
  ProfileUI.profileOverlay.classList.remove("open");
  ProfileUI.profilePanel.classList.remove("open");
  loadUserSidebar(currentUserObj);
}

async function updateProfile(event) {
  event.preventDefault();

  const updatedUser = getProfileFormData();

  if (!updatedUser) return;

  try {
    const response = await fetch(`${API_BASE}/Users/${updatedUser.userID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID: updatedUser.userID,
        userName: updatedUser.userName,
        password: updatedUser.newPassword || updatedUser.currentPassword,
        email: updatedUser.email,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      showProfileMessage(err);
      return;
    }

    showToast("Profile Updated");
    const data = await response.json();

    const updatedLoggedUser = {
      id: data.userID,
      userName: data.userName,
      password: data.password,
      email: data.email,
    };
    updateLocalStorage(updatedLoggedUser);
    refreshPageAfterUpdatingProfile();
  } catch (error) {
    showProfileMessage(error.message);
  }
}

function openDeleteProfile() {
  ConfirmUI.confirmOverlay.classList.add("open");
  ConfirmUI.confirmTitle.textContent = "Delete Account?";
}

async function deleteProfile() {
  try {
    const response = await fetch(`${API_BASE}/Users/${currentUserObj.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Delete Account Failed", "error");
      return;
    }

    ProfileUI.profileOverlay.classList.remove("open");
    ProfileUI.profilePanel.classList.remove("open");
    ConfirmUI.confirmOverlay.classList.remove("open");
    logout();
  } catch (error) {
    showToast(error, "error");
  }
}

// =============================================================================
// APP BOOTSTRAP & SIDEBAR
// =============================================================================

function loadUserSidebar(currentUser) {
  MainUI.userDisplayName.textContent = currentUser.userName;
  MainUI.userDisplayEmail.textContent = currentUser.email;

  const usernameFirstInitials = currentUser.userName.slice(0, 2).toUpperCase();
  MainUI.userAvatarInitials.textContent = usernameFirstInitials;
}

function load() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  currentUserObj = JSON.parse(currentUser);

  AuthUI.authScreen.style.setProperty("display", "none");
  MainUI.appScreen.classList.add("visible");

  loadUserSidebar(currentUserObj);
  firstTasksLoad();
  navigateTo(document.querySelector(".nav-item.active"));
}

load();

// =============================================================================
// TASKS — FETCHING & BADGE COUNTS
// =============================================================================

async function firstTasksLoad() {
  let fetchUrl = `${API_BASE}/Tasks/All/${currentUserObj.id}`;

  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Fetch Tasks failed", "error");
      console.log(err);
      return;
    }

    allTasks = await response.json();
    updateBadges();
  } catch (error) {
    showToast(error, "error");
  }
}

function updateBadges() {
  let today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let todaysTasks = allTasks.filter(
    (task) =>
      new Date(task.dueDate).toLocaleDateString() ===
      today.toLocaleDateString(),
  );
  let tomorrowTasks = allTasks.filter(
    (task) =>
      new Date(task.dueDate).toLocaleDateString() ===
      tomorrow.toLocaleDateString(),
  );
  let earlierTasks = allTasks.filter((task) => new Date(task.dueDate) < today);
  let importantTasks = allTasks.filter((task) => task.isImportant);

  MainUI.badgeAll.textContent = allTasks.length;
  MainUI.badgeToday.textContent = todaysTasks.length;
  MainUI.badgeTomorrow.textContent = tomorrowTasks.length;
  MainUI.badgeEarlier.textContent = earlierTasks.length;
  MainUI.badgeImportant.textContent = importantTasks.length;
}

async function getTaskById(taskId) {
  try {
    const response = await fetch(`${API_BASE}/Tasks/${taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Can't fetch the current task.");
      return;
    }

    return await response.json();
  } catch (error) {
    showToast(error, "error");
  }
}

async function loadTasks(typeOfLoad) {
  let fetchUrl;

  switch (typeOfLoad) {
    case "all":
      fetchUrl = `${API_BASE}/Tasks/All/${currentUserObj.id}`;
      break;
    case "today":
      fetchUrl = `${API_BASE}/Tasks/Today/${currentUserObj.id}`;
      break;
    case "tomorrow":
      fetchUrl = `${API_BASE}/Tasks/Tomorrow/${currentUserObj.id}`;
      break;
    case "earlier":
      fetchUrl = `${API_BASE}/Tasks/Earlier/${currentUserObj.id}`;
      break;
    case "important":
      fetchUrl = `${API_BASE}/Tasks/Important/${currentUserObj.id}`;
      break;
    default:
      fetchUrl = `${API_BASE}/Tasks/All/${currentUserObj.id}`;
      break;
  }

  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Fetch Tasks failed", "error");
      console.log(err);
      return;
    }

    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    showToast(error, "error");
  }
}

// =============================================================================
// TASKS — TOGGLING STATE (IMPORTANT / COMPLETE)
// =============================================================================

async function toggleImportantState(taskId) {
  try {
    const currentTask = await getTaskById(taskId);

    const response = await fetch(`${API_BASE}/Tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskID: taskId,
        title: currentTask.title,
        description: currentTask.description ?? "",
        dueDate: currentTask.dueDate,
        isImportant: !currentTask.isImportant,
        statusID: currentTask.statusID,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Task Update Failed", "error");
      return;
    }

    const currentNav = document.querySelector(".nav-item.active");
    navigateTo(currentNav);
    firstTasksLoad();
  } catch (error) {
    showToast(error, "error");
  }
}

async function toggleCompleteState(taskId) {
  try {
    const currentTask = await getTaskById(taskId);

    const response = await fetch(`${API_BASE}/Tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskID: taskId,
        title: currentTask.title,
        description: currentTask.description ?? "",
        dueDate: currentTask.dueDate,
        isImportant: currentTask.isImportant,
        statusID: currentTask.statusID === 1 ? 2 : 1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Task Update Failed", "error");
      return;
    }

    const currentNav = document.querySelector(".nav-item.active");
    navigateTo(currentNav);
    firstTasksLoad();
  } catch (error) {
    showToast(error, "error");
  }
}

// =============================================================================
// TASKS — ADD / EDIT MODAL
// =============================================================================

function createStatusOption(id, statusName) {
  const statusOption = document.createElement("option");
  statusOption.value = statusName;
  statusOption.textContent = statusName;
  statusOption.dataset.statusId = id;

  return statusOption;
}

function loadStatuses() {
  ModalUI.taskStatus.options.length = 0;
  const inProgressStatusOption = createStatusOption(1, "In Progress");
  const completeStatusOption = createStatusOption(2, "Completed");
  const overdueStatusOption = createStatusOption(3, "Overdue");
  ModalUI.taskStatus.appendChild(inProgressStatusOption);
  ModalUI.taskStatus.appendChild(completeStatusOption);
  ModalUI.taskStatus.appendChild(overdueStatusOption);
}

async function loadModalData(taskId) {
  const currentTask = await getTaskById(taskId);
  ModalUI.taskId.value = taskId;
  ModalUI.taskTitle.value = currentTask.title;
  ModalUI.taskDescription.value = currentTask.description;
  ModalUI.taskDueDate.value = currentTask.dueDate;
  ModalUI.taskStatus.value = currentTask.statusName;
  ModalUI.taskIsImportant.checked = currentTask.isImportant;
}

function emptyModal() {
  ModalUI.taskId.value = null;
  ModalUI.taskTitle.value = "";
  ModalUI.taskDescription.value = "";
  ModalUI.taskDueDate.value = new Date().toISOString().split("T")[0];
  ModalUI.taskIsImportant.checked = false;
}

function openAddModal() {
  ModalUI.modalOverlay.classList.add("open");
  ModalUI.taskForm.dataset.mode = "add";
  ModalUI.modalTitle.textContent = "Add Task";
  ModalUI.modalSubmit.querySelector("span").textContent = "Add Task";
  ModalUI.modalSubmit.querySelector("svg").style.display = "";
  ModalUI.modalError.style.display = "none";
  emptyModal();
  loadStatuses();
}

async function openEditModal(taskId) {
  ModalUI.modalOverlay.classList.add("open");
  ModalUI.taskForm.dataset.mode = "edit";
  ModalUI.modalTitle.textContent = "Edit Task";
  ModalUI.modalSubmit.querySelector("span").textContent = "Save Changes";
  ModalUI.modalSubmit.querySelector("svg").style.display = "none";
  ModalUI.modalError.style.display = "none";

  loadStatuses();
  loadModalData(taskId);
}

function getTaskFromForm() {
  const task = {};
  task.taskID = parseInt(ModalUI.taskId.value) || null;

  const title = ModalUI.taskTitle.value.trim();
  if (!title) {
    ModalUI.modalError.style.display = "block";
    ModalUI.modalError.textContent = "Title is required!";
    return null;
  }
  task.title = title;

  task.description = ModalUI.taskDescription.value.trim();
  task.dueDate = ModalUI.taskDueDate.value;
  task.issueDate = new Date();
  task.statusID = parseInt(
    ModalUI.taskStatus.selectedOptions[0].dataset.statusId,
  );
  task.isImportant = ModalUI.taskIsImportant.checked;

  return task;
}

async function addTask() {
  const newTask = getTaskFromForm();

  if (!newTask) return false;

  try {
    const response = await fetch(`${API_BASE}/Tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTask.title,
        description: newTask.description ?? "",
        issueDate: new Date(),
        dueDate: newTask.dueDate,
        isImportant: newTask.isImportant,
        statusID: newTask.statusID,
        userID: currentUserObj.id,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Task Adding Failed", "error");
      return false;
    }
    return true;
  } catch (error) {
    showToast(error, "error");
    return false;
  }
}

async function updateTask() {
  const updatedTask = getTaskFromForm();

  if (!updatedTask) return false;

  try {
    const response = await fetch(`${API_BASE}/Tasks/${updatedTask.taskID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskID: updatedTask.taskID,
        title: updatedTask.title,
        description: updatedTask.description ?? "",
        dueDate: updatedTask.dueDate,
        isImportant: updatedTask.isImportant,
        statusID: updatedTask.statusID,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Task Update Failed", "error");
      return false;
    }

    return true;
  } catch (error) {
    showToast(error, "error");
    return false;
  }
}

async function submitTask(event) {
  event.preventDefault();
  const mode = ModalUI.taskForm.dataset.mode;
  let submitSucceeded = true;
  if (mode === "add") submitSucceeded = await addTask();
  if (mode === "edit") submitSucceeded = await updateTask();

  if (!submitSucceeded) return;

  ModalUI.modalOverlay.classList.remove("open");
  const currentNav = document.querySelector(".nav-item.active");
  navigateTo(currentNav);
  firstTasksLoad();
}

// =============================================================================
// TASKS — DELETE
// =============================================================================

let currentTaskIdToDelete;

function openDeleteTask(taskId) {
  currentTaskIdToDelete = taskId;
  ConfirmUI.confirmOverlay.classList.add("open");
  ConfirmUI.confirmTitle.textContent = "Delete Task?";
}

async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_BASE}/Tasks/${taskId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.text();
      showToast(err || "Delete Task Failed!", "error");
      return;
    }

    ConfirmUI.confirmOverlay.classList.remove("open");
    const currentNav = document.querySelector(".nav-item.active");
    navigateTo(currentNav);
    firstTasksLoad();
  } catch (error) {
    showToast(error, "error");
  }
}

// =============================================================================
// TASKS — RENDERING & FILTERING
// =============================================================================

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderTasks(tasks) {
  MainUI.loadingSpinner.style.display = "none";
  const taskCount = tasks.length;
  document.querySelector(".nav-item.active .nav-badge").textContent = taskCount;
  if (taskCount === 0) {
    MainUI.emptyState.style.display = "flex";
    return;
  }

  MainUI.emptyState.style.display = "none";
  MainUI.taskList.innerHTML = "";

  tasks.forEach((task) => {
    const clone = MainUI.taskCardTemplate.content.cloneNode(true);
    const card = clone.querySelector(".task-card");
    card.dataset.taskId = task.taskID;
    if (task.statusName === "Completed")
      card.querySelector(".task-check").classList.add("done");
    card.querySelector(".task-title").textContent = task.title;
    card.querySelector(".task-description").textContent = task.description;
    card.querySelector(".task-tag.due").append(formatDate(task.dueDate));
    card.querySelector(".task-status").textContent = task.statusName;
    if (task.isImportant)
      card.querySelector(".btn-icon.star").classList.add("active");

    MainUI.taskList.appendChild(clone);
  });
}

// Helper filters used by both navigation and search
function getTodayTasks(allTasks) {
  let today = new Date();
  return allTasks.filter(
    (task) =>
      new Date(task.dueDate).toLocaleDateString() ===
      today.toLocaleDateString(),
  );
}

function getTomorrowsTasks(allTasks) {
  let today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  return allTasks.filter(
    (task) =>
      new Date(task.dueDate).toLocaleDateString() ===
      tomorrow.toLocaleDateString(),
  );
}

function getEarlierTasks(allTasks) {
  let today = new Date();
  return allTasks.filter((task) => new Date(task.dueDate) < today);
}

function getImportantTasks(allTasks) {
  return allTasks.filter((task) => task.isImportant);
}

// Re-renders visible task list based on active nav + current search query
function render() {
  const q = MainUI.searchInput.value.trim();
  let tasksToFilter;
  let filtered;
  const currentNav = document.querySelector(".nav-item.active");

  switch (currentNav) {
    case MainUI.navAll:
      tasksToFilter = allTasks;
      break;
    case MainUI.navToday:
      tasksToFilter = getTodayTasks(allTasks);
      break;
    case MainUI.navTomorrow:
      tasksToFilter = getTomorrowsTasks(allTasks);
      break;
    case MainUI.navEarlier:
      tasksToFilter = getEarlierTasks(allTasks);
      break;
    case MainUI.navImportant:
      tasksToFilter = getImportantTasks(allTasks);
      break;
    default:
      tasksToFilter = allTasks;
      break;
  }

  const query = q.toLowerCase();
  filtered = tasksToFilter.filter((task) =>
    task.title.toLowerCase().includes(query),
  );

  renderTasks(filtered);
}

// =============================================================================
// NAVIGATION
// =============================================================================

async function navigateTo(element) {
  let typeOfLoad;

  switch (element) {
    case MainUI.navAll:
      typeOfLoad = "all";
      break;
    case MainUI.navToday:
      typeOfLoad = "today";
      break;
    case MainUI.navTomorrow:
      typeOfLoad = "tomorrow";
      break;
    case MainUI.navEarlier:
      typeOfLoad = "earlier";
      break;
    case MainUI.navImportant:
      typeOfLoad = "important";
      break;
    default:
      typeOfLoad = "all";
      break;
  }

  document.querySelector(".nav-item.active").classList.remove("active");
  element.classList.add("active");
  MainUI.viewTitle.textContent = element.textContent.trim().slice(0, -1);
  MainUI.searchInput.value = "";
  await loadTasks(typeOfLoad);
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

// --- Auth ---
AuthUI.tabLogin.addEventListener("click", toggleAuthTabs);
AuthUI.tabSignup.addEventListener("click", toggleAuthTabs);
AuthUI.formSignup.addEventListener("submit", signUp);
AuthUI.formLogin.addEventListener("submit", login);
MainUI.btnLogout.addEventListener("click", logout);
AuthUI.btnLoadDemo.addEventListener("click", (event) => {
  AuthUI.loginUsername.value = "demo";
  AuthUI.loginPassword.value = "demo123";

  showToast("Demo credentials loaded. Click Sign In.", "info");
});

// --- Profile ---
MainUI.sidebarUserTile.addEventListener("click", openProfilePanel);
ProfileUI.profileClose.addEventListener("click", () => {
  ProfileUI.profileOverlay.classList.remove("open");
  ProfileUI.profilePanel.classList.remove("open");
});
ProfileUI.profileForm.addEventListener("submit", updateProfile);
ProfileUI.btnDeleteAccount.addEventListener("click", openDeleteProfile);

// --- Task Modal ---
MainUI.btnAddTask.addEventListener("click", openAddModal);
ModalUI.taskForm.addEventListener("submit", submitTask);
ModalUI.modalClose.addEventListener("click", () => {
  ModalUI.modalOverlay.classList.remove("open");
});
ModalUI.modalCancel.addEventListener("click", () => {
  ModalUI.modalOverlay.classList.remove("open");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    ModalUI.modalOverlay.classList.remove("open");
  }
});

// --- Delete Confirm ---
ConfirmUI.confirmDelete.addEventListener("click", () => {
  if (ConfirmUI.confirmTitle.textContent === "Delete Task?")
    deleteTask(currentTaskIdToDelete);
  else deleteProfile();
});
ConfirmUI.confirmCancel.addEventListener("click", () => {
  ConfirmUI.confirmOverlay.classList.remove("open");
});

// --- Task List (delegated) ---
MainUI.taskList.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const taskId = btn.closest(".task-card").dataset.taskId;

  if (action === "toggle-important") toggleImportantState(taskId);
  if (action === "toggle-complete") toggleCompleteState(taskId);
  if (action === "edit") openEditModal(taskId);
  if (action === "delete") openDeleteTask(taskId);
});

// --- Search ---
MainUI.searchInput.addEventListener("input", render);

// --- Sidebar Navigation ---
MainUI.navAll.addEventListener("click", () => navigateTo(MainUI.navAll));
MainUI.navToday.addEventListener("click", () => navigateTo(MainUI.navToday));
MainUI.navTomorrow.addEventListener("click", () =>
  navigateTo(MainUI.navTomorrow),
);
MainUI.navEarlier.addEventListener("click", () =>
  navigateTo(MainUI.navEarlier),
);
MainUI.navImportant.addEventListener("click", () =>
  navigateTo(MainUI.navImportant),
);
