import { cargarHomeStore } from '../homeStore.ts';
import { usuarioLogueado } from '../../../main.ts';

let carritoLocal: any[] = [];
let productosFresh: any[] = []; // Para validar stock e imágenes en tiempo real

export async function cargarCarritoStore() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Validando stock disponible con la cocina...</div>`;

  try {
    // Traemos los productos frescos para validar stock real e imágenes
    const respuesta = await fetch('http://localhost:8080/api/products');
    productosFresh = await respuesta.json();
    
    // Leemos el carrito guardado en el disco
    carritoLocal = JSON.parse(localStorage.getItem('carrito_foodstore') || '[]');
    
    renderizarInterfazCarrito(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error de red al sincronizar el carrito.</p>`;
  }
}

function renderizarInterfazCarrito(contenedor: HTMLElement) {
  // ● Estado vacío con mensaje y botón a la tienda requerido por la cátedra
  if (carritoLocal.length === 0) {
    contenedor.innerHTML = `
      <div class="auth-container" style="max-width: 500px; padding: 40px;">
        <h2>🛒 Tu Carrito está vacío</h2>
        <p style="color: #6c757d; margin-bottom: 25px;">No seleccionó ningún plato o hamburguesa todavía.</p>
        <button id="btn-carrito-volver-tienda" class="btn-admin" style="width:100%; background-color:#007bff;">
          🏃‍♂️ Ir a la Tienda a Buscar Comida
        </button>
      </div>
    `;
    document.getElementById('btn-carrito-volver-tienda')?.addEventListener('click', cargarHomeStore);
    return;
  }

  let subtotal = 0;

  let html = `
    <div class="admin-dashboard-container" style="max-width: 1000px;">
      <h2>🛒 Detalle de tu Carrito de Compra</h2>
      <p style="color: #6c757d; font-style: italic; margin-bottom: 20px;">Revise los ítems y las cantidades antes de proceder al pago transaccional.</p>
      
      <div style="display: flex; gap: 25px; align-items: flex-start;">
        
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 15px;">
  `;

  carritoLocal.forEach(item => {
    // Buscamos el producto fresco para extraer la imagen y el stock de la cocina
    const prodRef = productosFresh.find(p => p.id === item.productoId);
    const urlImagen = prodRef ? prodRef.imagen : 'https://placehold.co/100';
    const stockMaximo = prodRef ? prodRef.stock : 99;
    
    const itemTotal = item.precio * item.cantidad;
    subtotal += itemTotal;

    html += `
      <div style="background: white; padding: 15px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${urlImagen}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;">
          <div>
            <h4 style="margin: 0 0 5px 0; font-size: 1.05rem;">${item.nombre}</h4>
            <p style="margin: 0; color: #28a745; font-weight: bold; font-size: 0.9rem;">$ ${item.precio} c/u</p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn-sesion" style="padding: 4px 10px; background-color:#6c757d;" id="btn-restar-${item.productoId}">-</button>
          <span style="font-weight: bold; font-size: 1.1rem; min-width: 25px; text-align: center;">${item.cantidad}</span>
          <button class="btn-sesion" style="padding: 4px 10px; background-color:#6c757d;" id="btn-sumar-${item.productoId}" ${item.cantidad >= stockMaximo ? 'disabled' : ''}>+</button>
        </div>

        <div style="display: flex; align-items: center; gap: 20px;">
          <span style="font-weight: bold; font-size: 1.1rem; min-width: 90px; text-align: right;">$ ${itemTotal}</span>
          <button class="btn-sesion" style="background-color: #dc3545; padding: 6px 10px;" id="btn-eliminar-${item.productoId}">🗑️</button>
        </div>
      </div>
    `;
  });

  html += `
          <button id="btn-vaciar-carrito-real" class="btn-sesion" style="background-color: #e0a800; color: black; font-weight: bold; align-self: flex-start; margin-top: 10px;">
            🧹 Vaciar Carrito Completo
          </button>
        </div>

        <div style="width: 320px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eee;">
          <h3 style="margin-top:0; border-bottom: 2px solid #f1f3f5; padding-bottom: 10px;">📊 Resumen de Orden</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95rem; color:#6c757d;">
            <span>Subtotal Neto:</span>
            <span>$ ${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem; border-top: 1px solid #f1f3f5; padding-top: 10px; margin-bottom: 20px;">
            <span>TOTAL:</span>
            <span style="color:#28a745;">$ ${subtotal}</span>
          </div>

          <form id="form-checkout-carrito" style="display: flex; flex-direction: column; gap: 10px;">
            <label style="font-weight: bold; font-size: 0.85rem; color:#495057;">📱 Teléfono de Contacto *</label>
            <input type="text" id="checkout-telefono" class="select-pago" required placeholder="Ej: 3513445566">
            
            <button type="submit" class="btn-confirmar" style="width: 100%; margin-top: 10px;">
              🚀 Confirmar Pedido
            </button>
          </form>

          <button id="btn-checkout-seguir-comprando" class="btn-sesion" style="width: 100%; margin-top: 10px; background-color:#6c757d;">
            🍕 Seguir Comprando
          </button>
        </div>

      </div>
    </div>
  `;

  contenedor.innerHTML = html;
  configurarEventosInterfazCarrito();
}

function configurarEventosInterfazCarrito() {
  // Eventos para modificar cantidad (+/-) y eliminar de forma reactiva
  carritoLocal.forEach(item => {
    const prodRef = productosFresh.find(p => p.id === item.productoId);
    const stockMaximo = prodRef ? prodRef.stock : 99;

    // Control de Restar
    document.getElementById(`btn-restar-${item.productoId}`)?.addEventListener('click', () => {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        carritoLocal = carritoLocal.filter(i => i.productoId !== item.productoId);
      }
      guardarYRefrescarCarrito();
    });

    // Control de Sumar (Validando stock de la cocina)
    document.getElementById(`btn-sumar-${item.productoId}`)?.addEventListener('click', () => {
      if (item.cantidad < stockMaximo) {
        item.cantidad++;
        guardarYRefrescarCarrito();
      } else {
        alert("⚠️ No queda más stock disponible en la cocina para este producto.");
      }
    });

    // Control de Eliminar Renglón
    document.getElementById(`btn-eliminar-${item.productoId}`)?.addEventListener('click', () => {
      carritoLocal = carritoLocal.filter(i => i.productoId !== item.productoId);
      guardarYRefrescarCarrito();
    });
  });

  // Vaciar Carrito
  document.getElementById('btn-vaciar-carrito-real')?.addEventListener('click', () => {
    carritoLocal = [];
    guardarYRefrescarCarrito();
  });

  // Volver a la tienda
  document.getElementById('btn-checkout-seguir-comprando')?.addEventListener('click', cargarHomeStore);

  // Envío final de la orden de compra (POST /api/orders)
  document.getElementById('form-checkout-carrito')?.addEventListener('submit', procesarCheckoutFinalBackend);
}

function guardarYRefrescarCarrito() {
  localStorage.setItem('carrito_foodstore', JSON.stringify(carritoLocal));
  cargarCarritoStore(); // Recarga reactiva de la interfaz
}

async function procesarCheckoutFinalBackend(e: Event) {
  e.preventDefault();

  if (!usuarioLogueado) {
    alert("❌ Error: Sesión inválida. Inicie sesión nuevamente.");
    return;
  }

  const telefono = (document.getElementById('checkout-telefono') as HTMLInputElement).value;

  // Armamos los detalles mapeados con el DetallePedidoDto de tu Java
  const detallesMapeados = carritoLocal.map(item => ({
    productoId: item.productoId,
    cantidad: item.cantidad
  }));

  // Cuerpo exacto esperado por el @RequestBody de tu PedidoCreate en Spring Boot
  const cuerpoPedidoDto = {
    usuarioId: usuarioLogueado.id,
    detalles: detallesMapeados
    // Nota: El teléfono lo podés mandar si tu DTO lo tuviera, sino cumple con la validación HTML del campo requerido.
  };

  try {
    const respuesta = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpoPedidoDto)
    });

    if (respuesta.ok) {      
      alert(`🎉 ¡Pedido confirmado con éxito! Tu orden ya está ingresada en la cocina. Nos comunicaremos al número ${telefono} ante cualquier novedad.`);
      
      localStorage.removeItem('carrito_foodstore');
      cargarHomeStore(); 
    }
  } catch (error) {
    console.error(error);
    alert("❌ Error de red al intentar impactar la transacción POST.");
  }
}