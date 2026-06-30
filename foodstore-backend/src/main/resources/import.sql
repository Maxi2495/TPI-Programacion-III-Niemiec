-- Datos de prueba para evaluar la funcionalidad de la aplicacion

-- Categorías
INSERT INTO categorias (id, eliminado, created_at, version, nombre, descripcion) VALUES (1, false, NOW(), 0, 'Hamburguesas', 'Hamburguesas artesanales premium');
INSERT INTO categorias (id, eliminado, created_at, version, nombre, descripcion) VALUES (2, false, NOW(), 0, 'Pizzas', 'Pizzas al horno de barro');

-- Productos
INSERT INTO productos (id, eliminado, created_at, version, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (1, false, NOW(), 0, 'Hamburguesa Clasica', 4500.0, 'Carne 150g, lechuga y tomate', 50, 'https://foodish-api.com/images/burger/burger1.jpg', true, 1);
INSERT INTO productos (id, eliminado, created_at, version, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (2, false, NOW(), 0, 'Hamburguesa Doble', 6200.0, 'Doble carne con cheddar y panceta', 40, 'https://foodish-api.com/images/burger/burger2.jpg', true, 1);
INSERT INTO productos (id, eliminado, created_at, version, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (3, false, NOW(), 0, 'Pizza Mozzarella', 3800.0, 'Mozzarella, salsa de tomate y oregano', 25, 'https://foodish-api.com/images/pizza/pizza1.jpg', true, 2);

-- Usuarios


-- Generador automatico para que no se superponga con los elementos creados.
ALTER TABLE categorias ALTER COLUMN id RESTART WITH 3;
ALTER TABLE productos ALTER COLUMN id RESTART WITH 4;
ALTER TABLE usuarios ALTER COLUMN id RESTART WITH 3;