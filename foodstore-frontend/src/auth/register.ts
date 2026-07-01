import { renderizarApp } from '../main.ts';
import { cargarPantallaLogin } from './login.ts';

export function cargarPantallaRegistro() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    <div class="auth-container" style="max-width: 400px;">
      <h2>📝 Registro de Cliente - Food Store</h2>
      <p style="color: #6c757d; font-size: 0.85rem; margin-bottom: 20px; text-align:center;">
        Cree su cuenta para empezar a comprar. Solo se permite el registro de clientes.
      </p>

      <form id="form-registro-real" class="form-auth">
        <div style="display:flex; gap:10px;">
          <div style="width:50%;">
            <label>Nombre *</label>
            <input type="text" id="reg-nombre" class="select-pago" required placeholder="Juan">
          </div>
          <div style="width:50%;">
            <label>Apellido *</label>
            <input type="text" id="reg-apellido" class="select-pago" required placeholder="Perez">
          </div>
        </div>

        <label style="margin-top:10px; display:block;">Correo Electrónico *</label>
        <input type="email" id="reg-mail" class="select-pago" required placeholder="juan@mail.com" style="width:100%;">

        <label style="margin-top:10px; display:block;">Celular</label>
        <input type="text" id="reg-celular" class="select-pago" placeholder="351X_XXXXXX" style="width:100%;">

        <label style="margin-top:10px; display:block;">Contraseña * (Mínimo 6 caracteres)</label>
        <input type="password" id="reg-password" class="select-pago" required minlength="6" placeholder="••••••••" style="width:100%; margin-bottom:20px;">

        <button type="submit" class="btn-confirmar" style="width:100%; background-color:#28a745;">Registrarse y Entrar</button>
      </form>

      <div style="margin-top:15px; text-align:center; font-size:0.9rem;">
        <a href="#" id="link-ir-al-login" style="color:#007bff; text-decoration:none;">¿Ya tiene cuenta? Inicie sesión</a>
      </div>
    </div>
  `;

  document.getElementById('link-ir-al-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    cargarPantallaLogin();
  });

  document.getElementById('form-registro-real')?.addEventListener('submit', procesarRegistroBackend);
}

async function procesarRegistroBackend(e: Event) {
  e.preventDefault();

  const nombre = (document.getElementById('reg-nombre') as HTMLInputElement).value;
  const apellido = (document.getElementById('reg-apellido') as HTMLInputElement).value;
  const mail = (document.getElementById('reg-mail') as HTMLInputElement).value;
  const celular = (document.getElementById('reg-celular') as HTMLInputElement).value;
  const contrasena = (document.getElementById('reg-password') as HTMLInputElement).value;

  const nuevoUsuarioDto = {
    nombre,
    apellido,
    mail,
    celular,
    contrasena
  };

  try {
    //POST a register
    const respuesta = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoUsuarioDto)
    });

    if (respuesta.ok) {
      const usuarioCreado = await respuesta.json();
      alert("¡Registro exitoso en la base de datos H2!");

      //Auto-login para despues del registro
      const sesionAutoLogin = {
        id: usuarioCreado.id,
        nombre: usuarioCreado.nombre + " " + usuarioCreado.apellido,
        rol: usuarioCreado.rol 
      };

      localStorage.setItem('usuario_sesion', JSON.stringify(sesionAutoLogin));
      
      
      renderizarApp();
    } else {
      const errorMsg = await respuesta.text();
      alert(`Error al registrar: ${errorMsg}`);
    }
  } catch (error) {
    console.error(error);
    alert("Error de red al intentar registrar el usuario.");
  }
}