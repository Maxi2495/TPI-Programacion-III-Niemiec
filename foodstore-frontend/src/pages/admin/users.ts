import { cargarAdminDashboard } from './adminHome.ts';
import { usuarioLogueado } from '../../main.ts';

let listaUsuariosGlobal: any[] = [];

export async function cargarGestionUsuarios() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Cargando clientes...</div>`;

  try {
    //GET /api/users 
    const respuesta = await fetch('http://localhost:8080/api/users');
    listaUsuariosGlobal = await respuesta.json();

    renderizarPanelUsuarios(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error al conectar con la administración de usuarios.</p>`;
  }
}

function renderizarPanelUsuarios(contenedor: HTMLElement) {
  contenedor.innerHTML = `
    <div class="admin-dashboard-container" style="max-width: 1000px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2>👥 Gestión y Auditoría de Usuarios</h2>
          <p style="color: #6c757d; margin: 0; font-style: italic;">Administre los clientes registrados en la plataforma.</p>
        </div>
      </div>

      <button id="btn-users-volver-dash" class="btn-sesion" style="margin-bottom: 20px; background-color: #6c757d;">
        🔙 Volver al Dashboard
      </button>

      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th style="width: 60px;">ID</th>
            <th>Nombre Completo</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th style="width: 100px; text-align: center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${listaUsuariosGlobal.map(u => `
            <tr>
              <td><strong># ${u.id}</strong></td>
              <td><span style="font-weight: 600; color: #212529;">${u.nombre} ${u.apellido}</span></td>
              <td>${u.mail}</td>
              <td>${u.celular || '-'}</td>
              <td>
                <span class="badge-estado ${u.rol === 'ADMIN' ? 'confirmado' : 'pendiente'}">
                  ${u.rol}
                </span>
              </td>
              <td style="text-align: center;">
                ${u.id !== usuarioLogueado?.id ? 
                  `<button class="btn-sesion btn-borrar-user" data-id="${u.id}" data-nombre="${u.nombre} ${u.apellido}" style="background-color: #dc3545; padding: 6px 12px;">🗑️ Baja</button>` 
                  : '<span style="font-size:0.8rem; color:#6c757d;">Tu Sesión</span>'
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-users-volver-dash')?.addEventListener('click', cargarAdminDashboard);

  //botonera borrar
  document.querySelectorAll('.btn-borrar-user').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const idStr = target.getAttribute('data-id');
      const nombre = target.getAttribute('data-nombre');
      if (idStr && nombre) {
        ejecutarBajaLogica(Number(idStr), nombre);
      }
    });
  });
}

async function ejecutarBajaLogica(id: number, nombreCompleto: string) {
  const confirmar = confirm(`¿Está seguro que desea dar de baja al usuario "${nombreCompleto}"?\n\nLos pedidos asociados a este cliente permanecerán en el sistema por auditoría.`);
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`http://localhost:8080/api/users/${id}`, {
      method: 'DELETE'
    });

    if (respuesta.ok || respuesta.status === 204) {
      alert("Usuario dado de baja correctamente");
      cargarGestionUsuarios(); 
    } else if (respuesta.status === 404) {
      alert("Escenario 2: El usuario no existe");
    } else {
      const errorTxt = await respuesta.text();
      alert(`Error inesperado: ${errorTxt}`);
    }
  } catch (error) {
    console.error(error);
    alert("Error de red al intentar comunicarse con el servidor.");
  }
}