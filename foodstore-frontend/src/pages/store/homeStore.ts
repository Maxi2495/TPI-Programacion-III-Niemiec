import { usuarioLogueado } from '../../main';

let carrito: any[] = [];
let productosGlobal: any[] = [];

export async function cargarHomeStore() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Cargando catálogo desde Spring Boot...</div>`;

  try {
    const respuesta = await fetch('http://localhost:8080/api/products');
    productosGlobal = await respuesta.json();
    renderizarTienda(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error de conexión con el backend.</p>`;
  }
}

function renderizarTienda(contenedor: HTMLElement) {
  let html = `
    <div class="contenedor-principal">
      <section class="grid-productos">
  `;

  productosGlobal.forEach(producto => {
    html += `
      <div class="tarjeta-producto">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p><strong>$ ${producto.precio}</strong></p>
        <button class="btn-agregar" 
                data-id="${producto.id}" 
                data-nombre="${producto.nombre}" 
                data-precio="${producto.precio}">
          🛒 Agregar al carrito
        </button>
      </div>
    `;
  });

  html += `
      </section>
      
      <aside class="carrito-lateral">
        <h2>🛍️ Tu Carrito</h2>
        <div id="items-carrito">
          <p class="carrito-vacio">El carrito está vacío</p>
        </div>
        
        <div class="carrito-pago">
          <label for="select-pago"><strong>Forma de Pago:</strong></label>
          <select id="select-pago" class="select-pago">
            <option value="EFECTIVO">💵 Efectivo</option>
            <option value="TARJETA">💳 Tarjeta de Crédito/Débito</option>
            <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
          </select>
        </div>

        <div class="carrito-total">
          <h3>Total: $<span id="total-precio">0</span></h3>
        </div>
        <button id="btn-confirmar" class="btn-confirmar" disabled>⚡ Confirmar Pedido</button>
      </aside>
    </div>

    <!-- Modal de Vista Detallada de Producto -->
    <div id="modal-detalle" class="modal">
      <div class="modal-contenido">
        <span id="btn-cerrar-modal" class="cerrar-modal">&times;</span>
        <div id="modal-cuerpo"></div>
      </div>
    </div>
  `;

  contenedor.innerHTML = html;
  configurarEventosTienda();
  actualizarVistaCarrito();
}

function configurarEventosTienda() {
  const botonesAgregar = document.querySelectorAll('.btn-agregar');
  botonesAgregar.forEach(boton => {
    boton.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const id = Number(target.getAttribute('data-id'));
      const nombre = target.getAttribute('data-nombre') || '';
      const precio = Number(target.getAttribute('data-precio'));
      
      const existe = carrito.find(item => item.id === id);
      if (existe) { existe.cantidad++; } else { carrito.push({ id, nombre, precio, cantidad: 1 }); }
      actualizarVistaCarrito();
    });
  });

  // Re-enganchamos tu lógica del Modal Detallado espectacular
  const tarjetas = document.querySelectorAll('.tarjeta-producto');
  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-agregar')) return;
      const boton = tarjeta.querySelector('.btn-agregar');
      if (boton) { mostrarDetalleProducto(Number(boton.getAttribute('data-id'))); }
    });
  });

  document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-detalle');
    if (modal) modal.style.display = 'none';
  });

  document.getElementById('btn-confirmar')?.addEventListener('click', enviarPedidoAlBackend);
}

function actualizarVistaCarrito() {
  const contenedorItems = document.getElementById('items-carrito');
  const txtTotal = document.getElementById('total-precio');
  const btnConfirmar = document.getElementById('btn-confirmar') as HTMLButtonElement;

  if (!contenedorItems || !txtTotal) return;

  if (carrito.length === 0) {
    contenedorItems.innerHTML = `<p class="carrito-vacio">El carrito está vacío</p>`;
    txtTotal.innerText = '0';
    if (btnConfirmar) btnConfirmar.disabled = true;
    return;
  }

  let htmlItems = '';
  let acumuladorTotal = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    acumuladorTotal += subtotal;
    htmlItems += `
      <div class="item-linea">
        <span>${item.nombre} (x${item.cantidad})</span>
        <span>$${subtotal}</span>
      </div>
    `;
  });

  contenedorItems.innerHTML = htmlItems;
  txtTotal.innerText = acumuladorTotal.toString();
  if (btnConfirmar) btnConfirmar.disabled = false;
}

function mostrarDetalleProducto(id: number) {
  const producto = productosGlobal.find(p => p.id === id);
  const modal = document.getElementById('modal-detalle');
  const cuerpo = document.getElementById('modal-cuerpo');

  if (!producto || !modal || !cuerpo) return;

  cuerpo.innerHTML = `
    <div class="detalle-layout">
      <img src="${producto.imagen}" alt="${producto.nombre}" class="detalle-img">
      <div class="detalle-info">
        <h2>${producto.nombre}</h2>
        <p class="detalle-categoria">Categoría: Premium</p>
        <p class="detalle-desc">${producto.descripcion}</p>
        <p class="detalle-stock">⚡ Disponibles: <strong>${producto.stock}</strong></p>
        <p class="detalle-precio">$ ${producto.precio}</p>
        <button class="btn-agregar-modal btn-agregar" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" style="width: 100%; padding: 10px; background:#ffc107; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
          🛒 Añadir al Pedido
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'block';

  cuerpo.querySelector('.btn-agregar-modal')?.addEventListener('click', () => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) { existe.cantidad++; } else { carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }); }
    actualizarVistaCarrito();
    modal.style.display = 'none';
  });
}

async function enviarPedidoAlBackend() {
  const btnConfirmar = document.getElementById('btn-confirmar') as HTMLButtonElement;
  const selectPago = document.getElementById('select-pago') as HTMLSelectElement;
  if (btnConfirmar) btnConfirmar.disabled = true;

  const nuevoPedidoDto = {
    formaPago: selectPago ? selectPago.value : "EFECTIVO",
    usuarioId: usuarioLogueado?.id, // 👈 ¡Súper dinámico! Usa el ID real del LocalStorage
    detalles: carrito.map(item => ({ cantidad: item.cantidad, productoId: item.id }))
  };

  try {
    const respuesta = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoPedidoDto)
    });

    if (respuesta.ok) {
      alert("🎉 ¡Pedido enviado con éxito al servidor! Stock actualizado.");
      carrito = [];
      actualizarVistaCarrito();
      cargarHomeStore(); // Refrescamos la pantalla de forma modular
    } else {
      alert("❌ Error del servidor al procesar la venta.");
      if (btnConfirmar) btnConfirmar.disabled = false;
    }
  } catch (error) {
    console.error(error);
    alert("❌ No se pudo conectar con el servidor.");
    if (btnConfirmar) btnConfirmar.disabled = false;
  }
}