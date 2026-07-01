import { renderizarApp } from '../main.ts';

export async function cargarPantallaLogin() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // formulario login
  app.innerHTML = `
    <div class="auth-container">
      <h2>🔐 Iniciar Sesión - Food Store</h2>
      <p style="color: #6c757d; font-size: 0.9rem; margin-bottom: 20px; text-align:center;">
        Ingresá tus credenciales de acceso.
      </p>
      
      <form id="form-login-real" class="form-auth">
        <label for="login-email">Correo Electrónico *</label>
        <input type="email" id="login-email" class="select-pago" required placeholder="ejemplo@mail.com" style="width: 100%; margin-bottom: 15px;">

        <label for="login-password">Contraseña *</label>
        <input type="password" id="login-password" class="select-pago" required placeholder="••••••••" style="width: 100%; margin-bottom: 20px;">

        <button type="submit" class="btn-confirmar" style="width: 100%;">Ingresar al Sistema</button>
      </form>
      
      <div style="margin-top: 15px; font-size: 0.8rem; color: #6c757d; text-align: center;">
        💡 <em>Credenciales Cliente: cliente@food.com / cliente123</em>
            <em>Credenciales Admin: admin@food.com / admnin123</em>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 0.9rem;">
        <a href="#" id="link-ir-al-registro" style="color: #28a745; text-decoration: none; font-weight: bold;">¿No tiene cuenta? Regístrese acá</a>
      </div>
    </div>
  `;

  
  document.getElementById('form-login-real')?.addEventListener('submit', procesarAutenticacionBackend);

  document.getElementById('link-ir-al-registro')?.addEventListener('click', (e) => {
    e.preventDefault();
    import('./register.ts').then(modulo => modulo.cargarPantallaRegistro());
  });
}

async function procesarAutenticacionBackend(e: Event) {
  e.preventDefault();

  const email = (document.getElementById('login-email') as HTMLInputElement).value;
  const contrasena = (document.getElementById('login-password') as HTMLInputElement).value;

  const datosLogin = {
    mail: email,
    contrasena: contrasena
  };

  try {
    const respuesta = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosLogin)
    });

    if (respuesta.ok) {
      const usuarioData = await respuesta.json();

      const sesionFormateada = {
        id: usuarioData.id,
        nombre: usuarioData.nombre + " " + usuarioData.apellido,
        rol: usuarioData.rol
      };

      localStorage.setItem('usuario_sesion', JSON.stringify(sesionFormateada));
      
      alert(`¡Bienvenido/a, ${sesionFormateada.nombre}!`);
      renderizarApp();
    } else {
      const errorMsg = await respuesta.text();
      alert(`Error de autenticación: ${errorMsg || 'Credenciales inválidas.'}`);
    }
  } catch (error) {
    console.error(error);
    alert("Error de red al intentar conectar.");
  }
}