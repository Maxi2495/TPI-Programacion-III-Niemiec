import { cargarAdminDashboard } from '../adminHome.ts';

let listaCategoriasGlobal: any[] = [];

export async function cargarGestionCategorias() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Actualizando panel de categorías...</div>`;

  try {
    // ● GET /api/categories exigido por la cátedra
    const respuesta = await fetch('http://localhost:8080/api/categories');
    listaCategoriasGlobal = await respuesta.json();

    renderizarPanelCategorias(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">No se pudo conectar con el servicio de configuración de menú.</p>`;
  }
}

function renderizarPanelCategorias(contenedor: HTMLElement) {
  contenedor.innerHTML = `
    <div class="admin-dashboard-container">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2>📂 Administración de Categorías de Menú</h2>
          <p style="color: #6c757d; margin: 0; font-style: italic;">Defina y edite las familias de platos que se muestran en el catálogo de clientes.</p>
        </div>
        <button id="btn-nueva-categoria" class="btn-confirmar" style="background-color: #28a745;">
          ➕ Nueva Categoría
        </button>
      </div>

      <button id="btn-cat-volver-dash" class="btn-sesion" style="margin-bottom: 20px; background-color: #6c757d;">
        🔙 Volver al Dashboard
      </button>

      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th style="width: 80px;">ID</th>
            <th style="width: 100px;">Vista previa</th>
            <th>Nombre de la Categoría</th>
            <th>Descripción Operativa</th>
            <th style="width: 180px; text-align: center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${listaCategoriasGlobal.map(cat => `
            <tr>
              <td><strong># ${cat.id}</strong></td>
              <td>
                <img src="${cat.imagen || 'https://placehold.co/60'}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;">
              </td>
              <td><span style="font-weight: 600; color: #212529;">${cat.nombre}</span></td>
              <td><span style="color: #6c757d; font-size: 0.9rem;">${cat.descripcion || 'Sin descripción'}</span></td>
              <td style="text-align: center;">
                <button class="btn-sesion" id="btn-editar-cat-${cat.id}" style="background-color: #ffc107; color: black; padding: 6px 12px; margin-right: 5px;">✏️</button>
                <button class="btn-sesion" id="btn-eliminar-cat-${cat.id}" style="background-color: #dc3545; padding: 6px 12px;">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div id="modal-abm-categoria" class="modal">
      <div class="modal-contenido" style="max-width: 450px;">
        <span class="cerrar-modal" id="btn-cerrar-modal-cat">&times;</span>
        <h3 id="modal-cat-titulo" style="margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #f1f3f5; padding-bottom: 8px;"></h3>
        
        <form id="form-abm-categoria-real" class="form-auth">
          <input type="hidden" id="form-cat-id">

          <label for="form-cat-nombre">Nombre de la Categoría *</label>
          <input type="text" id="form-cat-nombre" class="select-pago" required placeholder="Ej: Bebidas, Postres">

          <label for="form-cat-descripcion" style="margin-top: 5px;">Descripción *</label>
          <textarea id="form-cat-descripcion" class="select-pago" required placeholder="Breve reseña para el cliente..." style="width:100%; height: 70px; font-family:inherit; resize:none; box-sizing:border-box;"></textarea>

          <label for="form-cat-imagen" style="margin-top: 5px;">URL de la Imagen *</label>
          <input type="text" id="form-cat-imagen" class="select-pago" required placeholder="https://ejemplo.com/foto.jpg">

          <button type="submit" class="btn-confirmar" style="width: 100%; margin-top: 15px; background-color: #28a745;">
            💾 Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  `;

  configurarEventosPanelCategorias();
}

function configurarEventosPanelCategorias() {
  document.getElementById('btn-cat-volver-dash')?.addEventListener('click', cargarAdminDashboard);

  // Apertura de formulario de creación
  document.getElementById('btn-nueva-categoria')?.addEventListener('click', () => {
    abrirModalFormulario();
  });

  // Enganche de botones de edición y eliminación por cada fila
  listaCategoriasGlobal.forEach(cat => {
    document.getElementById(`btn-editar-cat-${cat.id}`)?.addEventListener('click', () => {
      abrirModalFormulario(cat);
    });

    document.getElementById(`btn-eliminar-cat-${cat.id}`)?.addEventListener('click', () => {
      procesarEliminacionBackend(cat.id, cat.nombre);
    });
  });

  // Cerrar el modal formulario
  document.getElementById('btn-cerrar-modal-cat')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-abm-categoria');
    if (modal) modal.style.display = 'none';
  });
}

function abrirModalFormulario(categoria?: any) {
  const modal = document.getElementById('modal-abm-categoria');
  const titulo = document.getElementById('modal-cat-titulo');
  const form = document.getElementById('form-abm-categoria-real') as HTMLFormElement;

  if (!modal || !titulo || !form) return;

  form.reset();

  if (categoria) {
    // Si pasamos un objeto, es una edición de registro
    titulo.innerText = `✏️ Modificar Categoría (# ${categoria.id})`;
    (document.getElementById('form-cat-id') as HTMLInputElement).value = categoria.id;
    (document.getElementById('form-cat-nombre') as HTMLInputElement).value = categoria.nombre;
    (document.getElementById('form-cat-descripcion') as HTMLInputElement).value = categoria.descripcion;
    (document.getElementById('form-cat-imagen') as HTMLInputElement).value = categoria.imagen;
  } else {
    // Si viene vacío, es un registro nuevo
    titulo.innerText = `➕ Registrar Nueva Categoría`;
    (document.getElementById('form-cat-id') as HTMLInputElement).value = "";
  }

  modal.style.display = 'block';
  
  // Desenganchamos listeners viejos del submit para que no se dupliquen
  form.onsubmit = null;
  form.onsubmit = (e) => {
    e.preventDefault();
    procesarGuardadoBackend();
  };
}

function esUrlValida(texto: string): boolean {
  // ● Validación: URL válida para imagen exigida por la rúbrica
  try {
    new URL(texto);
    return true;
  } catch (_) {
    return false;
  }
}

async function procesarGuardadoBackend() {
  const idStr = (document.getElementById('form-cat-id') as HTMLInputElement).value;
  const nombre = (document.getElementById('form-cat-nombre') as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById('form-cat-descripcion') as HTMLInputElement).value.trim();
  const imagen = (document.getElementById('form-cat-imagen') as HTMLInputElement).value.trim();

  // Ejecutamos la validación de formato de URL exigida
  if (!esUrlValida(imagen)) {
    alert("⚠️ La dirección de la imagen ingresada no es válida. Verifique que comience con http:// o https://");
    return;
  }

  const payload = { nombre, descripcion, imagen };
  const esEdicion = idStr !== "";

  // Selección dinámica de endpoints y verbos según rúbrica (POST para crear, PUT para editar)
  const urlApi = esEdicion ? `http://localhost:8080/api/categories/${idStr}` : 'http://localhost:8080/api/categories';
  const metodoHttp = esEdicion ? 'PUT' : 'POST';

  try {
    const respuesta = await fetch(urlApi, {
      method: metodoHttp,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (respuesta.ok) {
      alert(esEdicion ? "🎉 Cambios guardados de forma exitosa." : "🎉 Nueva categoría registrada en el menú.");
      const modal = document.getElementById('modal-abm-categoria');
      if (modal) modal.style.display = 'none';
      
      cargarGestionCategorias(); // Recarga reactiva de la grilla
    } else {
      const errorTxt = await respuesta.text();
      alert(`⚠️ No se pudo guardar la información: ${errorTxt || 'Verifique los datos.'}`);
    }
  } catch (error) {
    console.error(error);
    alert("❌ Error de red al intentar comunicarse con el servidor.");
  }
}

async function procesarEliminacionBackend(id: number, nombre: string) {
  // ● Confirmación antes de ejecutar la acción DELETE requerida por la cátedra
  const confirmar = confirm(`¿Está seguro de que desea eliminar la categoría "${nombre}"? Esta acción podría ocultar sus productos asociados.`);
  if (!confirmar) return;

  try {
    // DELETE /api/categories/{id}
    const respuesta = await fetch(`http://localhost:8080/api/categories/${id}`, {
      method: 'DELETE'
    });

    if (respuesta.ok) {
      alert("🗑️ Categoría dada de baja de manera correcta.");
      cargarGestionCategorias(); // Recarga reactiva
    } else {
      const errorTxt = await respuesta.text();
      alert(`⚠️ No se pudo eliminar la categoría seleccionada: ${errorTxt}`);
    }
  } catch (error) {
    console.error(error);
    alert("❌ Error de red al intentar eliminar el registro.");
  }
}