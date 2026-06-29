import { cargarHomeStore } from '../homeStore.ts';

export function cargarDetalleProducto(producto: any) {
  const contenedor = document.getElementById('contenido-pagina');
  if (!contenedor) return;

  // Renderizamos la estructura de Detalle Extendido usando las clases de tu CSS unificado
  contenedor.innerHTML = `
    <div class="admin-dashboard-container" style="max-width: 900px;">
      
      <button id="btn-volver-catalogo" class="btn-sesion" style="margin-bottom: 20px; background-color: #6c757d;">
        🔙 Volver al Catálogo
      </button>

      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="detalle-layout">
          
          <img src="${producto.imagen}" alt="${producto.nombre}" class="detalle-img" style="height: 320px;">

          <div class="detalle-info" style="height: 320px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="badge-estado terminado" style="font-size: 0.8rem; margin-bottom: 10px;">ID Producto: # ${producto.id}</span>
              <h2 style="margin: 10px 0 5px 0; font-size: 1.8rem;">${producto.nombre}</h2>
              <p style="color: #6c757d; line-height: 1.5; font-size: 0.95rem; margin-bottom: 15px;">
                ${producto.descripcion}
              </p>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 15px;">
                <span class="detalle-precio">$ ${producto.precio}</span>
                
                <span class="badge-estado ${producto.stock > 0 ? 'terminado' : 'pendiente'}">
                  ${producto.stock > 0 ? `🔥 ¡Disponible! (${producto.stock} u.)` : '❌ Agotado temporalmente'}
                </span>
              </div>

              <div style="margin-top: 20px; display: flex; gap: 15px; align-items: center;">
                <div style="width: 35%;">
                  <label style="font-size: 0.8rem; font-weight: bold; display: block; margin-bottom: 5px;">Cantidad:</label>
                  <input type="number" id="input-cantidad-detalle" class="select-pago" value="1" min="1" max="${producto.stock}" ${producto.stock === 0 ? 'disabled' : ''}>
                </div>
                
                <div style="width: 65%; padding-top: 22px;">
                  <button id="btn-agregar-al-carrito-real" class="btn-confirmar" style="width: 100%;" ${producto.stock === 0 ? 'disabled' : ''}>
                    🛒 Añadir al Carrito
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  // Enganchamos los listeners del componente
  document.getElementById('btn-volver-catalogo')?.addEventListener('click', cargarHomeStore);
  document.getElementById('btn-agregar-al-carrito-real')?.addEventListener('click', () => {
    procesarInsercionAlCarrito(producto);
  });
}

function CollegeBadgeCounterActualizar() {
  // Función auxiliar para actualizar el numerito rojo flotante del navbar superior instantáneamente
  const carrito = JSON.parse(localStorage.getItem('carrito_foodstore') || '[]');
  const total = carrito.reduce((acc: number, item: any) => acc + item.cantidad, 0);
  const badge = document.getElementById('badge-contador-carrito');
  if (badge) badge.innerText = total.toString();
}

function procesarInsercionAlCarrito(producto: any) {
  const inputCant = document.getElementById('input-cantidad-detalle') as HTMLInputElement;
  const cantidadAAgregar = Number(inputCant.value);

  // Validación rápida en el cliente
  if (cantidadAAgregar <= 0 || cantidadAAgregar > producto.stock) {
    alert("❌ Cantidad seleccionada inválida o supera el stock disponible en cocina.");
    return;
  }

  // ● Sistema de carrito: Funcional con persistencia estricta en localStorage
  const carritoActual = JSON.parse(localStorage.getItem('carrito_foodstore') || '[]');

  const existeIndex = carritoActual.findIndex((item: any) => item.productoId === producto.id);

  if (existeIndex !== -1) {
    // Si ya existía el plato en la bolsa, controlamos que la suma no quiebre el stock total
    const nuevaCantidadTotal = carritoActual[existeIndex].cantidad + cantidadAAgregar;
    if (nuevaCantidadTotal > producto.stock) {
      alert(`⚠️ No podés agregar más unidades. Ya tenés ${carritoActual[existeIndex].cantidad} en el carrito y el stock máximo es de ${producto.stock}.`);
      return;
    }
    carritoActual[existeIndex].cantidad = nuevaCantidadTotal;
  } else {
    // Si es un producto nuevo en el carrito, lo insertamos con la estructura limpia
    carritoActual.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidadAAgregar
    });
  }

  // Guardamos en el disco de la compu
  localStorage.setItem('carrito_foodstore', JSON.stringify(carritoActual));
  
  // Actualizamos visualmente el badge del botón amarillo superior sin refrescar
  CollegeBadgeCounterActualizar();

  alert(`🎉 ¡Agregado! Sumaste ${cantidadAAgregar} "${producto.nombre}" a tu orden.`);
}