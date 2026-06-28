let productosAdminGlobal: any[] = [];

export async function cargarGestionProductos() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Cargando inventario de productos...</div>`;

  try {
    // 1. GET para alimentar la tabla de administración
    const respuesta = await fetch('http://localhost:8080/api/products');
    productosAdminGlobal = await respuesta.json();
    renderizarAbmProductos(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error al cargar el módulo de productos.</p>`;
  }
}

function renderizarAbmProductos(contenedor: HTMLElement) {
  let html = `
    <div class="admin-products-container">
      <div class="admin-header-acciones">
        <h2>📦 Gestión de Productos (Catálogo General)</h2>
        <button id="btn-nuevo-producto" class="btn-admin" style="background-color: #28a745;">➕ Nuevo Producto</button>
      </div>

      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Mapeamos dinámicamente cada producto a un renglón <tr> de la tabla
  productosAdminGlobal.forEach(p => {
    html += `
      <tr>
        <td><strong># ${p.id}</strong></td>
        <td><img src="${p.imagen}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></td>
        <td>${p.nombre}</td>
        <td style="max-width: 300px; font-size:0.85rem; color:#6c757d;">${p.descripcion}</td>
        <td><strong>$ ${p.precio}</strong></td>
        <td>${p.stock} u.</td>
        <td>
          <span class="badge-estado ${p.stock > 0 ? 'terminado' : 'pendiente'}">
            ${p.stock > 0 ? 'Disponible' : 'Sin Stock'}
          </span>
        </td>
        <td>
          <button class="btn-sesion" style="background-color:#ffc107; color:black; padding:4px 8px; font-size:0.8rem;" onclick="alert('Próximo paso: Editar ID ${p.id}')">✏️</button>
          <button class="btn-sesion" style="background-color:#dc3545; padding:4px 8px; font-size:0.8rem;" onclick="alert('Próximo paso: Eliminar ID ${p.id}')">🗑️</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>

    <div id="modal-form-producto" class="modal">
      <div class="modal-contenido" style="max-width: 500px;">
        <span id="btn-cerrar-form" class="cerrar-modal">&times;</span>
        <h3>➕ Registrar Nuevo Producto</h3>
        <form id="form-alta-producto" class="form-auth" style="margin-top:15px;">
          
          <label>Nombre del Producto *</label>
          <input type="text" id="form-p-nombre" class="select-pago" required placeholder="Ej: Papas Fritas">

          <label>Descripción *</label>
          <textarea id="form-p-desc" class="select-pago" required placeholder="Ej: Bastones crocantes..." style="font-family:inherit; min-height:60px;"></textarea>

          <div style="display:flex; gap:15px;">
            <div style="width:50%;">
              <label>Precio ($) *</label>
              <input type="number" id="form-p-precio" class="select-pago" required min="1" placeholder="4500">
            </div>
            <div style="width:50%;">
              <label>Stock Inicial *</label>
              <input type="number" id="form-p-stock" class="select-pago" required min="0" placeholder="50">
            </div>
          </div>

          <label>URL de la Imagen *</label>
          <input type="url" id="form-p-imagen" class="select-pago" required placeholder="https://link-de-la-foto.jpg">

          <button type="submit" class="btn-confirmar" style="background-color:#28a745; margin-top:15px;">💾 Guardar en Base de Datos</button>
        </form>
      </div>
    </div>
  `;

  contenedor.innerHTML = html;
  configurarEventosAbm();
}

function configurarEventosAbm() {
  const modal = document.getElementById('modal-form-producto');

  document.getElementById('btn-nuevo-producto')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'block';
  });

  document.getElementById('btn-cerrar-form')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  // Manejo del envío del formulario (POST Transaccional)
  document.getElementById('form-alta-producto')?.addEventListener('submit', enviarNuevoProductoAlBackend);
}

async function enviarNuevoProductoAlBackend(e: Event) {
  e.preventDefault();

  // Capturamos las variables reales del formulario de la web
  const nombre = (document.getElementById('form-p-nombre') as HTMLInputElement).value;
  const descripcion = (document.getElementById('form-p-desc') as HTMLTextAreaElement).value;
  const precio = Number((document.getElementById('form-p-precio') as HTMLInputElement).value);
  const stock = Number((document.getElementById('form-p-stock') as HTMLInputElement).value);
  const imagen = (document.getElementById('form-p-imagen') as HTMLInputElement).value;

  // Armamos el esqueleto JSON que va a recibir tu @RequestBody de Java
  const nuevoProductoDto = {
    nombre,
    descripcion,
    precio,
    stock,
    imagen,
    categoriaId: 1 // Por defecto las mandamos a Hamburguesas para simplificar la entrega
  };

  try {
    // 2. Disparamos la petición POST asíncrona (FETCH) hacia tu Controller de Spring Boot
    const respuesta = await fetch('http://localhost:8080/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProductoDto)
    });

    if (respuesta.ok) {
      alert("🎉 ¡Producto insertado con éxito! Hibernate ejecutó la persistencia en H2.");
      const modal = document.getElementById('modal-form-producto');
      if (modal) modal.style.display = 'none';
      cargarGestionProductos(); // Recargamos dinámicamente la tabla
    } else {
      const errorTexto = await respuesta.text();
      alert(`❌ Error al guardar en Java: ${errorTexto}`);
    }
  } catch (error) {
    console.error(error);
    alert("❌ Error de red al intentar conectar con el endpoint POST.");
  }
}