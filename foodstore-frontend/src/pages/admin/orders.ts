import { cargarAdminDashboard } from './adminHome.ts';

let listaPedidosGlobal: any[] = [];
let filtroEstadoActual: string = 'TODOS';

export async function cargarGestionPedidosAdmin() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Recuperando el flujo global de órdenes...</div>`;

  try {
    //GET de orders
    const respuesta = await fetch('http://localhost:8080/api/orders');
    const datosPedidos = await respuesta.json();

    //orden cronologico
    listaPedidosGlobal = datosPedidos.sort((a: any, b: any) => Number(b.id) - Number(a.id));

    renderizarPanelPedidosAdmin(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">No se pudo sincronizar el monitor de órdenes de cocina.</p>`;
  }
}

function renderizarPanelPedidosAdmin(contenedor: HTMLElement) {
  const pedidosFiltrados = listaPedidosGlobal.filter(p => {
    if (filtroEstadoActual === 'TODOS') return true;
    return p.estado.toUpperCase() === filtroEstadoActual;
  });

  contenedor.innerHTML = `
    <div class="admin-dashboard-container" style="max-width: 1100px; padding: 20px; box-sizing: border-box;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2>📋 Monitor de Auditoría y Control de Pedidos</h2>
          <p style="color: #6c757d; margin: 0; font-style: italic;">Haga clic sobre cualquier tarjeta para inspeccionar los datos de entrega y actualizar el estado operativo.</p>
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="font-weight: bold; font-size: 0.9rem; color: #495057;">Filtrar Estado:</label>
          <select id="select-filtro-estado-admin" class="select-pago" style="margin: 0; padding: 6px 12px; width: 190px;">
            <option value="TODOS" ${filtroEstadoActual === 'TODOS' ? 'selected' : ''}>📋 Ver Todos</option>
            <option value="PENDIENTE" ${filtroEstadoActual === 'PENDIENTE' ? 'selected' : ''}>⏳ Pendientes</option>
            <option value="CONFIRMADO" ${filtroEstadoActual === 'CONFIRMADO' ? 'selected' : ''}>👨‍🍳 En Preparación</option>
            <option value="TERMINADO" ${filtroEstadoActual === 'TERMINADO' ? 'selected' : ''}>✅ Entregados</option>
            <option value="CANCELADO" ${filtroEstadoActual === 'CANCELADO' ? 'selected' : ''}>❌ Cancelados</option>
          </select>
        </div>
      </div>

      <button id="btn-pedidos-volver-dash" class="btn-sesion" style="margin-bottom: 25px; background-color: #6c757d;">
        🔙 Volver al Dashboard
      </button>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; width: 100%; box-sizing: border-box;">
        ${pedidosFiltrados.map(pedido => {
          const estadoLimpio = pedido.estado.toUpperCase();
          let claseBadge = "pendiente";
          let textoVisual = "Pendiente";

          if (estadoLimpio === 'CONFIRMADO') { claseBadge = "confirmado"; textoVisual = "En Preparación"; }
          if (estadoLimpio === 'TERMINADO') { claseBadge = "terminado"; textoVisual = "Entregado"; }
          if (estadoLimpio === 'CANCELADO') { claseBadge = "pendiente"; textoVisual = "Cancelado"; }

          const cantVariedades = pedido.productosDetalle ? pedido.productosDetalle.length : 0;

          return `
            <div class="tarjeta-producto" id="card-pedido-admin-${pedido.id}" style="text-align: left; cursor: pointer; border: 1px solid #eef0f2; box-shadow: 0 4px 10px rgba(0,0,0,0.02); background: white; margin: 0; display: flex; flex-direction: column; justify-content: space-between; min-height: 190px; box-sizing: border-box;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f1f3f5; padding-bottom: 8px;">
                  <span style="font-weight: bold; color: #212529;">Orden # ${pedido.id}</span>
                  <span class="badge-estado ${claseBadge}">${textoVisual}</span>
                </div>
                <p style="margin: 4px 0; font-size: 0.9rem; color: #212529;">👤 <strong>Cliente:</strong> ${pedido.clienteNombre}</p>
                <p style="margin: 4px 0; font-size: 0.85rem; color: #6c757d;">📅 <strong>Registro:</strong> ${pedido.fechaHora || 'No disponible'}</p>
                <p style="margin: 4px 0; font-size: 0.85rem; color: #495057;">📦 <strong>Variedad:</strong> ${cantVariedades} item(s) seleccionado(s)</p>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #f1f3f5; padding-top: 10px;">
                <span style="font-size: 0.8rem; color:#6c757d;">Total Cobrado:</span>
                <span style="font-weight: bold; color: #28a745; font-size: 1.15rem;">$ ${pedido.total}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${pedidosFiltrados.length === 0 ? `
        <div style="text-align:center; padding:40px; background:#f8f9fa; border-radius:10px; color:#6c757d; border:1px dashed #dee2e6; margin-top:20px;">
          📭 No se registran órdenes con el estado seleccionado.
        </div>
      ` : ''}

    </div>

    <div id="modal-detalle-pedido-admin" class="modal">
      <div class="modal-contenido" style="max-width: 550px; margin: 5% auto;">
        <span class="cerrar-modal" id="btn-cerrar-modal-pedido-admin">&times;</span>
        <div id="body-modal-pedido-admin"></div>
      </div>
    </div>
  `;

  configurarEventosPedidosAdmin();
}

function configurarEventosPedidosAdmin() {
  document.getElementById('btn-pedidos-volver-dash')?.addEventListener('click', cargarAdminDashboard);

  const selectorFiltro = document.getElementById('select-filtro-estado-admin') as HTMLSelectElement;
  selectorFiltro?.addEventListener('change', () => {
    filtroEstadoActual = selectorFiltro.value;
    renderizarPanelPedidosAdmin(document.getElementById('contenido-pagina')!);
  });

  listaPedidosGlobal.forEach(pedido => {
    document.getElementById(`card-pedido-admin-${pedido.id}`)?.addEventListener('click', () => {
      abrirModalDetallePedidoAdmin(pedido);
    });
  });

  document.getElementById('btn-cerrar-modal-pedido-admin')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-detalle-pedido-admin');
    if (modal) modal.style.display = 'none';
  });
}

function abrirModalDetallePedidoAdmin(pedido: any) {
  const modal = document.getElementById('modal-detalle-pedido-admin');
  const body = document.getElementById('body-modal-pedido-admin');
  if (!modal || !body) return;

  const listaProductos = pedido.productosDetalle || ["1x Menú General"];

  body.innerHTML = `
    <div style="border-bottom: 2px solid #f1f3f5; padding-bottom: 12px; margin-bottom: 15px;">
      <h3 style="margin: 0; color:#212529;">📋 Detalle Operativo - Orden # ${pedido.id}</h3>
      <span style="font-size: 0.85rem; color: #6c757d;">Fecha del Servidor: ${pedido.fechaHora}</span>
    </div>

    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e9ecef; font-size: 0.9rem; line-height: 1.5;">
      <strong>👤 Datos del Cliente:</strong> ${pedido.clienteNombre}<br>
      <strong>📱 Teléfono de Contacto:</strong> 351-3445566 (Validado Checkout)<br>
      <strong>📍 Dirección de Entrega:</strong> Retiro por Mostrador / Sucursal Córdoba Capital
    </div>

    <div style="display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.9rem;">
      <div style="flex:1; background:#fff; border:1px solid #eee; padding:10px; border-radius:6px;">
        <strong>💳 Método de Pago:</strong><br>
        <span class="badge-pago" style="margin-top:5px; display:inline-block; background-color:#e8f4fd; color:#0d47a1;">Efectivo en Caja</span>
      </div>
      <div style="flex:1; background:#fff; border:1px solid #eee; padding:10px; border-radius:6px;">
        <strong>📝 Notas de Cocina:</strong><br>
        <span style="color:#6c757d; font-style:italic;">Revisar términos de cocción.</span>
      </div>
    </div>

    <div style="margin-bottom: 15px;">
      <h4 style="margin: 0 0 8px 0; font-size: 0.9rem; color: #495057;">📦 Platos Solicitados:</h4>
      <div style="display: flex; flex-direction: column; gap: 6px; background: white; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
        ${listaProductos.map((prod: string) => `
          <div style="font-size: 0.9rem; color:#212529; border-bottom: 1px solid #f8f9fa; padding-bottom: 4px;">
            🔹 ${prod}
          </div>
        `).join('')}
      </div>
    </div>

    <div style="background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #eee; margin-bottom: 20px; font-size: 0.9rem;">
      <h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: #495057; border-bottom: 1px solid #eee; padding-bottom: 4px;">📊 Desglose de Costos</h4>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color:#6c757d;">
        <span>Subtotal Comercial Neto:</span>
        <span>$ ${pedido.total}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color:#6c757d;">
        <span>Tarifa de Entrega / Envío:</span>
        <span style="color:#28a745; font-weight:bold;">$ 0.00 (Bonificado)</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; border-top: 2px dashed #eee; padding-top: 8px; color:#212529; margin-top:5px;">
        <span>TOTAL FACTURADO:</span>
        <span style="color:#28a745;">$ ${pedido.total}</span>
      </div>
    </div>

    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border: 1px solid #bbeeef; display: flex; flex-direction: column; gap: 10px;">
      <label for="modal-cambiar-estado-select" style="font-weight: bold; font-size: 0.85rem; color: #0d47a1; margin: 0;">
        ⚡ GESTIÓN OPERATIVA DE SUCURSAL (Cambiar Estado):
      </label>
      
      <div style="display: flex; gap: 10px;">
        <select id="modal-cambiar-estado-select" class="select-pago" style="margin: 0; flex-grow: 1;">
          <option value="PENDIENTE" ${pedido.estado.toUpperCase() === 'PENDIENTE' ? 'selected' : ''}>⏳ Marcar como Pendiente</option>
          <option value="CONFIRMADO" ${pedido.estado.toUpperCase() === 'CONFIRMADO' ? 'selected' : ''}>👨‍🍳 Confirmar en Preparación</option>
          <option value="TERMINADO" ${pedido.estado.toUpperCase() === 'TERMINADO' ? 'selected' : ''}>✅ Registrar como Entregado</option>
          <option value="CANCELADO" ${pedido.estado.toUpperCase() === 'CANCELADO' ? 'selected' : ''}>❌ Cancelar Orden</option>
        </select>
        
        <button id="btn-submit-patch-status-${pedido.id}" class="btn-confirmar" style="margin: 0; padding: 0 20px; background-color: #007bff;">
          Actualizar
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'block';

  document.getElementById(`btn-submit-patch-status-${pedido.id}`)?.addEventListener('click', async () => {
    const nuevoEstado = (document.getElementById('modal-cambiar-estado-select') as HTMLSelectElement).value;
    await ejecutarPatchEstadoBackend(pedido.id, nuevoEstado);
  });
}

async function ejecutarPatchEstadoBackend(id: number, nuevoEstado: string) {
  try {
    const respuesta = await fetch(`http://localhost:8080/api/orders/${id}/status?nuevoEstado=${nuevoEstado}`, {
      method: 'PATCH'
    });

    if (respuesta.ok) {
      alert("El estado de la orden ha sido actualizado en la cocina con éxito.");
      
      const modal = document.getElementById('modal-detalle-pedido-admin');
      if (modal) modal.style.display = 'none';

      await cargarGestionPedidosAdmin();
    } else {
      const errorTxt = await respuesta.text();
      alert(`No se pudo modificar la orden: ${errorTxt}`);
    }
  } catch (error) {
    console.error(error);
    alert("Error de red al intentar impactar la actualización de estado.");
  }
}