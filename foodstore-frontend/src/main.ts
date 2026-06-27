import './style.css';

// 1. Definimos el "molde" de cómo luce un producto en el Carrito (Contrato de TypeScript)
interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

// 2. Nuestro estado de la aplicación: El carrito arranca vacío
let carrito: ItemCarrito[] = [];

// Función asíncrona para traer la data real del Backend
async function cargarProductos() {
  try {
    const respuesta = await fetch('http://localhost:8080/api/products');
    const productos = await respuesta.json();
    renderizarProductos(productos);
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app) app.innerHTML = `<p style="color:red">Error de conexión con el backend.</p>`;
  }
}

// Función para dibujar la interfaz completa (Catálogo + Carrito al costado)
function renderizarProductos(productos: any[]) {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // Armamos una estructura de dos columnas: izquierda catálogo, derecha carrito
  let html = `
    <header>
      <h1>🍔 Food Store - Tu Pedido Full-Stack</h1>
    </header>
    <div class="contenedor-principal">
      <section class="grid-productos">
  `;

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

  html += `
      </section>
      
      <aside class="carrito-lateral">
        <h2>🛍️ Tu Carrito</h2>
        <div id="items-carrito">
          <p class="carrito-vacio">El carrito está vacío</p>
        </div>
        <div class="carrito-total">
          <h3>Total: $<span id="total-precio">0</span></h3>
        </div>
        <button id="btn-confirmar" class="btn-confirmar" disabled>⚡ Confirmar Pedido</button>
      </aside>
    </div>
  `;

  app.innerHTML = html;

  // Una vez que el HTML existe en la pantalla, le asignamos los "oídos" (Listeners) a los botones
  configurarEventos();
}

// Función para capturar los clics del usuario
function configurarEventos() {
  const botones = document.querySelectorAll('.btn-agregar');
  
  botones.forEach(boton => {
    boton.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      
      // Extraemos los datos que guardamos en el HTML
      const id = Number(target.getAttribute('data-id'));
      const nombre = target.getAttribute('data-nombre') || '';
      const precio = Number(target.getAttribute('data-precio'));
      //Escucha el boton para confirmar el pedido
      const btnConfirmar = document.getElementById('btn-confirmar');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', enviarPedidoAlBackend);
  }

      agregarAlCarrito(id, nombre, precio);
    });
  });
}

// Lógica de negocio del carrito (Programación estructurada/orientada a objetos)
function agregarAlCarrito(id: number, nombre: string, precio: number) {
  // Verificamos si el producto ya estaba en el carrito
  const existe = carrito.find(item => item.id === id);

  if (existe) {
    // Si ya existe, simplemente le sumamos 1 a la cantidad
    existe.cantidad++;
  } else {
    // Si es nuevo, lo agregamos al array con cantidad 1
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }

  // Cada vez que cambia el carrito, redibujamos el ticket lateral
  actualizarVistaCarrito();
}

// Función encargada de mantener el "ticket" actualizado en pantalla
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
  if (btnConfirmar) btnConfirmar.disabled = false; // Habilitamos el botón si hay items
}

async function enviarPedidoAlBackend() {
  const btnConfirmar = document.getElementById('btn-confirmar') as HTMLButtonElement;
  if (btnConfirmar) btnConfirmar.disabled = true; // Evitamos doble clic accidental

  // Estructuramos el objeto exactamente como lo espera tu PedidoService en Java
  const nuevoPedidoDto = {
    formaPago: "EFECTIVO", // Hardcodeado para cumplir de forma simple el requerimiento de la HU
    usuarioId: 2,          // ID de Juan Pérez según los archivos de la cátedra
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
      carrito = []; // Vaciamos el carrito en memoria
      actualizarVistaCarrito(); // Limpiamos la pantalla lateral
      
      // Opcional: Recargamos los productos para ver el nuevo stock reflejado
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

// Arrancamos el circuito
cargarProductos();