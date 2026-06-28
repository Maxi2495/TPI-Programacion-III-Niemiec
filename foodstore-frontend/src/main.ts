import './style.css';
import { cargarHomeStore } from './pages/store/homeStore.ts';
import { cargarAdminDashboard } from './pages/admin/adminHome.ts';
interface UsuarioSesion {
  id: number;
  nombre: string;
  rol: 'USUARIO' | 'ADMIN';
}

export let usuarioLogueado: UsuarioSesion | null = JSON.parse(localStorage.getItem('usuario_sesion') || 'null');

export function renderizarApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  if (!usuarioLogueado) {
    app.innerHTML = `
      <div class="auth-container">
        <h2>🔐 Iniciar Sesión - Food Store</h2>
        <form id="form-login" class="form-auth">
          <label>Seleccionar Usuario para Simular Entrada:</label>
          <select id="login-select" class="select-pago" style="margin-bottom: 15px; width: 100%;">
            <option value="cliente">👤 Juan Perez (Rol: USUARIO)</option>
            <option value="admin">👑 Ana Martinez (Rol: ADMIN)</option>
          </select>
          <button type="submit" class="btn-confirmar">Ingresar al Sistema</button>
        </form>
      </div>
    `;

    document.getElementById('form-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const seleccion = (document.getElementById('login-select') as HTMLSelectElement).value;

      if (seleccion === 'admin') {
        usuarioLogueado = { id: 1, nombre: "Ana Martinez", rol: "ADMIN" };
      } else {
        // 👇 CORREGIDO: Cambiado de 'name' a 'nombre' para respetar tu interfaz
        usuarioLogueado = { id: 2, nombre: "Juan Perez", rol: "USUARIO" };
      }

      localStorage.setItem('usuario_sesion', JSON.stringify(usuarioLogueado));
      renderizarApp();
    });
    return;
  }

  app.innerHTML = `
    <nav class="navbar-global">
      <div class="nav-info">
        <span>👤 Sesión: <strong>${usuarioLogueado.nombre}</strong> (${usuarioLogueado.rol})</span>
      </div>
      <div class="nav-links">
        ${usuarioLogueado.rol === 'ADMIN' ? '<button id="btn-nav-admin" class="btn-sesion">📊 Panel Admin</button>' : ''}
        <button id="btn-nav-store" class="btn-sesion">🍔 Tienda Store</button>
        <button id="btn-logout" class="btn-sesion" style="background-color: #dc3545;">🚪 Cerrar Sesión</button>
      </div>
    </nav>
    <div id="contenido-pagina"></div>
  `;

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('usuario_sesion');
    usuarioLogueado = null;
    renderizarApp();
  });

  document.getElementById('btn-nav-store')?.addEventListener('click', () => {
    cargarHomeStore();
  });

  document.getElementById('btn-nav-admin')?.addEventListener('click', () => {
    cargarAdminDashboard();
  });

  document.getElementById('btn-nav-admin')?.addEventListener('click', () => {
    cargarAdminDashboard();
  });

  cargarPaginaPorDefecto();
}

function cargarPaginaPorDefecto() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  if (usuarioLogueado?.rol === 'ADMIN') {
    cargarAdminDashboard();
  } else {
    cargarHomeStore(); 
  }
}



renderizarApp();