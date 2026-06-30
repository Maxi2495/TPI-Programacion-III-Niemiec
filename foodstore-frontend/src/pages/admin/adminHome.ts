import { usuarioLogueado } from '../../main.ts';
import { cargarGestionProductos } from './products.ts';
import { cargarGestionPedidosAdmin } from './orders.ts';

export async function cargarAdminDashboard() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  // 🛡️ VALIDACIÓN DE SESIÓN Y ROL
  if (!usuarioLogueado || usuarioLogueado.rol !== 'ADMIN') {
    contenedor.innerHTML = `
      <div class="auth-container" style="max-width: 500px; padding: 30px;">
        <h2 style="color:#dc3545;">⛔ Acceso Denegado</h2>
        <p style="color:#6c757d;">No cuenta con permisos de administrador para inspeccionar esta sección protegida.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Consolidando métricas analíticas desde el servidor...</div>`;

  try {
    const [resProductos, resCategorias, resPedidos] = await Promise.all([
      fetch('http://localhost:8080/api/products'),
      fetch('http://localhost:8080/api/categories'),
      fetch('http://localhost:8080/api/orders')
    ]);

    const productos: any[] = await resProductos.json();
    const categorias: any[] = await resCategorias.json();
    const pedidos: any[] = await resPedidos.json();

    // 📊 1. PROCESAMIENTO OPERATIVO DE CATEGORÍAS
    const totalCategorias = categorias.length;
    // Filtro para las categorias activas
    const categoriasActivas = categorias.filter(c => c.eliminado !== true).length;
    const categoriasInactivas = totalCategorias - categoriasActivas;

    // 📦 2. PROCESAMIENTO OPERATIVO DE PRODUCTOS
    const totalProductos = productos.length;
    const productosDisponibles = productos.filter(p => p.stock > 0).length;
    const productosSinStock = totalProductos - productosDisponibles;

    // 📋 3. CONTEO ESTRICTO DE PEDIDOS POR ESTADO
    const totalPedidos = pedidos.length; 
    const pedidosPendientes = pedidos.filter(p => p.estado.toUpperCase() === 'PENDIENTE').length;
    const pedidosConfirmados = pedidos.filter(p => p.estado.toUpperCase() === 'CONFIRMADO').length;
    const pedidosTerminados = pedidos.filter(p => p.estado.toUpperCase() === 'TERMINADO').length;
    const pedidosCancelados = pedidos.filter(p => p.estado.toUpperCase() === 'CANCELADO').length;

    // Renderizado estructural del Dashboard
    contenedor.innerHTML = `
      <div class="admin-dashboard-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2>📊 Panel de Control Gerencial y Auditoría</h2>
            <p style="color: #6c757d; margin: 0; font-style: italic;">Métricas consolidadas del negocio en tiempo real desde la base de datos en memoria.</p>
          </div>
        </div>

        <div class="grid-tarjetas-admin">
          <div class="tarjeta-metrica violeta">
            <h3>📂 Total Categorías</h3>
            <div class="numero-metrica">${totalCategorias}</div>
            <p style="margin:0; font-size:0.85rem; color:#6c757d;">Grupos de menú activos</p>
          </div>
          <div class="tarjeta-metrica azul">
            <h3>📦 Total Productos</h3>
            <div class="numero-metrica">${totalProductos}</div>
            <p style="margin:0; font-size:0.85rem; color:#6c757d;">Ítems registrados en catálogo</p>
          </div>
          <div class="tarjeta-metrica oro">
            <h3>📋 Total Pedidos</h3>
            <div class="numero-metrica">${totalPedidos}</div>
            <p style="margin:0; font-size:0.85rem; color:#6c757d;">Órdenes globales históricas</p>
          </div>
          <div class="tarjeta-metrica verde">
            <h3>✅ Ítems Disponibles</h3>
            <div class="numero-metrica">${productosDisponibles}</div>
            <p style="margin:0; font-size:0.85rem; color:#6c757d;">Con unidades operativas en cocina</p>
          </div>
        </div>

        <div class="panel-resumen-detallado" style="margin-bottom: 30px;">
          <h3>🔍 Desglose Operativo del Establecimiento</h3>
          <div class="resumen-split">
            
            <div class="resumen-bloque">
              <h4>📋 Auditoría de Catálogo</h4>
              <ul style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 8px;">
                <li>📂 <strong>Categorías Activas:</strong> <span style="color:#28a745; font-weight:bold;">${categoriasActivas} </span> (${categoriasInactivas} inactivas).</li>
                <li>📦 <strong>Productos Activos (Disponibles):</strong> <span style="color:#28a745; font-weight:bold;">${productosDisponibles} ítems</span> con stock.</li>
                <li>⚠️ <strong>Productos Inactivos (Sin Stock):</strong> <span style="color:#dc3545; font-weight:bold;">${productosSinStock} ítems</span> a reponer.</li>
              </ul>
            </div>

            <div class="resumen-bloque">
              <h4>⚡ Pedidos por Estado</h4>
              <ul style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 6px;">
                <li>⏳ <strong>Pendientes de aprobación:</strong> ${pedidosPendientes} órdenes.</li>
                <li>👨‍🍳 <strong>En preparación (Confirmados):</strong> ${pedidosConfirmados} órdenes.</li>
                <li>🛵 <strong>Entregados (Terminados):</strong> <span style="color:#28a745; font-weight:bold;">${pedidosTerminados} órdenes finalizadas</span>.</li>
                <li>❌ <strong>Cancelados:</strong> ${pedidosCancelados} órdenes.</li>
              </ul>
            </div>

          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef0f2;">
          <h3 style="margin-top:0; margin-bottom:15px; font-size:1.1rem; color:#495057;">🛠️ Enlaces de Gestión Directa</h3>
          <div style="display:flex; gap:15px;">
            <button id="btn-link-modulo-productos" class="btn-admin" style="background-color: #17a2b8;">
              📦 Control de Stock e Inventario (ABM)
            </button>
            <button id="btn-link-modulo-pedidos" class="btn-admin" style="background-color: #6f42c1;">
              📋 Monitor de Auditoría Global de Pedidos
            </button>
          </div>
        </div>

      </div>
    `;

    configurarEventosDashboardEnlaces();
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error de red al consolidar las métricas de administración.</p>`;
  }
}

function configurarEventosDashboardEnlaces() {
  document.getElementById('btn-link-modulo-productos')?.addEventListener('click', () => { 
    cargarGestionProductos(); 
  });  

  document.getElementById('btn-link-modulo-pedidos')?.addEventListener('click', () => {
    cargarGestionPedidosAdmin();
  });
}