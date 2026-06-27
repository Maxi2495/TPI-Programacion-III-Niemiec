import './style.css';

//Para traer los productos del Backend
async function cargarProductos() {
  try {
    //peticion de datos a la api hecha en java
    const respuesta = await fetch('http://localhost:8080/api/products');
    const productos = await respuesta.json();
    
    renderizarProductos(productos);
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    // Agregamos esto para ver el error en pantalla si falla
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app) app.innerHTML = `<p style="color:red">Error de conexión con el backend: ${error}</p>`;
  } }


//renderizacion
function renderizarProductos(productos: any[]) {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (app) {
    let html = `<header><h1>🍔 Food Store - Catálogo</h1></header><main class="grid-productos">`;
    
    productos.forEach(producto => {
      html += `
        <div class="tarjeta-producto">
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion}</p>
          <p><strong>$ ${producto.precio}</strong></p>
          <button>🛒 Agregar al carrito</button>
        </div>
      `;
    });
    
    html += `</main>`;
    app.innerHTML = html;
  }
}

// 3. Ejecutamos al cargar la página
cargarProductos();