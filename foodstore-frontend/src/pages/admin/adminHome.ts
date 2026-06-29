import { cargarGestionPedidosAdmin } from './orders.ts';
import { cargarGestionProductos } from './products.ts';
import { usuarioLogueado } from '../../main.ts';

export async function cargarAdminDashboard() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  //Validador segun el rol
  if (!usuarioLogueado || usuarioLogueado.rol !== 'ADMIN') {
    contenedor.innerHTML = `<p style="color:red; padding:20px; font-weight:bold;">⛔ Acceso Denegado: No tiene permisos de Administrador para ver esta sección.</p>`;
    return; 
  }

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Compilando métricas del servidor Spring Boot...</div>`;

  try {
    // 1. Consumimos las APIs de Java en paralelo para armar las tarjetas estadísticas
    const [resProductos, resPedidos] = await Promise.all([
      fetch('http://localhost:8080/api/products'),
      fetch('http://localhost:8080/api/orders')
    ]);

    const productos: any[] = await resProductos.json();
    const pedidos: any[] = await resPedidos.json();

    // 2. Procesamos las métricas en memoria usando lógica analítica (como pide el PDF)
    const totalProductos = productos.length;
    const productosDisponibles = productos.filter(p => p.stock > 0).length;
    const totalPedidos = pedidos.length;
    
    // Calculamos la recaudación filtrando solo los pedidos terminados
    const pedidosTerminados = pedidos.filter(p => p.estado === 'TERMINADO');
    const recaudacionTotal = pedidosTerminados.reduce((acc, p) => acc + p.total, 0);

    // Contamos pedidos por estado para el panel de resumen
    const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
    const terminados = pedidosTerminados.length;

    // 3. Renderizamos la interfaz con la estructura de tarjetas solicitada
    contenedor.innerHTML = `
      <div class="admin-dashboard-container">
        <h2>📊 Dashboard de Control Gerencial</h2>
        <p style="color: #6c757d; font-style: italic; margin-bottom: 25px;">Métricas consolidadas en tiempo real desde la base de datos H2</p>

        <div class="grid-tarjetas-admin">
          <div class="tarjeta-metrica azul">
            <h3>📦 Total Productos</h3>
            <p class="numero-metrica">${totalProductos}</p>
            <span>Ítems registrados</span>
          </div>
          <div class="tarjeta-metrica verde">
            <h3>⚡ Disponibles</h3>
            <p class="numero-metrica">${productosDisponibles}</p>
            <span>Con stock en cocina</span>
          </div>
          <div class="tarjeta-metrica violeta">
            <h3>📋 Total Pedidos</h3>
            <p class="numero-metrica">${totalPedidos}</p>
            <span>Órdenes históricas</span>
          </div>
          <div class="tarjeta-metrica oro">
            <h3>💵 Recaudación Real</h3>
            <p class="numero-metrica">$ ${recaudacionTotal.toFixed(2)}</p>
            <span>Pedidos terminados</span>
          </div>
        </div>

        <div class="panel-resumen-detallado">
          <h3>🔍 Resumen de Operaciones</h3>
          <div class="resumen-split">
            <div class="resumen-bloque">
              <h4>Estado de las Órdenes</h4>
              <ul>
                <li>⏳ Pedidos en preparación (PENDIENTES): <strong>${pendientes}</strong></li>
                <li>✅ Pedidos cobrados (TERMINADOS): <strong>${terminados}</strong></li>
              </ul>
            </div>
            <div class="resumen-bloque">
              <h4>Enlaces de Gestión Directa</h4>
              <p style="font-size:0.9rem; color:#6c757d;">Acceso modular del Administrador:</p>
              <div style="display:flex; gap:10px; margin-top:10px;">
                <button id="btn-dashboard-ir-productos" class="btn-admin" style="background-color:#17a2b8;">📦 Control de Stock</button>
                <button id="btn-dashboard-ir-pedidos" class="btn-admin" style="background-color:#6f42c1;">📋 Historial Global</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Acoplamos los eventos a los botones internos del Dashboard para navegar
    configurarEventosDashboard();

  } catch (error) {
    console.error("Error al compilar el Dashboard:", error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">❌ Error de comunicación con las APIs analíticas de Spring Boot.</p>`;
  }
}

function configurarEventosDashboard() {
  // 1. Evento para ir al control de stock de productos
  document.getElementById('btn-dashboard-ir-productos')?.addEventListener('click', () => { 
    cargarGestionProductos(); 
  });  

  // 2. CORREGIDO: Adentro de la función, el botón ya existe en el DOM y se engancha al módulo de órdenes
  document.getElementById('btn-dashboard-ir-pedidos')?.addEventListener('click', () => {
    cargarGestionPedidosAdmin();
  });
}




  




