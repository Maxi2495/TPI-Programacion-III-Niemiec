-- 1. Categorías (Inyectamos la fecha actual con NOW() para satisfacer la restricción)
INSERT INTO categorias (id, eliminado, created_at, nombre, descripcion) VALUES (1, false, NOW(), 'Hamburguesas', 'Hamburguesas artesanales premium');
INSERT INTO categorias (id, eliminado, created_at, nombre, descripcion) VALUES (2, false, NOW(), 'Pizzas', 'Pizzas al horno de barro');

-- 2. Productos (Hacemos lo mismo vinculando los campos obligatorios heredados de Base)
INSERT INTO productos (id, eliminado, created_at, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (1, false, NOW(), 'Hamburguesa Clasica', 4500.0, 'Carne 150g, lechuga y tomate', 50, 'https://foodish-api.com/images/burger/burger1.jpg', true, 1);
INSERT INTO productos (id, eliminado, created_at, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (2, false, NOW(), 'Hamburguesa Doble', 6200.0, 'Doble carne con cheddar y panceta', 40, 'https://foodish-api.com/images/burger/burger2.jpg', true, 1);
INSERT INTO productos (id, eliminado, created_at, nombre, precio, descripcion, stock, imagen, disponible, categoria_id) VALUES (3, false, NOW(), 'Pizza Mozzarella', 3800.0, 'Mozzarella, salsa de tomate y oregano', 25, 'https://foodish-api.com/images/pizza/pizza1.jpg', true, 2);