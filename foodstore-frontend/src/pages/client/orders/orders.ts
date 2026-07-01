import { cargarHomeStore } from '../../store/homeStore.ts';
import { usuarioLogueado } from '../../../main.ts';

let pedidosCliente: any[] = [];

export async function cargarHistorialPedidosCliente() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Sincronizando historial de pedidos...</div>`;

  try {
    
    const respuesta = await fetch('http://localhost:8080/api/orders');
    const todosLosPedidos = await respuesta.json();    
    if (!usuarioLogueado) return;
    const usuarioActual = usuarioLogueado;


    pedidosCliente = todosLosPedidos.filter((p: any) => p.clienteNombre === usuarioActual.nombre);

    renderizarInterfazHistorial(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">No se pudo recuperar el historial en este momento. Intente más tarde.</p>`;
  }
}

function renderizarInterfazHistorial(contenedor: HTMLElement) {
  if (pedidosCliente.length === 0) {
    contenedor.innerHTML = `
      <div class="auth-container" style="max-width: 500px; padding: 40px;">
        <h2>📋 Sin pedidos previos</h2>
        <p style="color: #6c757d; margin-bottom: 25px;">Todavía no realizaste ninguna compra en nuestra tienda.</p>
        <button id="btn-historial-vacio-tienda" class="btn-admin" style="width:100%; background-color:#007bff;">
          🍔 Ir a la Tienda a realizar mi primer pedido
        </button>
      </div>
    `;
    document.getElementById('btn-historial-vacio-tienda')?.addEventListener('click', cargarHomeStore);
    return;
  }

  let html = `
    <div class="admin-dashboard-container" style="max-width: 1000px;">
      <h2>📋 Mis Pedidos Realizados</h2>
      <p style="color: #6c757d; font-style: italic; margin-bottom: 25px;">Hacé clic sobre cualquier tarjeta para inspeccionar el detalle completo y el estado de entrega.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
  `;

  pedidosCliente.forEach(pedido => {
    const estadoLimpio = pedido.estado.toUpperCase();
    let claseBadge = "pendiente";
    let textoVisual = "Pendiente";

    if (estadoLimpio === 'CONFIRMADO') { claseBadge = "confirmado"; textoVisual = "En Preparación"; }
    if (estadoLimpio === 'TERMINADO') { claseBadge = "terminado"; textoVisual = "✅ Entregado"; }
    if (estadoLimpio === 'CANCELADO') { claseBadge = "pendiente"; textoVisual = "❌ Cancelado"; }

    //productos primeros 3 + contador
    const listaProductos = pedido.productosDetalle || [];
    let resumenTexto = "";
    
    if (listaProductos.length === 0) {
      resumenTexto = "Sin productos";
    } else {
      resumenTexto = listaProductos.slice(0, 3).join(', ');
      if (listaProductos.length > 3) {
        resumenTexto += ` y +${listaProductos.length - 3} ítems más`;
      }
    }

    html += `
      <div class="tarjeta-producto" id="card-pedido-cliente-${pedido.id}" style="text-align: left; cursor: pointer; border: 1px solid #eef0f2; transition: transform 0.2s;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f1f3f5; padding-bottom: 8px;">
          <span style="font-weight: bold; color: #495057;">Orden # ${pedido.id}</span>
          <span class="badge-estado ${claseBadge}">${textoVisual}</span>
        </div>
        
        <p style="margin: 5px 0; font-size: 0.9rem; color: #6c757d;">📅 Emitido: ${pedido.fechaHora}</p>
        
        <p style="margin: 10px 0; font-size: 0.9rem; font-weight: 500; color:#212529; line-height:1.4;">
          📦 Contenido: <span style="font-weight: normal; color:#6c757d; font-style:italic;">${resumenTexto}</span>
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #f1f3f5; padding-top: 10px;">
          <span style="font-size: 0.85rem; color:#6c757d;">Total abonado:</span>
          <span style="font-weight: bold; color: #28a745; font-size: 1.15rem;">$ ${pedido.total}</span>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>

    <div id="modal-detalle-pedido-cliente" class="modal">
      <div class="modal-contenido" style="max-width: 500px;">
        <span class="cerrar-modal" id="btn-cerrar-modal-pedido-cliente">&times;</span>
        <div id="body-modal-pedido-cliente"></div>
      </div>
    </div>
  `;

  contenedor.innerHTML = html;
  configurarEventosHistorial();
}

function configurarEventosHistorial() {
  pedidosCliente.forEach(pedido => {
    document.getElementById(`card-pedido-cliente-${pedido.id}`)?.addEventListener('click', () => {
      abrirModalDetallePedido(pedido);
    });
  });

  document.getElementById('btn-cerrar-modal-pedido-cliente')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-detalle-pedido-cliente');
    if (modal) modal.style.display = 'none';
  });
}

function abrirModalDetallePedido(pedido: any) {
  const modal = document.getElementById('modal-detalle-pedido-cliente');
  const body = document.getElementById('body-modal-pedido-cliente');
  if (!modal || !body) return;

  const estadoLimpio = pedido.estado.toUpperCase();
  let iconoVisual = "⏳";
  let mensajeEstado = "Tu pedido fue recibido por nuestro sistema y está a la espera de ser aprobado por la cocina.";
  let textoVisual = "Pendiente";

  if (estadoLimpio === 'CONFIRMADO') { iconoVisual = "👨‍🍳"; mensajeEstado = "¡Buenas noticias! Nuestro chef ya está preparando tus hamburguesas."; textoVisual = "En Preparación"; }
  if (estadoLimpio === 'TERMINADO') { iconoVisual = "🛵"; mensajeEstado = "¡Tu pedido ya fue entregado y disfrutado! Gracias por elegirnos."; textoVisual = "Entregado"; }
  if (estadoLimpio === 'CANCELADO') { iconoVisual = "❌"; mensajeEstado = "Esta orden fue cancelada por el establecimiento."; textoVisual = "Cancelado"; }

  const listaProductos = pedido.productosDetalle || [];

  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 3.5rem; display: block; margin-bottom: 5px;">${iconoVisual}</span>
      <h3 style="margin: 0;">Detalle de la Orden # ${pedido.id}</h3>
      <span style="font-size: 0.9rem; color: #6c757d;">Estado actual: <strong>${textoVisual}</strong></span>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef;">
      <h4 style="margin: 0 0 8px 0; font-size: 0.9rem; color: #495057;">📍 Información de Entrega</h4>
      <p style="margin: 0; font-size: 0.85rem; color: #6c757d; line-height: 1.4;">
        <strong>Cliente:</strong> ${pedido.clienteNombre}<br>
        <strong>Fecha/Hora de Registro:</strong> ${pedido.fechaHora}<br>
        <strong>Destino:</strong> Retiro por Mostrador / Sucursal Córdoba
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px 0; font-size: 0.9rem; color: #495057;">📋 Lista Completa de Productos</h4>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${listaProductos.map((prod: string) => `
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; border-bottom: 1px solid #f1f3f5; padding-bottom: 4px; color:#495057;">
            <span>${prod}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="border-top: 2px dashed #dee2e6; padding-top: 12px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #6c757d; margin-bottom: 5px;">
        <span>Subtotal Neto:</span>
        <span>$ ${pedido.total}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; color: #212529; margin-top: 5px;">
        <span>TOTAL ABONADO:</span>
        <span style="color:#28a745;">$ ${pedido.total}</span>
      </div>
    </div>

    <div style="background: #e8f4fd; border-left: 4px solid #2196f3; padding: 12px; border-radius: 4px;">
      <p style="margin: 0; font-size: 0.85rem; color: #0d47a1; line-height: 1.4; font-style: italic;">
        💡 ${mensajeEstado}
      </p>
    </div>
  `;

  modal.style.display = 'block';
}