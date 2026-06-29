import { cargarPantallaLogin } from './auth/login.ts';
import './style.css';
import { cargarHomeStore } from './pages/store/homeStore.ts';
import { cargarAdminDashboard } from './pages/admin/adminHome.ts';
import { cargarHistorialPedidosCliente } from './pages/client/orders/orders.ts';

interface UsuarioSesion {
  id: number;
  nombre: string;
  rol: 'USUARIO' | 'ADMIN';
}

// Arranca en null originalmente
export let usuarioLogueado: UsuarioSesion | null = null;

export function renderizarApp() {
  // 1. CORREGIDO: Cada vez que se renderice la app, actualizamos la variable leyendo el disco fresco
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario_sesion') || 'null');

  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // Si no hay nadie logueado, delegamos al módulo auth y cortamos acá.
  if (!usuarioLogueado) {
    cargarPantallaLogin(); 
    return; 
  }

  // Si hay sesión válida, inyectamos la Navbar estructural
  app.innerHTML = `
    <nav class="navbar-global">
      <div class="nav-info">
        <span>👤 Sesión: <strong>${usuarioLogueado.nombre}</strong> (${usuarioLogueado.rol})</span>
      </div>      
  <div class="nav-links">
    ${usuarioLogueado.rol === 'ADMIN' ? '<button id="btn-nav-admin" class="btn-sesion">📊 Panel Admin</button>' : ''}
    <button id="btn-nav-orders" class="btn-sesion" style="background-color: #6f42c1;">📋 Mis Pedidos</button> <!-- 👈 AGREGADO -->
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

  document.getElementById('btn-nav-orders')?.addEventListener('click', () => {
    cargarHistorialPedidosCliente();
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