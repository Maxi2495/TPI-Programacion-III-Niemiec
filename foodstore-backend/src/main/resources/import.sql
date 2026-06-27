-- 1. Categorías (Agregamos la columna version con valor inicial 0)
INSERT INTO categorias (id, eliminado, created_at, version, nombre, descripcion) VALUES (1, false, NOW(), 0, 'Hamburguesas', 'Hamburguesas artesanales premium');
INSERT INTO categorias (id, eliminado, created_at, version, nombre, descripcion) VALUES (2, false, NOW(), 0, 'Pizzas', 'Pizzas al horno de barro');

-- 2. Productos (Hacemos lo mismo para cada producto)
INSERT INTO productos (id, eliminado, created_at, version, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (1, false, NOW(), 0, 'Hamburguesa Clasica', 4500.0, 'Carne 150g, lechuga y tomate', 50, 'https://foodish-api.com/images/burger/burger1.jpg', true, 1);
INSERT INTO productos (id, eliminado, created_at, version, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (2, false, NOW(), 0, 'Hamburguesa Doble', 6200.0, 'Doble carne con cheddar y panceta', 40, 'https://foodish-api.com/images/burger/burger2.jpg', true, 1);
INSERT INTO productos (id, eliminado, created_at, version, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (3, false, NOW(), 0, 'Pizza Mozzarella', 3800.0, 'Mozzarella, salsa de tomate y oregano', 25, 'https://foodish-api.com/images/pizza/pizza1.jpg', true, 2);

-- 3. Usuarios (Agregamos version con valor 0 para Juan Perez)
INSERT INTO usuarios (id, eliminado, created_at, version, nombre, apellido, mail, celular, rol, contrasena) VALUES (2, false, NOW(), 0, 'Juan', 'Perez', 'cliente@food.com', '1198765432', 'USUARIO', 'cliente123');