let pedidosAdminGlobal: any[] = [];

export async function cargarGestionPedidosAdmin() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Recuperando el historial global de órdenes...</div>`;

  try {
    // 1. GET para traer la totalidad de los pedidos guardados en H2
    const respuesta = await fetch('http://localhost:8080/api/orders');
    pedidosAdminGlobal = await respuesta.json();
    renderizarMonitorPedidos(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error al conectar con el monitor de órdenes.</p>`;
  }
}

function renderizarMonitorPedidos(contenedor: HTMLElement) {
  let html = `
    <div class="admin-orders-container">
      <h2>📋 Monitor de Auditoría y Control de Pedidos</h2>
      <p style="color: #6c757d; font-style: italic; margin-bottom: 25px;">Haga clic en el botón de inspección (👁️) de cualquier orden para gestionar su estado transaccional.</p>

      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th>ID Pedido</th>
            <th>Cliente</th>
            <th>Estado Actual</th>
            <th>Total Facturado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
  `;

  pedidosAdminGlobal.forEach(p => {
    html += `
      <tr>
        <td><strong># ${p.id}</strong></td>
        <td>${p.clienteNombre}</td>
        <td>
          <span class="badge-estado ${p.estado.toLowerCase()}">${p.estado}</span>
        </td>
        <td><strong>$ ${p.total}</strong></td>
        <td>
          <button class="btn-sesion" style="background-color:#17a2b8; padding:4px 10px;" id="btn-ver-pedido-${p.id}">👁️ Ver Detalle</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>

    <div id="modal-pedido-admin" class="modal">
      <div class="modal-contenido" style="max-width: 500px;">
        <span id="btn-cerrar-modal-pedido" class="cerrar-modal">&times;</span>
        <h3>🔍 Desglose Técnico del Pedido</h3>
        <div id="cuerpo-modal-pedido-admin" style="margin-top:15px; line-height:1.6;"></div>
      </div>
    </div>
  `;

  contenedor.innerHTML = html;
  configurarEventosMonitor();
}

function configurarEventosMonitor() {
  // Enganchamos dinámicamente el botón de inspección de cada fila
  pedidosAdminGlobal.forEach(p => {
    document.getElementById(`btn-ver-pedido-${p.id}`)?.addEventListener('click', () => {
      mostrarModalPedidoAdmin(p);
    });
  });

  document.getElementById('btn-cerrar-modal-pedido')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-pedido-admin');
    if (modal) modal.style.display = 'none';
  });
}

function mostrarModalPedidoAdmin(pedido: any) {
  const modal = document.getElementById('modal-pedido-admin');
  const cuerpo = document.getElementById('cuerpo-modal-pedido-admin');
  if (!modal || !cuerpo) return;

  cuerpo.innerHTML = `
    <p><strong>Número de Control:</strong> # ${pedido.id}</p>
    <p><strong>Cliente Asociado:</strong> ${pedido.clienteNombre}</p>
    <p><strong>Importe Consolidado:</strong> $ ${pedido.total}</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
    
    <label style="font-weight:bold; display:block; margin-bottom:5px;">🔄 Cambiar Estado del Pedido:</label>
    <select id="select-nuevo-estado" class="select-pago" style="width:100%; margin-bottom:15px;">
      <option value="PENDIENTE" ${pedido.estado === 'PENDIENTE' ? 'selected' : ''}>⏳ PENDIENTE (En preparación)</option>
      <option value="TERMINADO" ${pedido.estado === 'TERMINADO' ? 'selected' : ''}>✅ TERMINADO (Cobrado y cerrado)</option>
    </select>

    <button id="btn-guardar-status-${pedido.id}" class="btn-confirmar" style="background-color:#6f42c1; width:100%;">
      ⚡ Actualizar Estado (PATCH)
    </button>
  `;

  modal.style.display = 'block';

  // Listener para disparar la modificación parcial hacia Spring Boot
  document.getElementById(`btn-guardar-status-${pedido.id}`)?.addEventListener('click', () => {
    const nuevoEstado = (document.getElementById('select-nuevo-estado') as HTMLSelectElement).value;
    ejecutarPatchEstadoBackend(pedido.id, nuevoEstado);
  });
}

async function ejecutarPatchEstadoBackend(id: number, estado: string) {
  try {
    // CORREGIDO: Mapeo limpio del endpoint PATCH de Spring Boot
    const url = `http://localhost:8080/api/orders/${id}/status?nuevoEstado=${estado}`;
    
    const respuesta = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (respuesta.ok) {
      alert("🎉 ¡Estado modificado con éxito! El parche parcial impactó en la base de datos H2.");
      const modal = document.getElementById('modal-pedido-admin');
      if (modal) modal.style.display = 'none';
      cargarGestionPedidosAdmin(); // Recargamos el monitor de control
    } else {
      const statusText = await respuesta.text();
      alert(`❌ Error en el servidor al intentar parchar el estado: ${statusText}`);
    }
  } catch (error) {
    console.error("Error capturado en la red:", error);
    alert("❌ Error de red al conectar con el endpoint PATCH. Verifique la consola F12.");
  }
}