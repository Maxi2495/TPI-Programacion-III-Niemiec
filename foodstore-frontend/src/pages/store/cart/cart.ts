import { cargarHomeStore } from '../homeStore.ts';
import { usuarioLogueado } from '../../../main.ts';

let carritoLocal: any[] = [];
let productosFresh: any[] = []; 

export async function cargarCarritoStore() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Validando stock disponible con la cocina...</div>`;

  try {
    
    const respuesta = await fetch('http://localhost:8080/api/products');
    productosFresh = await respuesta.json();
    
    carritoLocal = JSON.parse(localStorage.getItem('carrito_foodstore') || '[]');
    
    renderizarInterfazCarrito(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error de red al sincronizar el carrito.</p>`;
  }
}

function renderizarInterfazCarrito(contenedor: HTMLElement) {
  //carrito arranca vacio
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
            
            <label style="font-weight: bold; font-size: 0.85rem; color:#495057;">💳 Forma de Pago *</label>
            <select id="checkout-forma-pago" class="select-pago" required>
              <option value="EFECTIVO">💵 Efectivo en Caja</option>
              <option value="TARJETA">💳 Tarjeta de Crédito / Débito</option>
              <option value="TRANSFERENCIA">📱 Transferencia / Cuenta DNI</option>
            </select>

            <label style="font-weight: bold; font-size: 0.85rem; color:#495057;">📱 Teléfono de Contacto *</label>
            <input type="text" id="checkout-telefono" class="select-pago" required placeholder="Ej: 3513445566">
            
            <button type="submit" class="btn-confirmar" style="width: 100%; margin-top: 10px;">
              Confirmar Pedido
            </button>
          </form>

          <button id="btn-checkout-seguir-comprando" class="btn-sesion" style="width: 100%; margin-top: 10px; background-color:#6c757d;">
            Seguir Comprando
          </button>
        </div>

      </div>
    </div>
  `;

  contenedor.innerHTML = html;
  configurarEventosInterfazCarrito();
}

function configurarEventosInterfazCarrito() {
  // botoncitos (+/-) y eliminar
  carritoLocal.forEach(item => {
    const prodRef = productosFresh.find(p => p.id === item.productoId);
    const stockMaximo = prodRef ? prodRef.stock : 99;

    //control de restar
    document.getElementById(`btn-restar-${item.productoId}`)?.addEventListener('click', () => {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        carritoLocal = carritoLocal.filter(i => i.productoId !== item.productoId);
      }
      guardarYRefrescarCarrito();
    });

    //control de sumar
    document.getElementById(`btn-sumar-${item.productoId}`)?.addEventListener('click', () => {
      if (item.cantidad < stockMaximo) {
        item.cantidad++;
        guardarYRefrescarCarrito();
      } else {
        alert("⚠️ No queda más stock disponible en la cocina para este producto.");
      }
    });

    //control de eliminar 
    document.getElementById(`btn-eliminar-${item.productoId}`)?.addEventListener('click', () => {
      carritoLocal = carritoLocal.filter(i => i.productoId !== item.productoId);
      guardarYRefrescarCarrito();
    });
  });

  //vaciar Carrito
  document.getElementById('btn-vaciar-carrito-real')?.addEventListener('click', () => {
    carritoLocal = [];
    guardarYRefrescarCarrito();
  });

  //volver a la tienda
  document.getElementById('btn-checkout-seguir-comprando')?.addEventListener('click', cargarHomeStore);

  //envio final de la orden de compra
  document.getElementById('form-checkout-carrito')?.addEventListener('submit', procesarCheckoutFinalBackend);
}

function guardarYRefrescarCarrito() {
  localStorage.setItem('carrito_foodstore', JSON.stringify(carritoLocal));
  cargarCarritoStore(); 
}

async function procesarCheckoutFinalBackend(e: Event) {
  e.preventDefault();

  if (!usuarioLogueado) {
    alert("Error: Sesión inválida. Inicie sesión nuevamente.");
    return;
  }

  const telefono = (document.getElementById('checkout-telefono') as HTMLInputElement).value;
  const formaPago = (document.getElementById('checkout-forma-pago') as HTMLSelectElement).value;

  
  const detallesMapeados = carritoLocal.map(item => ({
    productoId: item.productoId,
    cantidad: item.cantidad
  }));

  const cuerpoPedidoDto = {
    usuarioId: usuarioLogueado.id,
    detalles: detallesMapeados,
    formaPago: formaPago
  };

  try {
    const respuesta = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpoPedidoDto)
    });

    if (respuesta.ok) {      
      alert(`¡Pedido confirmado con éxito! Tu orden ya está ingresada en la cocina. Nos comunicaremos al número ${telefono} ante cualquier novedad.`);
      
      localStorage.removeItem('carrito_foodstore');
      cargarHomeStore(); 
    }
  } catch (error) {
    console.error(error);
    alert("Error de red al intentar impactar la transacción POST.");
  }
}