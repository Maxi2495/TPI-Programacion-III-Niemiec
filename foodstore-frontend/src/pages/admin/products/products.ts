import { cargarAdminDashboard } from '../adminHome.ts';

let listaProductosGlobal: any[] = [];
let listaCategoriasGlobal: any[] = [];

export async function cargarGestionProductos() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Cargando inventario de productos y categorías...</div>`;

  try {
    
    const [resProductos, resCategorias] = await Promise.all([
      fetch('http://localhost:8080/api/products/admin-list'),
      fetch('http://localhost:8080/api/categories')
    ]);

    listaProductosGlobal = await resProductos.json();
    listaCategoriasGlobal = await resCategorias.json();

    renderizarPanelProductos(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error de red al sincronizar el inventario de cocina.</p>`;
  }
}

function renderizarPanelProductos(contenedor: HTMLElement) {
  contenedor.innerHTML = `
    <div class="admin-dashboard-container" style="max-width: 1200px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2>📦 Inventario Operativo de Productos (ABM)</h2>
          <p style="color: #6c757d; margin: 0; font-style: italic;">Modifique precios, controle el stock de seguridad y actualice la disponibilidad en mostrador.</p>
        </div>
        <button id="btn-nuevo-producto" class="btn-confirmar" style="background-color: #28a745;">
          ➕ Nuevo Producto
        </button>
      </div>

      <button id="btn-prod-volver-dash" class="btn-sesion" style="margin-bottom: 20px; background-color: #6c757d;">
        🔙 Volver al Dashboard
      </button>

      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th style="width: 60px;">ID</th>
            <th style="width: 80px;">Vista previa</th>
            <th>Nombre del Plato</th>
            <th>Descripción Corta</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Estado</th>
            <th style="width: 150px; text-align: center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${listaProductosGlobal.map(p => {
            const catRef = listaCategoriasGlobal.find(c => c.id === p.categoriaId);
            const nombreCategoria = catRef ? catRef.nombre : "Sin asignar";

            return `
              <tr>
                <td><strong># ${p.id}</strong></td>
                <td>
                  <img src="${p.imagen || 'https://placehold.co/60'}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;">
                </td>
                <td><span style="font-weight: 600; color: #212529;">${p.nombre}</span></td>
                <td><span style="color: #6c757d; font-size: 0.85rem; line-height:1.3; display:block; max-width:250px;">${p.descripcion || 'Sin descripción'}</span></td>
                <td><span style="font-weight: bold; color: #28a745;">$ ${p.precio}</span></td>
                <td><span class="badge-pago" style="background-color: #e8f4fd; color: #0d47a1; font-weight: 500;">${nombreCategoria}</span></td>
                <td><strong>${p.stock} u.</strong></td>
                <td>
                  <span class="badge-estado ${p.disponible && p.stock > 0 ? 'terminado' : 'pendiente'}">
                    ${p.disponible && p.stock > 0 ? 'Disponible' : 'No Disponible'}
                  </span>
                </td>
                <td style="text-align: center;">
                  <button class="btn-sesion" id="btn-editar-prod-${p.id}" style="background-color: #ffc107; color: black; padding: 6px 12px; margin-right: 5px;">✏️</button>
                  <button class="btn-sesion" id="btn-eliminar-prod-${p.id}" style="background-color: #dc3545; padding: 6px 12px;">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div id="modal-abm-producto" class="modal">
      <div class="modal-contenido" style="max-width: 500px; margin: 5% auto;">
        <span class="cerrar-modal" id="btn-cerrar-modal-prod">&times;</span>
        <h3 id="modal-prod-titulo" style="margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #f1f3f5; padding-bottom: 8px;"></h3>
        
        <form id="form-abm-producto-real" class="form-auth">
          <input type="hidden" id="form-prod-id">

          <label for="form-prod-nombre">Nombre del Producto *</label>
          <input type="text" id="form-prod-nombre" class="select-pago" required placeholder="Ej: Hamburguesa Triple Cheddar">

          <label for="form-prod-descripcion" style="margin-top: 5px;">Descripción de Ingredientes *</label>
          <textarea id="form-prod-descripcion" class="select-pago" required placeholder="Detalle para el menú..." style="width:100%; height: 60px; font-family:inherit; resize:none; box-sizing:border-box;"></textarea>

          <div style="display: flex; gap: 15px; margin-top: 5px;">
            <div style="width: 50%;">
              <label for="form-prod-precio">Precio de Venta ($) *</label>
              <input type="number" id="form-prod-precio" class="select-pago" required min="0.01" step="0.01" placeholder="0.00">
            </div>
            <div style="width: 50%;">
              <label for="form-prod-stock">Stock Inicial *</label>
              <input type="number" id="form-prod-stock" class="select-pago" required min="0" placeholder="0">
            </div>
          </div>

          <label for="form-prod-categoria" style="margin-top: 5px;">Familia / Categoría *</label>
          <select id="form-prod-categoria" class="select-pago" required>
            <option value="" disabled selected>Seleccione una opción...</option>
            ${listaCategoriasGlobal.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
          </select>

          <label for="form-prod-imagen" style="margin-top: 5px;">URL de la Imagen *</label>
          <input type="text" id="form-prod-imagen" class="select-pago" required placeholder="https://ejemplo.com/foto.jpg">

          <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px; background: #f8f9fa; padding: 10px; border-radius: 6px; border:1px solid #eee;">
            <input type="checkbox" id="form-prod-disponible" style="width: 18px; height: 18px; cursor:pointer;" checked>
            <label for="form-prod-disponible" style="margin: 0; cursor:pointer; font-weight: 500;">Habilitar disponibilidad inmediata en el catálogo</label>
          </div>

          <button type="submit" class="btn-confirmar" style="width: 100%; margin-top: 15px; background-color: #28a745;">
            💾 Guardar Producto
          </button>
        </form>
      </div>
    </div>
  `;

  configurarEventosPanelProductos();
}

function configurarEventosPanelProductos() {
  document.getElementById('btn-prod-volver-dash')?.addEventListener('click', cargarAdminDashboard);

  //boton alta
  document.getElementById('btn-nuevo-producto')?.addEventListener('click', () => {
    abrirModalFormularioProducto();
  });

  //botones fila
  listaProductosGlobal.forEach(p => {
    document.getElementById(`btn-editar-prod-${p.id}`)?.addEventListener('click', () => {
      abrirModalFormularioProducto(p);
    });

    document.getElementById(`btn-eliminar-prod-${p.id}`)?.addEventListener('click', () => {
      procesarEliminacionProductoBackend(p.id, p.nombre);
    });
  });

  //cerrar amodal
  document.getElementById('btn-cerrar-modal-prod')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-abm-producto');
    if (modal) modal.style.display = 'none';
  });
}

function abrirModalFormularioProducto(producto?: any) {
  const modal = document.getElementById('modal-abm-producto');
  const titulo = document.getElementById('modal-prod-titulo');
  const form = document.getElementById('form-abm-producto-real') as HTMLFormElement;

  if (!modal || !titulo || !form) return;

  form.reset();

  if (producto) {
    titulo.innerText = `✏️ Modificar Producto (# ${producto.id})`;
    (document.getElementById('form-prod-id') as HTMLInputElement).value = producto.id;
    (document.getElementById('form-prod-nombre') as HTMLInputElement).value = producto.nombre;
    (document.getElementById('form-prod-descripcion') as HTMLInputElement).value = producto.descripcion;
    (document.getElementById('form-prod-precio') as HTMLInputElement).value = producto.precio.toString();
    (document.getElementById('form-prod-stock') as HTMLInputElement).value = producto.stock.toString();
    (document.getElementById('form-prod-categoria') as HTMLSelectElement).value = producto.categoriaId.toString();
    (document.getElementById('form-prod-imagen') as HTMLInputElement).value = producto.imagen;
    (document.getElementById('form-prod-disponible') as HTMLInputElement).checked = producto.disponible;
  } else {
    titulo.innerText = `➕ Registrar Nuevo Producto`;
    (document.getElementById('form-prod-id') as HTMLInputElement).value = "";
    (document.getElementById('form-prod-disponible') as HTMLInputElement).checked = true;
  }

  modal.style.display = 'block';

  form.onsubmit = null;
  form.onsubmit = (e) => {
    e.preventDefault();
    procesarGuardadoProductoBackend();
  };
}

function esUrlValida(texto: string): boolean {
  try {
    new URL(texto);
    return true;
  } catch (_) {
    return false;
  }
}

async function procesarGuardadoProductoBackend() {
  const idStr = (document.getElementById('form-prod-id') as HTMLInputElement).value;
  const nombre = (document.getElementById('form-prod-nombre') as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById('form-prod-descripcion') as HTMLInputElement).value.trim();
  const precio = Number((document.getElementById('form-prod-precio') as HTMLInputElement).value);
  const stock = Number((document.getElementById('form-prod-stock') as HTMLInputElement).value);
  const categoriaId = Number((document.getElementById('form-prod-categoria') as HTMLSelectElement).value);
  const imagen = (document.getElementById('form-prod-imagen') as HTMLInputElement).value.trim();
  const disponible = (document.getElementById('form-prod-disponible') as HTMLInputElement).checked;

  //validaciones pedidas
  if (!esUrlValida(imagen)) {
    alert("La URL de la imagen ingresada no es válida. Incluir http:// o https://");
    return;
  }

  if (precio <= 0) {
    alert("El precio del plato debe ser mayor a cero.");
    return;
  }

  if (stock < 0) {
    alert("El stock disponible en cocina no puede ser un número negativo.");
    return;
  }

  const payload = {
    nombre,
    descripcion,
    precio,
    stock,
    categoriaId,
    imagen,
    disponible
  };

  const esEdicion = idStr !== "";
  const urlApi = esEdicion ? `http://localhost:8080/api/products/${idStr}` : 'http://localhost:8080/api/products';
  const metodoHttp = esEdicion ? 'PUT' : 'POST';

  try {
    const respuesta = await fetch(urlApi, {
      method: metodoHttp,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (respuesta.ok) {
      alert(esEdicion ? "El plato ha sido actualizado correctamente." : "Nuevo plato incorporado con éxito al catálogo.");
      const modal = document.getElementById('modal-abm-producto');
      if (modal) modal.style.display = 'none';

      cargarGestionProductos(); 
    } else {
      const errorTxt = await respuesta.text();
      alert(`No se pudo procesar la solicitud: ${errorTxt}`);
    }
  } catch (error) {
    console.error(error);
    alert("Error de red al intentar registrar los cambios en la base de datos.");
  }
}

async function procesarEliminacionProductoBackend(id: number, nombre: string) {
  // confirmación al eliminar
  const confirmar = confirm(`¿Está seguro de que desea dar de baja el producto "${nombre}"?`);
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`http://localhost:8080/api/products/${id}`, {method: 'DELETE'});

    if (respuesta.ok) {
      alert("El plato ha sido dado de baja de manera exitosa.");
      cargarGestionProductos(); 
    } else {
      const errorTxt = await respuesta.text();
      alert(`No se pudo dar de baja el artículo: ${errorTxt}`);
    }
  } catch (error) {
    console.error(error);
    alert("Error de red al conectar con el servicio de eliminación.");
  }
}