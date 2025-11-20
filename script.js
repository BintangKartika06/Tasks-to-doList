// Data tugas disimpan di localStorage
// Format tugas: {id, name, date (YYYY-MM-DD), completed:bool}

// Storage key
const STORAGE_KEY = 'todoList_data';

// Cache elemen navigasi
const navHome = document.getElementById('nav-home');
const navDaftar = document.getElementById('nav-daftar');
const navTasks = document.getElementById('nav-tasks');
const content = document.getElementById('content');

// Render halaman default (Home)
let currentPage = 'home'; // home, daftar, tasks
let tasks = [];
let selectedDay = null;

// --- Helper fungsi untuk localStorage ---
function loadTasksFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    tasks = JSON.parse(data);
  } else {
    tasks = [];
  }
}

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- Format tanggal ke tulisan (contoh Selasa, 31 Des) ---
const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const bulanIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTanggal(tglStr) {
  if (!tglStr) return '';
  const dt = new Date(tglStr + 'T00:00:00');
  if (isNaN(dt)) return '';
  const hari = hariIndo[dt.getDay()];
  const tanggal = dt.getDate();
  const bulan = bulanIndo[dt.getMonth()];
  return `${hari}, ${tanggal} ${bulan}`;
}

// --- Fungsi membuat ID unik ---
function createId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// --- Fungsi Menandai active menu ---
function setActiveMenu(menu) {
  navHome.classList.remove('active');
  navDaftar.classList.remove('active');
  navTasks.classList.remove('active');
  if (menu === 'home') navHome.classList.add('active');
  if (menu === 'daftar') navDaftar.classList.add('active');
  if (menu === 'tasks') navTasks.classList.add('active');
}

// --- Fungsi render Home page ---
function renderHome() {
  currentPage = 'home';
  setActiveMenu('home');
  selectedDay = null; // reset filter hari
  content.innerHTML = '';

  const header = document.createElement('h1');
  header.textContent = 'Aplikasi To-Do List';

  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Tambahkan tugas, tandai selesai, dan hapus tugas yang sudah tidak diperlukan.';

  // Box Tasks + Completed
  const box = document.createElement('div');
  box.className = 'section-box';

  // -- Title bar Today with arrow and day filter
  const todayWrapper = document.createElement('div');
  todayWrapper.style.textAlign = 'center';
  todayWrapper.style.marginBottom = '1.2rem';

  const todayTitle = document.createElement('div');
  todayTitle.className = 'day-filter-container';
  todayTitle.textContent = 'Today';

  const arrowSmall = document.createElement('span');
  arrowSmall.className = 'collapse-arrow-small';
  arrowSmall.textContent = '▼';
  todayTitle.appendChild(arrowSmall);
  todayWrapper.appendChild(todayTitle);

  // Container day list (Minggu, Senin)
  const dayList = document.createElement('div');
  dayList.className = 'day-list';
  dayList.style.display = 'none';

  ['Minggu', 'Senin'].forEach(d => {
    const btnDay = document.createElement('button');
    btnDay.textContent = d;
    btnDay.onclick = () => {
      if (selectedDay === d) {
        selectedDay = null;
      } else {
        selectedDay = d;
      }
      renderHome(); // rerender
    };
    if (selectedDay === d) btnDay.classList.add('active');
    dayList.appendChild(btnDay);
  });
  todayWrapper.appendChild(dayList);

  arrowSmall.onclick = () => {
    if (dayList.style.display === 'none') {
      dayList.style.display = 'flex';
      arrowSmall.style.transform = 'rotate(180deg)';
    } else {
      dayList.style.display = 'none';
      arrowSmall.style.transform = 'rotate(0deg)';
    }
  };

  // ------------------------------------------------------------------------------------
  // Section Tasks (collapse)
  const sectionTasks = createCollapsibleSection('Tasks', true);
  // Filter tugas yg belum selesai
  let filteredTasks = tasks.filter(t => !t.completed);

  // Jika day filter aktif, filter berdasarkan day
  if (selectedDay) {
    filteredTasks = filteredTasks.filter(t => {
      if (!t.date) return false;
      const dt = new Date(t.date + 'T00:00:00');
      const dayName = hariIndo[dt.getDay()];
      return dayName === selectedDay;
    });
  }

  renderTaskList(filteredTasks, sectionTasks.tasksContainer, false);

  // Footer collapse circle untuk collapse semua tugas
  const collapseCircle = document.createElement('div');
  collapseCircle.className = 'collapse-circle';
  collapseCircle.title = 'Collapse Semua Tugas';
  const iconArrow = document.createElement('span');
  iconArrow.textContent = '▼';
  collapseCircle.appendChild(iconArrow);
  collapseCircle.onclick = () => {
    if (sectionTasks.container.style.display === 'none') {
      sectionTasks.container.style.display = 'flex';
      iconArrow.style.transform = 'rotate(0deg)';
    } else {
      sectionTasks.container.style.display = 'none';
      iconArrow.style.transform = 'rotate(180deg)';
    }
  };
  // append after tasks section
  sectionTasks.wrapper.appendChild(collapseCircle);

  // ------------------------------------------------------------------------------------
  // Section Completed (collapse)
  const sectionCompleted = createCollapsibleSection('Completed', true);
  let completedTasks = tasks.filter(t => t.completed);
  if (selectedDay) {
    completedTasks = completedTasks.filter(t => {
      if (!t.date) return false;
      const dt = new Date(t.date + 'T00:00:00');
      const dayName = hariIndo[dt.getDay()];
      return dayName === selectedDay;
    });
  }
  renderTaskList(completedTasks, sectionCompleted.tasksContainer, true);

  // Footer collapse circle completed
  const collapseCircleC = document.createElement('div');
  collapseCircleC.className = 'collapse-circle';
  collapseCircleC.title = 'Collapse Semua Completed';
  const iconArrowC = document.createElement('span');
  iconArrowC.textContent = '▼';
  collapseCircleC.appendChild(iconArrowC);
  collapseCircleC.onclick = () => {
    if (sectionCompleted.container.style.display === 'none') {
      sectionCompleted.container.style.display = 'flex';
      iconArrowC.style.transform = 'rotate(0deg)';
    } else {
      sectionCompleted.container.style.display = 'none';
      iconArrowC.style.transform = 'rotate(180deg)';
    }
  };
  sectionCompleted.wrapper.appendChild(collapseCircleC);

  content.appendChild(header);
  content.appendChild(subtitle);
  content.appendChild(todayWrapper);
  content.appendChild(box);
  
  box.appendChild(sectionTasks.wrapper);
  box.appendChild(sectionCompleted.wrapper);
}

// Fungsi render Daftar Tugas page
function renderDaftarTugas() {
  currentPage = 'daftar';
  setActiveMenu('daftar');
  content.innerHTML = '';

  const header = document.createElement('h1');
  header.textContent = 'Daftar Tugas';

  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Tambahkan tugas, tandai selesai, dan hapus tugas yang sudah tidak diperlukan.';

  content.appendChild(header);
  content.appendChild(subtitle);

  // Container form tambah tugas
  const formContainer = document.createElement('div');
  formContainer.className = 'add-task-container';

  // Input nama tugas
  const inputTaskName = document.createElement('input');
  inputTaskName.type = 'text';
  inputTaskName.placeholder = 'Tulis nama tugas, misalnya: Belajar JavaScript';
  inputTaskName.id = 'input-task-name';

  // Input tanggal deadline
  const inputTaskDate = document.createElement('input');
  inputTaskDate.type = 'date';
  inputTaskDate.id = 'input-task-date';

  // Button tambah tugas
  const btnAdd = document.createElement('button');
  btnAdd.textContent = 'Tambah';
  btnAdd.id = 'btn-add-task';

  // Icon kalender (informasi)
  const calendarIcon = document.createElement('span');
  calendarIcon.className = 'calendar-icon';
  calendarIcon.textContent = '📅';

  formContainer.appendChild(inputTaskName);
  formContainer.appendChild(inputTaskDate);
  formContainer.appendChild(btnAdd);
  formContainer.appendChild(calendarIcon);

  content.appendChild(formContainer);

  btnAdd.addEventListener('click', () => {
    const name = inputTaskName.value.trim();
    const dateVal = inputTaskDate.value;
    if (name.length === 0) {
      alert('Nama tugas tidak boleh kosong!');
      return;
    }
    if (!dateVal) {
      alert('Tanggal deadline harus diisi!');
      return;
    }
    // Tambah tugas
    tasks.push({
      id: createId(),
      name,
      date: dateVal,
      completed: false,
    });
    saveTasksToStorage();
    inputTaskName.value = '';
    inputTaskDate.value = '';

    alert('Tugas berhasil ditambahkan! Silakan cek di halaman Tasks dan Home.');
  });
}

// Fungsi render Tasks page
function renderTasks() {
  currentPage = 'tasks';
  setActiveMenu('tasks');
  selectedDay = null;

  content.innerHTML = '';

  const header = document.createElement('h1');
  header.textContent = 'Home Tasks';

  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Tambahkan tugas, tandai selesai, dan hapus tugas yang sudah tidak diperlukan.';

  content.appendChild(header);
  content.appendChild(subtitle);

  // Container utama tugas dan completed
  const box = document.createElement('div');
  box.className = 'section-box';

  // Section Tasks Collapse dengan arrow
  const sectionTasks = createCollapsibleSection('Tasks', true);
  const uncompletedTasks = tasks.filter(t => !t.completed);
  renderTaskList(uncompletedTasks, sectionTasks.tasksContainer, false);

  // Footer collapse circle Tasks
  const collapseCircle = document.createElement('div');
  collapseCircle.className = 'collapse-circle';
  collapseCircle.title = 'Collapse Semua Tugas';
  const iconArrow = document.createElement('span');
  iconArrow.textContent = '▼';
  collapseCircle.appendChild(iconArrow);
  collapseCircle.onclick = () => {
    if (sectionTasks.container.style.display === 'none') {
      sectionTasks.container.style.display = 'flex';
      iconArrow.style.transform = 'rotate(0deg)';
    } else {
      sectionTasks.container.style.display = 'none';
      iconArrow.style.transform = 'rotate(180deg)';
    }
  };

  // Section Completed
  const sectionCompleted = createCollapsibleSection('Completed', true);
  const completedTasks = tasks.filter(t => t.completed);
  renderTaskList(completedTasks, sectionCompleted.tasksContainer, true);

  // Footer collapse circle Completed
  const collapseCircleC = document.createElement('div');
  collapseCircleC.className = 'collapse-circle';
  collapseCircleC.title = 'Collapse Semua Completed';
  const iconArrowC = document.createElement('span');
  iconArrowC.textContent = '▼';
  collapseCircleC.appendChild(iconArrowC);
  collapseCircleC.onclick = () => {
    if (sectionCompleted.container.style.display === 'none') {
      sectionCompleted.container.style.display = 'flex';
      iconArrowC.style.transform = 'rotate(0deg)';
    } else {
      sectionCompleted.container.style.display = 'none';
      iconArrowC.style.transform = 'rotate(180deg)';
    }
  };

  box.appendChild(sectionTasks.wrapper);
  box.appendChild(collapseCircle);
  box.appendChild(sectionCompleted.wrapper);
  box.appendChild(collapseCircleC);

  content.appendChild(box);
}

// ---- Fungsi membuat section collapsible (Tasks/Completed) ---
function createCollapsibleSection(title, defaultExpanded = true) {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '1rem';

  const header = document.createElement('div');
  header.className = 'section-header';

  // Icon rumah (menggunakan unicode house)
  const iconHome = document.createElement('span');
  iconHome.textContent = '🏠';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = title;

  // Arrow yang bisa di klik untuk collapse section
  const arrow = document.createElement('span');
  arrow.className = 'collapse-arrow';
  arrow.textContent = '▼';

  header.appendChild(iconHome);
  header.appendChild(titleSpan);
  header.appendChild(arrow);
  header.style.gap = '12px';
  header.style.cursor = 'pointer';

  // Container list tugas
  const tasksContainer = document.createElement('div');
  tasksContainer.style.display = defaultExpanded ? 'flex' : 'none';
  tasksContainer.style.flexDirection = 'column';
  tasksContainer.style.gap = '10px';
  tasksContainer.style.marginTop = '10px';

  wrapper.appendChild(header);
  wrapper.appendChild(tasksContainer);

  // Toggle
  header.onclick = () => {
    if (tasksContainer.style.display === 'none') {
      tasksContainer.style.display = 'flex';
      arrow.classList.remove('collapsed');
    } else {
      tasksContainer.style.display = 'none';
      arrow.classList.add('collapsed');
    }
  };

  return { wrapper, tasksContainer, container: tasksContainer };
}

// --- Render daftar tugas ke container --
// completed: true jika task sudah selesai
function renderTaskList(listTasks, container, completed) {
  container.innerHTML = '';
  if (listTasks.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = '(Tidak ada tugas)';
    emptyMsg.style.color = '#888';
    emptyMsg.style.fontStyle = 'italic';
    container.appendChild(emptyMsg);
    return;
  }

  listTasks.forEach((t) => {
    const taskBox = document.createElement('div');
    taskBox.className = 'task-item';
    if (completed) {
      taskBox.classList.add('completed');
    }

    // Kiri: lingkaran dan nama tugas + tanggal
    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const circle = document.createElement('span');
    circle.className = 'circle-checkbox';
    if (t.completed) circle.classList.add('active');
    circle.title = t.completed ? 'Tugas sudah selesai' : 'Tandai tugas selesai';

    circle.onclick = (e) => {
      e.stopPropagation();
      t.completed = !t.completed;
      saveTasksToStorage();
      rerenderCurrentPage();
    };

    const nameSpan = document.createElement('span');
    nameSpan.className = 'task-name';
    nameSpan.textContent = t.name;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'task-date';
    dateSpan.textContent = formatTanggal(t.date);

    leftDiv.appendChild(circle);
    leftDiv.appendChild(nameSpan);
    leftDiv.appendChild(dateSpan);

    // Kanan: tombol aksi (edit, hapus, selesai)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    if (!completed) {
      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Edit';
      btnEdit.className = 'edit-btn';
      btnEdit.title = 'Edit tugas';
      btnEdit.onclick = (e) => {
        e.stopPropagation();
        editTaskPopup(t);
      };

      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Hapus';
      btnDelete.className = 'delete-btn';
      btnDelete.title = 'Hapus tugas';
      btnDelete.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Yakin hapus tugas ini?')) {
          tasks = tasks.filter(task => task.id !== t.id);
          saveTasksToStorage();
          rerenderCurrentPage();
        }
      };

      const btnDone = document.createElement('button');
      btnDone.textContent = 'Selesai';
      btnDone.className = 'done-btn';
      btnDone.title = 'Tandai selesai';
      btnDone.onclick = (e) => {
        e.stopPropagation();
        t.completed = true;
        saveTasksToStorage();
        rerenderCurrentPage();
      };

      actionsDiv.appendChild(btnEdit);
      actionsDiv.appendChild(btnDelete);
      actionsDiv.appendChild(btnDone);
    } else {
      // Completed items hanya ada tombol hapus
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Hapus';
      btnDelete.className = 'delete-btn';
      btnDelete.title = 'Hapus tugas';
      btnDelete.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Yakin hapus tugas ini dari Completed?')) {
          tasks = tasks.filter(task => task.id !== t.id);
          saveTasksToStorage();
          rerenderCurrentPage();
        }
      };
      actionsDiv.appendChild(btnDelete);
    }

    taskBox.appendChild(leftDiv);
    taskBox.appendChild(actionsDiv);

    container.appendChild(taskBox);
  });
}

// --- Fungsi Edit task ---
function editTaskPopup(task) {
  // Popup sederhana (prompt) untuk edit nama dan tanggal
  let newName = prompt('Edit Nama Tugas:', task.name);
  if (newName === null) return; // batal
  newName = newName.trim();
  if (newName.length === 0) {
    alert('Nama tugas tidak boleh kosong!');
    return;
  }

  let newDate = prompt('Edit Tanggal (YYYY-MM-DD):', task.date);
  if (newDate === null) return; // batal
  newDate = newDate.trim();

  // Validasi format tanggal
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    alert('Format tanggal harus YYYY-MM-DD');
    return;
  }
  const dt = new Date(newDate + 'T00:00:00');
  if (isNaN(dt.getTime())) {
    alert('Tanggal tidak valid!');
    return;
  }

  task.name = newName;
  task.date = newDate;
  saveTasksToStorage();
  rerenderCurrentPage();
}

// --- Fungsi rerender current page ---
function rerenderCurrentPage() {
  loadTasksFromStorage();
  if (currentPage === 'home') renderHome();
  else if (currentPage === 'tasks') renderTasks();
  else if (currentPage === 'daftar') renderDaftarTugas();
}

// --- Event Listener navigasi ---
navHome.addEventListener('click', (e) => {
  e.preventDefault();
  renderHome();
});

navDaftar.addEventListener('click', (e) => {
  e.preventDefault();
  renderDaftarTugas();
});

navTasks.addEventListener('click', (e) => {
  e.preventDefault();
  renderTasks();
});

// --- Inisialisasi -->
loadTasksFromStorage();
renderHome();
