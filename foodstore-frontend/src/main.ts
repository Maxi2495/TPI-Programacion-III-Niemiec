import './style.css';

// 1. Definimos el "molde" de cómo luce un producto en el Carrito
interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

// 2. Estado de la aplicación
let carrito: ItemCarrito[] = [];

// 👇 NUEVO: Variable global para guardar los productos del Backend y usarlos al cambiar de rol
let productosGlobal: any[] = [];

// El usuario por defecto arranca siendo Juan Pérez (ID: 2)
let usuarioActivo = {
  id: 2,
  nombre: "Juan Pérez",
  rol: "USUARIO"
};

// Función asíncrona para traer la data real del Backend
async function cargarProductos() {
  try {
    const respuesta = await fetch('http://localhost:8080/api/products');
    const productos = await respuesta.json();
    
    // 👇 NUEVO: Guardamos una copia en nuestra variable global antes de renderizar
    productosGlobal = productos;
    
    renderizarProductos(productosGlobal);
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app) app.innerHTML = `<p style="color:red">Error de conexión con el backend.</p>`;
  }
}

// Función para dibujar la interfaz completa
function renderizarProductos(productos: any[]) {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // 1. Armamos el esqueleto con la barra de sesión y el panel administrativo condicional
  let html = `
    <div class="barra-sesion">
      <span>👤 Sesión activa: <strong>${usuarioActivo.nombre}</strong> (${usuarioActivo.rol})</span>
      <div class="botones-login">
        <button id="btn-login-cliente" class="btn-sesion">Simular Cliente (Juan)</button>
        <button id="btn-login-admin" class="btn-sesion">Simular Admin (Ana)</button>
      </div>
    </div>

    <header>
      <h1>🍔 Food Store - Tu Pedido Full-Stack</h1>
    </header>
    
    <div class="panel-admin" style="display: ${usuarioActivo.rol === 'ADMIN' ? 'block' : 'none'}">
      <h2>📊 Panel de Control (Administrador)</h2>
      <div class="admin-acciones">
        <button id="btn-reporte-ingresos" class="btn-admin">💵 Calcular Recaudación Real</button>
        <div class="resultado-reporte">
          <span>Total Facturado (Pedidos Terminados): </span>
          <strong id="monto-recaudacion">$ 0.0</strong>
        </div>
      </div>
    </div>

    <div class="contenedor-principal">
      <section class="grid-productos">
  `;

  // 2. Iteramos los productos del catálogo
  productos.forEach(producto => {
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

  // 3. Renderizamos el Carrito Lateral
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
  `;

  app.innerHTML = html;

  // Asignamos los "oídos" (Listeners) una vez que el HTML se inyectó
  configurarEventos();
}

// Función para capturar los clics del usuario
function configurarEventos() {
  // Oídos para los botones de Agregar Producto
  const botonesAgregar = document.querySelectorAll('.btn-agregar');
  botonesAgregar.forEach(boton => {
    boton.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const id = Number(target.getAttribute('data-id'));
      const nombre = target.getAttribute('data-nombre') || '';
      const precio = Number(target.getAttribute('data-precio'));
      
      agregarAlCarrito(id, nombre, precio);
    });
  });

  // Oído para el botón de Confirmar Pedido (Corregido: fuera del bucle forEach)
  const btnConfirmar = document.getElementById('btn-confirmar');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', enviarPedidoAlBackend);
  }

  // Oído para el botón del Panel de Administración (Corregido: fuera del bucle forEach)
  const btnReporte = document.getElementById('btn-reporte-ingresos');
  if (btnReporte) {
    btnReporte.addEventListener('click', consultarRecaudacionBackend);
  }

  // Intercambio de roles simulado usando la variable global corregida
  const btnCliente = document.getElementById('btn-login-cliente');
  const btnAdmin = document.getElementById('btn-login-admin');

  if (btnCliente) {
    btnCliente.addEventListener('click', () => {
      usuarioActivo = { id: 2, nombre: "Juan Pérez", rol: "USUARIO" };
      renderizarProductos(productosGlobal); 
      // 👇 NUEVO: Forzamos a la pantalla a redibujar el ticket con lo que ya tenía el carrito
      actualizarVistaCarrito(); 
    });
  }

  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      usuarioActivo = { id: 1, nombre: "Ana Martínez (Gerente)", rol: "ADMIN" };
      renderizarProductos(productosGlobal);
      // 👇 NUEVO: Lo mismo acá para que el Admin mantenga la vista del ticket
      actualizarVistaCarrito(); 
    });
  }
}

// Lógica de negocio del carrito
function agregarAlCarrito(id: number, nombre: string, precio: number) {
  const existe = carrito.find(item => item.id === id);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }

  actualizarVistaCarrito();
}

// Mantiene el "ticket" actualizado en pantalla
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

async function enviarPedidoAlBackend() {
  const btnConfirmar = document.getElementById('btn-confirmar') as HTMLButtonElement;
  const selectPago = document.getElementById('select-pago') as HTMLSelectElement;
  
  if (btnConfirmar) btnConfirmar.disabled = true;

  const formaPagoSeleccionada = selectPago ? selectPago.value : "EFECTIVO";

  const nuevoPedidoDto = {
    formaPago: formaPagoSeleccionada,
    usuarioId: usuarioActivo.id, // Envía dinámicamente el ID del usuario activo (1 o 2)
    detalles: carrito.map(item => ({
      cantidad: item.cantidad,
      productoId: item.id
    }))
  };

  try {
    const respuesta = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoPedidoDto)
    });

    if (respuesta.ok) {
      alert("🎉 ¡Pedido enviado con éxito al servidor! Stock actualizado.");
      carrito = [];
      actualizarVistaCarrito();
      location.reload();
    } else {
      const errorTexto = await respuesta.text();
      alert(`❌ Error del servidor: ${errorTexto}`);
      if (btnConfirmar) btnConfirmar.disabled = false;
    }
  } catch (error) {
    console.error("Error al enviar el pedido:", error);
    alert("❌ No se pudo conectar con el servidor para procesar la venta.");
    if (btnConfirmar) btnConfirmar.disabled = false;
  }
}

async function consultarRecaudacionBackend() {
  const txtMonto = document.getElementById('monto-recaudacion');
  if (!txtMonto) return;

  try {
    const respuesta = await fetch('http://localhost:8080/api/orders/reports/revenue');
    const total = await respuesta.json();
    txtMonto.innerText = `$ ${total.toFixed(2)}`;
  } catch (error) {
    console.error("Error al consultar el reporte:", error);
    alert("❌ No se pudo obtener el reporte del servidor.");
  }
}

// Arrancamos el circuito
cargarProductos();