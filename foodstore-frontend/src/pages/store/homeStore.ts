import { cargarDetalleProducto } from './productDetail/productDetail.ts';
import { cargarCarritoStore } from './cart/cart.ts';
// Variables de estado local para el control reactivo del catálogo
let productosGlobal: any[] = [];
let categoriasGlobal: any[] = [];

let categoriaFiltroId: number | null = null;
let textoBusqueda: string = "";
let criterioOrden: string = "A-Z";
let sidebarVisibleMobile: boolean = false;

export async function cargarHomeStore() {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="padding: 20px;">⏳ Sincronizando catálogo con el servidor Java...</div>`;

  try {
    // 1. Consumo paralelo de los endpoints exigidos por la rúbrica
    const [resProductos, resCategorias] = await Promise.all([
      fetch('http://localhost:8080/api/products/shop'),
      fetch('http://localhost:8080/api/categories')
    ]);

    productosGlobal = await resProductos.json();
    categoriasGlobal = await resCategorias.json();

    renderizarEstructuraCatalogo(contenedor);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red; padding:20px;">Error al conectar con la API REST del Store.</p>`;
  }
}

function renderizarEstructuraCatalogo(contenedor: HTMLElement) {
  // Calculamos la cantidad de ítems que hay actualmente en el localStorage del carrito
  const carritoActual = JSON.parse(localStorage.getItem('carrito_foodstore') || '[]');
  const totalItemsCarrito = carritoActual.reduce((acc: number, item: any) => acc + item.cantidad, 0);

  contenedor.innerHTML = `
    <!-- Barra Superior de Control (Búsqueda, Orden y Carrito) -->
    <div class="store-topbar">
      <button id="btn-toggle-sidebar-mobile" class="btn-admin" style="display: none; background-color:#6c757d;">☰ Categorías</button>
      
      <div class="search-box-container" style="flex-grow: 1; max-width: 400px;">
        <input type="text" id="input-busqueda-realtime" placeholder="🔍 Buscar plato o hamburguesa..." class="select-pago" value="${textoBusqueda}">
      </div>

      <div class="filter-box-container">
        <select id="select-ordenamiento" class="select-pago">
          <option value="A-Z" ${criterioOrden === 'A-Z' ? 'selected' : ''}>🔤 Nombre: A-Z</option>
          <option value="Z-A" ${criterioOrden === 'Z-A' ? 'selected' : ''}>🔤 Nombre: Z-A</option>
          <option value="PRECIO_ASC" ${criterioOrden === 'PRECIO_ASC' ? 'selected' : ''}>💵 Precio: Menor a Mayor</option>
          <option value="PRECIO_DESC" ${criterioOrden === 'PRECIO_DESC' ? 'selected' : ''}>💵 Precio: Mayor a Menor</option>
        </select>
      </div>

      <!-- Badge del carrito con cantidad exigido por la cátedra -->
      <button id="btn-ir-al-carrito-page" class="btn-confirmar" style="position: relative; background-color: #ffc107; color: black; font-weight: bold;">
        🛒 Carrito 
        <span id="badge-contador-carrito" class="badge-flotante">${totalItemsCarrito}</span>
      </button>
    </div>

    <div class="store-layout-container" style="display: flex; gap: 20px; margin-top: 15px;">
      
      <!-- Sidebar de Categorías (GET /api/categories) -->
      <aside id="sidebar-categorias-store" class="sidebar-categories ${sidebarVisibleMobile ? 'visible' : ''}" style="width: 240px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h3 style="margin-bottom: 15px; font-size: 1.1rem; border-bottom: 2px solid #ddd; padding-bottom: 5px;">🍔 Categorías</h3>
        <ul style="list-style: none; padding: 0; display:flex; flex-direction:column; gap:8px;">
          <li>
            <button class="btn-categoria-link ${categoriaFiltroId === null ? 'activo' : ''}" id="btn-cat-todas">
              💥 Mostrar Todo
            </button>
          </li>
          ${categoriasGlobal.map(cat => `
            <li>
              <button class="btn-categoria-link ${categoriaFiltroId === cat.id ? 'activo' : ''}" id="btn-cat-${cat.id}">
                👉 ${cat.nombre}
              </button>
            </li>
          `).join('')}
        </ul>
      </aside>

      <!-- Panel Principal: Contador y Grid de Productos -->
      <main style="flex-grow: 1;">
        <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
          <!-- Contador exigido por la rúbrica -->
          <span id="contador-productos-encontrados" style="font-weight: bold; color: #495057; font-size: 0.95rem;"></span>
        </div>
        
        <!-- Grid de Productos -->
        <div id="grid-productos-store" class="productos-grid-layout"></div>
      </main>

    </div>
  `;

  configurarEventosCatalogo();
  ejecutarFiltradoYRenderizadoDeGrid();
}

function configurarEventosCatalogo() {
  // Listener de búsqueda en tiempo real
  document.getElementById('input-busqueda-realtime')?.addEventListener('input', (e) => {
    textoBusqueda = (e.target as HTMLInputElement).value.toLowerCase();
    ejecutarFiltradoYRenderizadoDeGrid();
  });

  // Listener de ordenamiento
  document.getElementById('select-ordenamiento')?.addEventListener('change', (e) => {
    criterioOrden = (e.target as HTMLSelectElement).value;
    ejecutarFiltradoYRenderizadoDeGrid();
  });

  // Listeners dinámicos para los botones de las categorías
  document.getElementById('btn-cat-todas')?.addEventListener('click', () => {
    categoriaFiltroId = null;
    marcarCategoriaActiva();
    ejecutarFiltradoYRenderizadoDeGrid();
  });

  categoriasGlobal.forEach(cat => {
    document.getElementById(`btn-cat-${cat.id}`)?.addEventListener('click', () => {
      categoriaFiltroId = cat.id;
      marcarCategoriaActiva();
      ejecutarFiltradoYRenderizadoDeGrid();
    });
  });

  // Botón para viajar a la pantalla del carrito
  document.getElementById('btn-ir-al-carrito-page')?.addEventListener('click', () => {
    cargarCarritoStore(); 
  });

  // Toggle para mobile
  document.getElementById('btn-toggle-sidebar-mobile')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar-categorias-store');
    if (sidebar) {
      sidebarVisibleMobile = !sidebarVisibleMobile;
      sidebar.classList.toggle('visible', sidebarVisibleMobile);
    }
  });
}

function marcarCategoriaActiva() {
  // Limpia clases activas previas
  document.querySelectorAll('.btn-categoria-link').forEach(btn => btn.classList.remove('activo'));
  
  if (categoriaFiltroId === null) {
    document.getElementById('btn-cat-todas')?.classList.add('activo');
  } else {
    document.getElementById(`btn-cat-${categoriaFiltroId}`)?.classList.add('activo');
  }
}

function ejecutarFiltradoYRenderizadoDeGrid() {
  const grid = document.getElementById('grid-productos-store');
  const contador = document.getElementById('contador-productos-encontrados');
  if (!grid || !contador) return;

  // 1. Fase de Filtrado (Categoría + Búsqueda por texto)
  let filtrados = productosGlobal.filter(p => {
    const cumpleCategoria = (categoriaFiltroId === null) || (p.categoriaId === categoriaFiltroId);
    const cumpleTexto = p.nombre.toLowerCase().includes(textoBusqueda) || p.descripcion.toLowerCase().includes(textoBusqueda);
    return cumpleCategoria && cumpleTexto;
  });

  // 2. Fase de Ordenamiento Funcional
  if (criterioOrden === 'A-Z') {
    filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (criterioOrden === 'Z-A') {
    filtrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
  } else if (criterioOrden === 'PRECIO_ASC') {
    filtrados.sort((a, b) => a.precio - b.precio);
  } else if (criterioOrden === 'PRECIO_DESC') {
    filtrados.sort((a, b) => b.precio - a.precio);
  }

  // 3. Renderizar el contador requerido
  contador.innerText = `📋 Se encontraron ${filtrados.length} productos disponibles`;

  // 4. Renderizar el Grid de tarjetas estructurales
  if (filtrados.length === 0) {
    grid.innerHTML = `<p style="padding: 20px; color: #6c757d;">No se encontraron platos que coincidan con los filtros aplicados.</p>`;
    return;
  }

  grid.innerHTML = filtrados.map(p => `
    <div class="tarjeta-producto" id="card-producto-${p.id}" style="border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; background: white; cursor: pointer; transition: transform 0.2s;">
      <img src="${p.imagen}" alt="${p.nombre}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
      <h4 style="margin: 0 0 5px 0; font-size: 1.1rem;">${p.nombre}</h4>
      <p style="font-size: 0.85rem; color: #6c757d; min-height: 40px; margin: 0 0 10px 0; line-height: 1.3;">${p.descripcion}</p>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <span style="font-weight: bold; color: #28a745; font-size: 1.1rem;">$ ${p.precio}</span>
        
        <!-- Badge de disponibilidad exigido -->
        <span class="badge-estado ${p.stock > 0 ? 'terminado' : 'pendiente'}" style="font-size: 0.75rem; padding: 3px 8px;">
          ${p.stock > 0 ? 'Disponible' : 'Sin Stock'}
        </span>
      </div>
    </div>
  `).join('');

  // Enganchamos el clic para ir al detalle extendido (Requerimiento de la rúbrica)
  filtrados.forEach(p => {
    document.getElementById(`card-producto-${p.id}`)?.addEventListener('click', () => {
      abrirModalDetalleProducto(p);
    });
  });
}

function abrirModalDetalleProducto(producto: any) {
  cargarDetalleProducto(producto);
}