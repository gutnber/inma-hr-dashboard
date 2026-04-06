/**
 * INMA HR Dashboard - Application Logic
 * Pure vanilla JS, localStorage persistence
 * Designed for future backend migration
 * 
 * Author: INMA Development
 * Version: 1.0.0
 */

// ========================== CONSTANTS ==========================
const STORAGE_KEYS = {
  empleados: 'inma_empleados',
  clockRecords: 'inma_clockRecords',
  tareas: 'inma_tareas',
  currentSession: 'inma_session'
};

// ========================== DATA INITIALIZATION ==========================
/**
 * Seed sample data if localStorage is empty
 * Realistic mock data for INMA employees
 */
function initSampleData() {
  // Only seed if nothing exists
  if (localStorage.getItem(STORAGE_KEYS.empleados)) return;
  
  // Empleados de ejemplo
  const empleados = [
    { id: 'e1', username: 'admin', password: 'admin123', nombre: 'Silvia Martínez', rol: 'admin' },
    { id: 'e2', username: 'maria', password: 'pass123', nombre: 'María López', rol: 'empleado' },
    { id: 'e3', username: 'carlos', password: 'pass123', nombre: 'Carlos Ramírez', rol: 'empleado' },
    { id: 'e4', username: 'ana', password: 'pass123', nombre: 'Ana Torres', rol: 'empleado' },
    { id: 'e5', username: 'jorge', password: 'pass123', nombre: 'Jorge Hernández', rol: 'empleado' }
  ];
  
  saveData(STORAGE_KEYS.empleados, empleados);
  
  // Sample clock records (this week)
  const now = new Date();
  const clockRecords = [];
  let rid = 'cr1';
  
  // Generate records for past 4 weekdays and today
  for (let d = 4; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    // Skip weekend
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    ['e2', 'e3', 'e4'].forEach(empId => {
      // Clock in 8:45-9:15 AM
      const inH = 8 + Math.floor(Math.random() * 1);
      const inM = 30 + Math.floor(Math.random() * 30);
      clockRecords.push({
        id: rid++,
        empleadoId: empId,
        tipo: 'in',
        timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), inH, inM, 0).toISOString()
      });
      // Clock out 5:30-6:15 PM
      const outH = 17 + Math.floor(Math.random() * 2);
      const outM = Math.floor(Math.random() * 45);
      clockRecords.push({
        id: rid++,
        empleadoId: empId,
        tipo: 'out',
        timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), outH, outM, 0).toISOString()
      });
    });
  }
  
  saveData(STORAGE_KEYS.clockRecords, clockRecords);
  
  // Sample tasks
  const today = new Date();
  const futureDate = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const pastDate = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };
  
  const tareas = [
    { id: 't1', titulo: 'Contactar clientes leads de Zona Norte', descripcion: 'Llamar a los 15 leads generados por Facebook Ads de la semana pasada', prioridad: 'alta', fechaLimite: futureDate(1), asignadoA: 'e2', estado: 'pendiente', createdAt: new Date().toISOString() },
    { id: 't2', titulo: 'Actualizar fotos propiedad Av. López Mateos', descripcion: 'Coordinar sesión fotográfica con el fotógrafo externo', prioridad: 'media', fechaLimite: futureDate(2), asignadoA: 'e3', estado: 'pendiente', createdAt: new Date().toISOString() },
    { id: 't3', titulo: 'Preparer contrato arrendamiento Depto 4B', descripcion: 'Contrato de 1 año, fiador ya aprobado', prioridad: 'alta', fechaLimite: pastDate(1), asignadoA: 'e4', estado: 'pendiente', createdAt: new Date().toISOString() },
    { id: 't4', titulo: 'Revisar inventario Airtable', descripcion: 'Verificar que las 23 propiedades activas tengan datos completos', prioridad: 'baja', fechaLimite: futureDate(3), asignadoA: 'e2', estado: 'pendiente', createdAt: new Date().toISOString() },
    { id: 't5', titulo: 'Publicar property en Marketplace', descripcion: 'Casa en Fraccionamiento Valle Dorado - 3 rec, 2.5 baños', prioridad: 'media', fechaLimite: futureDate(1), asignadoA: 'e5', estado: 'completada', createdAt: new Date().toISOString() },
    { id: 't6', titulo: 'Respaldo mensual documentos', descripcion: 'Backup de contratos y documentos en carpeta compartida', prioridad: 'baja', fechaLimite: futureDate(5), asignadoA: 'e3', estado: 'pendiente', createdAt: new Date().toISOString() },
    { id: 't7', titulo: 'Seguimiento pago renta Depto 2A', descripcion: 'El inquilino reporta retraso de pago - contactar amablemente', prioridad: 'alta', fechaLimite: pastDate(3), asignadoA: 'e4', estado: 'completada', createdAt: new Date().toISOString() },
    { id: 't8', titulo: 'Organizar visitas fin de semana', descripcion: 'Agendar 4 visitas para sábado - confirmar horarios con clientes', prioridad: 'alta', fechaLimite: futureDate(3), asignadoA: 'e5', estado: 'pendiente', createdAt: new Date().toISOString() }
  ];
  
  saveData(STORAGE_KEYS.tareas, tareas);
}

// ========================== STORAGE HELPERS ==========================
/**
 * Generic data retrieval from localStorage
 * @param {string} key - Storage key
 * @returns {Array|Object} Stored data
 */
function getData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading', key, e);
    return [];
  }
}

/**
 * Generic data save to localStorage
 * @param {string} key - Storage key
 * @param {Array|Object} data - Data to save
 */
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving', key, e);
    showToast('Error al guardar datos', 'danger');
  }
}

// ========================== UTILITY FUNCTIONS ==========================
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDateTime(isoStr) {
  return formatDate(isoStr) + ' ' + formatTime(isoStr);
}

function isOverdue(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T23:59:59');
  return due < today;
}

function isNext3Days(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= 3;
}

function isToday(isoStr) {
  const d = new Date(isoStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

function isThisWeek(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return d >= startOfWeek && d <= endOfWeek;
}

function calculateHours(records) {
  // Pair in/out records and calculate hours
  const sorted = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let totalMinutes = 0;
  let lastIn = null;
  
  for (const rec of sorted) {
    if (rec.tipo === 'in') {
      lastIn = new Date(rec.timestamp);
    } else if (rec.tipo === 'out' && lastIn) {
      const out = new Date(rec.timestamp);
      totalMinutes += (out - lastIn) / (1000 * 60);
      lastIn = null;
    }
  }
  return (totalMinutes / 60).toFixed(1);
}

function getEmployeeName(empId) {
  const empleados = getData(STORAGE_KEYS.empleados);
  const emp = empleados.find(e => e.id === empId);
  return emp ? emp.nombre : 'Desconocido';
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function showLoading(el, icon, text) {
  el.innerHTML = `<div class="empty-state"><i class="fas fa-${icon}"></i><p>${text}</p></div>`;
}

/**
 * Show toast notification
 * @param {string} msg - Message to display
 * @param {string} type - success, danger, warning
 */
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast-${type} show`;
  setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// ========================== AUTH ==========================
function login(username, password) {
  const empleados = getData(STORAGE_KEYS.empleados);
  const user = empleados.find(e => e.username === username && e.password === password);
  if (user) {
    saveData(STORAGE_KEYS.currentSession, { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol });
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.currentSession);
  document.getElementById('login-view').style.display = '';
  document.getElementById('app-view').style.display = 'none';
  document.getElementById('login-form').reset();
}

function checkSession() {
  const session = getData(STORAGE_KEYS.currentSession);
  if (session && session.id) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app-view').style.display = '';
    setupUI(session);
  } else {
    document.getElementById('login-view').style.display = '';
    document.getElementById('app-view').style.display = 'none';
  }
}

function setupUI(session) {
  // User info in sidebar
  document.getElementById('user-display-name').textContent = session.nombre;
  document.getElementById('user-role-display').textContent = session.rol === 'admin' ? 'Administrador' : 'Empleado';
  document.getElementById('user-avatar').textContent = getInitials(session.nombre);
  
  // Show/hide admin nav
  const adminItems = document.querySelectorAll('.nav-item.admin-only');
  adminItems.forEach(item => {
    item.style.display = session.rol === 'admin' ? 'flex' : 'none';
  });
  
  // Navigate to dashboard
  navigateTo('dashboard');
}

// ========================== NAVIGATION ==========================
function navigateTo(page) {
  // Update active nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Show page
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  
  // Render page content
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'reloj': renderReloj(); break;
    case 'tareas': renderTasks(); break;
    case 'admin': renderAdmin(); break;
  }
  
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}

// ========================== CLOCK ==========================
let clockInterval = null;

function startClock() {
  if (clockInterval) clearInterval(clockInterval);
  function update() {
    const now = new Date();
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  update();
  clockInterval = setInterval(update, 1000);
}

function isCurrentlyClockedIn(empId) {
  const records = getData(STORAGE_KEYS.clockRecords);
  const empRecords = records.filter(r => r.empleadoId === empId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return empRecords.length > 0 && empRecords[0].tipo === 'in';
}

function toggleClock() {
  const session = getData(STORAGE_KEYS.currentSession);
  if (!session) return;
  
  const records = getData(STORAGE_KEYS.clockRecords);
  const clockedIn = isCurrentlyClockedIn(session.id);
  
  if (clockedIn) {
    // Clock out
    records.push({
      id: generateId(),
      empleadoId: session.id,
      tipo: 'out',
      timestamp: new Date().toISOString()
    });
    showToast('Salida registrada: ' + formatTime(new Date().toISOString()), 'success');
    document.getElementById('last-clock-msg').textContent = 'Última salida: ' + formatDateTime(new Date().toISOString());
  } else {
    // Clock in
    records.push({
      id: generateId(),
      empleadoId: session.id,
      tipo: 'in',
      timestamp: new Date().toISOString()
    });
    showToast('Entrada registrada: ' + formatTime(new Date().toISOString()), 'success');
    document.getElementById('last-clock-msg').textContent = 'Última entrada: ' + formatDateTime(new Date().toISOString());
  }
  
  saveData(STORAGE_KEYS.clockRecords, records);
  renderReloj();
}

function renderReloj() {
  const session = getData(STORAGE_KEYS.currentSession);
  if (!session) return;
  
  const records = getData(STORAGE_KEYS.clockRecords);
  const empRecords = records.filter(r => r.empleadoId === session.id);
  const todayRecords = empRecords.filter(r => isToday(r.timestamp)).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const weekRecords = empRecords.filter(r => isThisWeek(r.timestamp)).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Clock status
  const clockedIn = isCurrentlyClockedIn(session.id);
  const statusArea = document.getElementById('clock-status-area');
  statusArea.innerHTML = clockedIn
    ? `<span class="clock-status status-in"><span class="clock-dot"></span> TRABAJANDO ACTUALMENTE</span>`
    : `<span class="clock-status status-out"><span class="clock-dot"></span> FUERA DE LA OFICINA</span>`;
  
  // Clock button
  const btn = document.getElementById('clock-btn');
  if (clockedIn) {
    btn.className = 'btn btn-clock-out';
    btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> SALIR';
  } else {
    btn.className = 'btn btn-clock-in';
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ENTRAR';
  }
  
  // Today records table
  const todayTable = document.getElementById('today-records-table');
  document.getElementById('today-total').textContent = todayRecords.length + ' registros';
  if (todayRecords.length === 0) {
    todayTable.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No hay registros hoy</p></div>';
  } else {
    todayTable.innerHTML = `
      <table>
        <thead><tr><th>Tipo</th><th>Hora</th><th>Fecha</th></tr></thead>
        <tbody>
          ${todayRecords.map(r => `
            <tr>
              <td><span class="badge ${r.tipo === 'in' ? 'badge-completada' : 'badge-pendiente'}">${r.tipo === 'in' ? 'ENTRADA' : 'SALIDA'}</span></td>
              <td><strong>${formatTime(r.timestamp)}</strong></td>
              <td>${formatDate(r.timestamp)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  // Weekly hours
  const weekHours = calculateHours(weekRecords);
  document.getElementById('week-total-hours').textContent = weekHours;
  
  // Weekly table
  const weekTable = document.getElementById('week-records-table');
  if (weekRecords.length === 0) {
    weekTable.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No hay registros esta semana</p></div>';
  } else {
    // Group by day
    const dayMap = {};
    weekRecords.forEach(r => {
      const dayKey = new Date(r.timestamp).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
      if (!dayMap[dayKey]) dayMap[dayKey] = [];
      dayMap[dayKey].push(r);
    });
    
    const dayRows = Object.entries(dayMap).map(([day, recs]) => {
      const dayIn = recs.find(r => r.tipo === 'in');
      const dayOut = recs.find(r => r.tipo === 'out');
      let dayHours = '-';
      if (dayIn && dayOut) {
        const h = ((new Date(dayOut.timestamp) - new Date(dayIn.timestamp)) / (1000 * 60 * 60)).toFixed(1);
        dayHours = h + 'h';
      }
      return `<tr><td>${day}</td><td>${dayIn ? formatTime(dayIn.timestamp) : '-'}</td><td>${dayOut ? formatTime(dayOut.timestamp) : '-'}</td><td><strong>${dayHours}</strong></td></tr>`;
    }).join('');
    
    weekTable.innerHTML = `
      <table>
        <thead><tr><th>Día</th><th>Entrada</th><th>Salida</th><th>Horas</th></tr></thead>
        <tbody>${dayRows}</tbody>
      </table>
    `;
  }
  
  // Last clock message
  const lastMsg = document.getElementById('last-clock-msg');
  if (todayRecords.length > 0) {
    const last = todayRecords[0];
    lastMsg.textContent = `Último registro: ${last.tipo === 'in' ? 'Entrada' : 'Salida'} a ${formatTime(last.timestamp)}`;
  }
  
  startClock();
}

// ========================== TASKS ==========================
function renderTasks() {
  const session = getData(STORAGE_KEYS.currentSession);
  if (!session) return;
  
  const empleados = getData(STORAGE_KEYS.empleados);
  const tareas = getData(STORAGE_KEYS.tareas);
  
  // Populate filter dropdowns
  const filterEmp = document.getElementById('filter-emp');
  const currentFilter = filterEmp.value;
  filterEmp.innerHTML = '<option value="">Todos los empleados</option>' +
    empleados.filter(e => e.rol !== 'admin').map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  filterEmp.value = currentFilter;
  
  // Filter
  let filtered = tareas;
  const filterEmpVal = filterEmp.value;
  const filterPrioridad = document.getElementById('filter-priority').value;
  const filterStatus = document.getElementById('filter-status').value;
  
  if (filterEmpVal) filtered = filtered.filter(t => t.asignadoA === filterEmpVal);
  if (filterPrioridad) filtered = filtered.filter(t => t.prioridad === filterPrioridad);
  if (filterStatus) filtered = filtered.filter(t => t.estado === filterStatus);
  
  // Admins see all, employees see only theirs
  if (session.rol !== 'admin' && session.username !== 'admin') {
    filtered = filtered.filter(t => t.asignadoA === session.id);
  }
  
  // Sort: pending first, then by date
  filtered.sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1;
    return new Date(a.fechaLimite) - new Date(b.fechaLimite);
  });
  
  document.getElementById('task-count').textContent = filtered.length + ' tareas';
  
  const listEl = document.getElementById('task-list');
  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No hay tareas que mostrar</p></div>';
    return;
  }
  
  listEl.innerHTML = filtered.map(t => {
    const overdue = t.estado === 'pendiente' && isOverdue(t.fechaLimite);
    return `
      <div class="task-item ${overdue ? 'row-overdue' : ''}">
        <input type="checkbox" class="task-checkbox" 
          ${t.estado === 'completada' ? 'checked' : ''} 
          onchange="toggleTask('${t.id}')"
          title="Marcar como ${t.estado === 'completada' ? 'pendiente' : 'completada'}">
        <div class="task-main">
          <div class="task-title ${t.estado === 'completada' ? 'completed' : ''}">${t.titulo}</div>
          ${t.descripcion ? `<div class="task-desc">${t.descripcion}</div>` : ''}
          <div class="task-meta">
            <span><span class="badge badge-${t.prioridad}">${t.prioridad.toUpperCase()}</span></span>
            <span><i class="fas fa-user"></i> ${getEmployeeName(t.asignadoA)}</span>
            <span><i class="fas fa-calendar"></i> ${formatDate(t.fechaLimite)}</span>
            <span><span class="badge badge-${t.estado}">${t.estado.toUpperCase()}</span></span>
            ${overdue ? '<span style="color:var(--danger);font-weight:700;"><i class="fas fa-exclamation-triangle"></i> ATRASADA</span>' : ''}
          </div>
        </div>
        <div class="flex gap-1">
          ${session.rol === 'admin' ? `
            <button class="btn btn-outline btn-sm" onclick="editTask('${t.id}')" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm" onclick="deleteTask('${t.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // Populate assignee dropdown in modal
  const taskAsignado = document.getElementById('task-asignado');
  taskAsignado.innerHTML = empleados.filter(e => e.rol !== 'admin').map(e => 
    `<option value="${e.id}">${e.nombre}</option>`
  ).join('');
}

function toggleTask(id) {
  const tareas = getData(STORAGE_KEYS.tareas);
  const task = tareas.find(t => t.id === id);
  if (task) {
    task.estado = task.estado === 'pendiente' ? 'completada' : 'pendiente';
    saveData(STORAGE_KEYS.tareas, tareas);
    renderTasks();
    showToast(task.estado === 'completada' ? 'Tarea completada!' : 'Tarea reabierta', task.estado === 'completada' ? 'success' : 'warning');
  }
}

function deleteTask(id) {
  if (!confirm('¿Eliminar esta tarea permanentemente?')) return;
  let tareas = getData(STORAGE_KEYS.tareas);
  tareas = tareas.filter(t => t.id !== id);
  saveData(STORAGE_KEYS.tareas, tareas);
  renderTasks();
  showToast('Tarea eliminada', 'danger');
}

function openTaskModal(editId = null) {
  const modal = document.getElementById('task-modal');
  const form = document.getElementById('task-form');
  form.reset();
  
  // Populate assignee dropdown
  const empleados = getData(STORAGE_KEYS.empleados);
  const taskAsignado = document.getElementById('task-asignado');
  taskAsignado.innerHTML = empleados.filter(e => e.rol !== 'admin').map(e =>
    `<option value="${e.id}">${e.nombre}</option>`
  ).join('');
  
  if (editId) {
    const tareas = getData(STORAGE_KEYS.tareas);
    const task = tareas.find(t => t.id === editId);
    if (task) {
      document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Tarea';
      document.getElementById('task-edit-id').value = task.id;
      document.getElementById('task-titulo').value = task.titulo;
      document.getElementById('task-descripcion').value = task.descripcion || '';
      document.getElementById('task-prioridad').value = task.prioridad;
      document.getElementById('task-fecha').value = task.fechaLimite;
      document.getElementById('task-asignado').value = task.asignadoA;
    }
  } else {
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Tarea';
    document.getElementById('task-edit-id').value = '';
    document.getElementById('task-fecha').value = new Date().toISOString().split('T')[0];
  }
  
  modal.classList.add('active');
}

function closeTaskModal() {
  document.getElementById('task-modal').classList.remove('active');
}

function editTask(id) {
  openTaskModal(id);
}

function saveTask() {
  const titulo = document.getElementById('task-titulo').value.trim();
  const descripcion = document.getElementById('task-descripcion').value.trim();
  const prioridad = document.getElementById('task-prioridad').value;
  const fechaLimite = document.getElementById('task-fecha').value;
  const asignadoA = document.getElementById('task-asignado').value;
  const editId = document.getElementById('task-edit-id').value;
  
  if (!titulo || !fechaLimite || !asignadoA) {
    showToast('Completa los campos obligatorios', 'warning');
    return;
  }
  
  const tareas = getData(STORAGE_KEYS.tareas);
  
  if (editId) {
    const task = tareas.find(t => t.id === editId);
    if (task) {
      task.titulo = titulo;
      task.descripcion = descripcion;
      task.prioridad = prioridad;
      task.fechaLimite = fechaLimite;
      task.asignadoA = asignadoA;
      showToast('Tarea actualizada', 'success');
    }
  } else {
    tareas.push({
      id: generateId(),
      titulo,
      descripcion,
      prioridad,
      fechaLimite,
      asignadoA,
      estado: 'pendiente',
      createdAt: new Date().toISOString()
    });
    showToast('Tarea creada exitosamente', 'success');
  }
  
  saveData(STORAGE_KEYS.tareas, tareas);
  closeTaskModal();
  renderTasks();
}

// ========================== DASHBOARD ==========================
function renderDashboard() {
  const session = getData(STORAGE_KEYS.currentSession);
  const empleados = getData(STORAGE_KEYS.empleados);
  const clockRecords = getData(STORAGE_KEYS.clockRecords);
  const tareas = getData(STORAGE_KEYS.tareas);
  
  // --- METRICS ---
  const todayRecords = clockRecords.filter(r => isToday(r.timestamp));
  const weekRecords = clockRecords.filter(r => isThisWeek(r.timestamp));
  
  // Total hours this week (all employees or specific)
  let totalWeekHours = '0.0';
  if (session.rol === 'admin') {
    totalWeekHours = calculateHours(weekRecords);
  } else {
    const myWeekRecords = weekRecords.filter(r => r.empleadoId === session.id);
    totalWeekHours = calculateHours(myWeekRecords);
  }
  
  const pendingTasks = session.rol === 'admin'
    ? tareas.filter(t => t.estado === 'pendiente')
    : tareas.filter(t => t.estado === 'pendiente' && t.asignadoA === session.id);
  
  const completedTasks = session.rol === 'admin'
    ? tareas.filter(t => t.estado === 'completada')
    : tareas.filter(t => t.estado === 'completada' && t.asignadoA === session.id);
  
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.fechaLimite));
  
  const metricsEl = document.getElementById('dash-metrics');
  metricsEl.innerHTML = `
    <div class="metric-card">
      <div class="metric-icon"><i class="fas fa-clock"></i></div>
      <div class="metric-value">${totalWeekHours}h</div>
      <div class="metric-label">Horas esta semana</div>
    </div>
    <div class="metric-card">
      <div class="metric-icon"><i class="fas fa-check-circle"></i></div>
      <div class="metric-value">${completedTasks.length}</div>
      <div class="metric-label">Tareas completadas</div>
    </div>
    <div class="metric-card">
      <div class="metric-icon"><i class="fas fa-hourglass-half"></i></div>
      <div class="metric-value">${pendingTasks.length}</div>
      <div class="metric-label">Tareas pendientes</div>
    </div>
    ${overdueTasks.length > 0 ? `
    <div class="metric-card" style="border-left-color:var(--danger);">
      <div class="metric-icon" style="color:var(--danger);"><i class="fas fa-exclamation-triangle"></i></div>
      <div class="metric-value" style="color:var(--danger);">${overdueTasks.length}</div>
      <div class="metric-label">Tareas atrasadas</div>
    </div>` : ''}
  `;
  
  // --- TODAY RECORDS ---
  const todayArea = document.getElementById('dash-today-records');
  const recentRecords = todayRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
  
  if (recentRecords.length === 0) {
    todayArea.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No hay registros hoy</p></div>';
  } else {
    todayArea.innerHTML = recentRecords.map(r => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
        <span class="badge ${r.tipo === 'in' ? 'badge-completada' : 'badge-pendiente'}" style="min-width:70px;text-align:center;">${r.tipo === 'in' ? 'ENTRADA' : 'SALIDA'}</span>
        <strong style="min-width:80px;">${formatTime(r.timestamp)}</strong>
        <span class="text-muted">${getEmployeeName(r.empleadoId)}</span>
      </div>
    `).join('');
  }
  
  // --- UPCOMING TASKS ---
  const upArea = document.getElementById('dash-upcoming-tasks');
  let upcoming = tareas.filter(t => t.estado === 'pendiente' && isNext3Days(t.fechaLimite));
  if (session.rol !== 'admin') {
    upcoming = upcoming.filter(t => t.asignadoA === session.id);
  }
  upcoming.sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
  
  if (upcoming.length === 0) {
    upArea.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No hay tareas en los próximos 3 días</p></div>';
  } else {
    upArea.innerHTML = upcoming.map(t => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
        <span class="badge badge-${t.prioridad}">${t.prioridad.toUpperCase()}</span>
        <span style="flex:1;font-weight:600;">${t.titulo}</span>
        <span class="text-muted" style="font-size:0.82rem;">${formatDate(t.fechaLimite)}</span>
      </div>
    `).join('');
  }
  
  // --- WEEKLY CHART PER EMPLOYEE ---
  const chartArea = document.getElementById('dash-weekly-chart');
  const allEmp = empleados.filter(e => e.rol !== 'admin');
  
  const empHours = allEmp.map(emp => {
    const empWeekRec = weekRecords.filter(r => r.empleadoId === emp.id);
    const hrs = calculateHours(empWeekRec);
    return { ...emp, hours: parseFloat(hrs) };
  }).filter(e => e.hours > 0).sort((a, b) => b.hours - a.hours);
  
  if (empHours.length === 0) {
    chartArea.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No hay datos de horas esta semana</p></div>';
  } else {
    const maxH = Math.max(...empHours.map(e => e.hours));
    chartArea.innerHTML = empHours.map(e => `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
        <div style="width:130px;font-weight:600;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.nombre}</div>
        <div style="flex:1;background:var(--border);border-radius:12px;height:28px;position:relative;overflow:hidden;">
          <div style="background:linear-gradient(90deg,var(--primary),var(--gold));height:100%;border-radius:12px;width:${(e.hours / maxH) * 100}%;transition:width 0.5s;min-width:20px;"></div>
          <span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-weight:700;font-size:0.82rem;color:var(--primary);">${e.hours.toFixed(1)}h</span>
        </div>
      </div>
    `).join('');
  }
}

// ========================== ADMIN PANEL ==========================
function renderAdmin() {
  const session = getData(STORAGE_KEYS.currentSession);
  if (session.rol !== 'admin') {
    showToast('Acceso denegado', 'danger');
    return;
  }
  
  const empleados = getData(STORAGE_KEYS.empleados);
  const clockRecords = getData(STORAGE_KEYS.clockRecords);
  const tareas = getData(STORAGE_KEYS.tareas);
  
  const weekRecords = clockRecords.filter(r => isThisWeek(r.timestamp));
  
  // --- Weekly hours per employee ---
  const empHours = empleados.filter(e => e.rol !== 'admin').map(emp => {
    const empWeekRec = weekRecords.filter(r => r.empleadoId === emp.id);
    const hrs = calculateHours(empWeekRec);
    return { ...emp, hours: parseFloat(hrs) };
  }).filter(e => e.hours > 0);
  
  const adminWeekly = document.getElementById('admin-weekly-hours');
  if (empHours.length === 0) {
    adminWeekly.innerHTML = '<div class="empty-state"><p>No hay registros esta semana</p></div>';
  } else {
    adminWeekly.innerHTML = empHours.map(e => `
      <div class="employee-hours">
        <span class="eh-name">${e.nombre}</span>
        <span class="eh-hours">${e.hours.toFixed(1)} hrs</span>
      </div>
    `).join('');
  }
  
  // --- Recent activity (admin sees all) ---
  const allToday = clockRecords.filter(r => isToday(r.timestamp)).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);
  const adminActivity = document.getElementById('admin-recent-activity');
  if (allToday.length === 0) {
    adminActivity.innerHTML = '<div class="empty-state"><p>No hay actividad hoy</p></div>';
  } else {
    adminActivity.innerHTML = allToday.map(r => `
      <div class="employee-hours">
        <span class="eh-name">${getEmployeeName(r.empleadoId)}</span>
        <span class="badge ${r.tipo === 'in' ? 'badge-completada' : 'badge-pendiente'}">${r.tipo === 'in' ? '▼' : '▲'} ${formatTime(r.timestamp)}</span>
      </div>
    `).join('');
  }
  
  // --- Pending tasks ---
  const pendingTasks = tareas.filter(t => t.estado === 'pendiente');
  const adminPending = document.getElementById('admin-pending-tasks');
  if (pendingTasks.length === 0) {
    adminPending.innerHTML = '<div class="empty-state"><p>¡Todas las tareas completadas!</p></div>';
  } else {
    adminPending.innerHTML = pendingTasks.map(t => `
      <div class="task-item ${isOverdue(t.fechaLimite) ? 'row-overdue' : ''}">
        <input type="checkbox" class="task-checkbox" onchange="toggleTask('${t.id}');renderAdmin();">
        <div class="task-main">
          <div class="task-title">${t.titulo}</div>
          <div class="task-meta">
            <span><span class="badge badge-${t.prioridad}">${t.prioridad.toUpperCase()}</span></span>
            <span><i class="fas fa-user"></i> ${getEmployeeName(t.asignadoA)}</span>
            <span><i class="fas fa-calendar"></i> ${formatDate(t.fechaLimite)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // --- Overdue tasks ---
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.fechaLimite));
  const adminOverdue = document.getElementById('admin-overdue-tasks');
  if (overdueTasks.length === 0) {
    adminOverdue.innerHTML = '<div class="empty-state"><p><i class="fas fa-check-circle" style="color:var(--success);"></i> Sin tareas atrasadas</p></div>';
  } else {
    adminOverdue.innerHTML = overdueTasks.map(t => `
      <div class="task-item row-overdue">
        <div class="task-main">
          <div class="task-title" style="color:var(--danger);"><i class="fas fa-exclamation-triangle"></i> ${t.titulo}</div>
          <div class="task-meta">
            <span><span class="badge badge-${t.prioridad}">${t.prioridad.toUpperCase()}</span></span>
            <span><i class="fas fa-user"></i> ${getEmployeeName(t.asignadoA)}</span>
            <span style="color:var(--danger);">Vence: ${formatDate(t.fechaLimite)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // --- Full clock records ---
  const adminClockTable = document.getElementById('admin-all-clock-records');
  const sorted = [...clockRecords].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
  
  if (sorted.length === 0) {
    adminClockTable.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><p>No hay registros</p></div>';
  } else {
    adminClockTable.innerHTML = `
      <table>
        <thead>
          <tr><th>Empleado</th><th>Tipo</th><th>Fecha</th><th>Hora</th></tr>
        </thead>
        <tbody>
          ${sorted.map(r => `
            <tr>
              <td>${getEmployeeName(r.empleadoId)}</td>
              <td><span class="badge ${r.tipo === 'in' ? 'badge-completada' : 'badge-pendiente'}">${r.tipo === 'in' ? 'ENTRADA' : 'SALIDA'}</span></td>
              <td>${formatDate(r.timestamp)}</td>
              <td>${formatTime(r.timestamp)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

// ========================== CSV EXPORT ==========================
function downloadCSV(csvContent, filename) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Archivo CSV descargado: ' + filename, 'success');
}

function exportClockCSV() {
  const records = getData(STORAGE_KEYS.clockRecords);
  const empleados = getData(STORAGE_KEYS.empleados);
  
  if (records.length === 0) {
    showToast('No hay registros para exportar', 'warning');
    return;
  }
  
  let csv = 'Empleado,Tipo,Fecha,Hora,ISO Timestamp\n';
  records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(r => {
    const emp = empleados.find(e => e.id === r.empleadoId);
    const name = emp ? emp.nombre : 'Desconocido';
    const d = new Date(r.timestamp);
    csv += `"${name}","${r.tipo === 'in' ? 'Entrada' : 'Salida'}","${formatDate(r.timestamp)}","${formatTime(r.timestamp)}","${r.timestamp}"\n`;
  });
  
  downloadCSV(csv, `inma_reloj_${new Date().toISOString().split('T')[0]}.csv`);
}

function exportTasksCSV() {
  const tareas = getData(STORAGE_KEYS.tareas);
  
  if (tareas.length === 0) {
    showToast('No hay tareas para exportar', 'warning');
    return;
  }
  
  let csv = 'Título,Descripción,Prioridad,Fecha Límite,Asignado A,Estado,Creado\n';
  tareas.forEach(t => {
    csv += `"${t.titulo}","${t.descripcion || ''}","${t.prioridad}","${t.fechaLimite}","${getEmployeeName(t.asignadoA)}","${t.estado}","${t.createdAt}"\n`;
  });
  
  downloadCSV(csv, `inma_tareas_${new Date().toISOString().split('T')[0]}.csv`);
}

// ========================== INIT ==========================
document.addEventListener('DOMContentLoaded', function () {
  // Initialize sample data
  initSampleData();
  
  // Login handler
  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    
    if (login(username, password)) {
      checkSession();
    } else {
      showToast('Usuario o contraseña incorrectos', 'danger');
    }
  });
  
  // Check session on load
  checkSession();
});
