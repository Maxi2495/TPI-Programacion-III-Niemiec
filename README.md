# Food Store - Sistema de Gestión de Pedidos de Comida

Trabajo Práctico Integrador - **Programación 3** | Tecnicatura Universitaria en Programación (UTN)

Aplicación web full stack (ecommerce) para la gestión de un negocio de comidas: catalogo de productos, carrito de compras, pedidos y panel de administracion.

## Tecnologías

**Backend:** Spring Boot 3.2.5 · Java 21 · Spring Data JPA (Hibernate) · Spring Security Crypto (BCrypt) · Base de datos H2 (archivo local) · SpringDoc OpenAPI (Swagger)
**Frontend:** TypeScript · Vite · HTML5 · CSS3

## Requisitos previos

- JDK 21 o superior
- Node.js 18+ y npm
- No requiere instalar motor de base de datos (usa H2 con archivo local)

## Instalación y ejecución

### Backend

```bash
cd foodstore-backend
./gradlew bootRun
```

El servidor va a levantar en `http://localhost:8080`. Al iniciar, la clase "UserLoad" crea automáticamente los usuarios de prueba y el archivo "import.sql" carga categorías y productos de ejemplo. En cada arranque que haga el sistema, los archivos se crearan.

Documentación Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Frontend

```bash
cd foodstore-frontend
npm install
npm run dev
```

La aplicación está disponible en `http://localhost:5173`.

## Usuarios de prueba

| Tipo de usuario | Correo | Contraseña |
|---|---|---|
| ADMIN | admin@food.com | admin123 |
| USUARIO | cliente@food.com | cliente123 |

Tambien se puede registrar un usuario nuevo desde "register" (Siempre se crea usuario. No tiene permitido ADMIN).

## Base de datos

Se usa H2 con archivo local (./data/pedidos_db). El esquema se recrea en cada arranque de la aplicaicon. Consola web: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/pedidos_db`, usuario `sa`, sin contraseña).

## Estructura del proyecto

```
foodstore-backend/    # API REST (Spring Boot)
  └── src/main/java/com/utn/foodstore/
      ├── config/       # CORS, Security, carga inicial de usuarios
      ├── controller/   # Endpoints REST
      ├── dto/          # Objetos de transferencia (Create/Edit/Dto)
      ├── exception/    # Manejo de errores
      ├── model/        # Entidades
      ├── repository/   # Acceso a datos
      └── service/      # Reglas del negocio

foodstore-frontend/   # Cliente web
  └── src/
      ├── auth/         # Login & Registro
      └── pages/
          ├── store/    # Catalogo, detalle de producto, carrito
          ├── client/   # Historial de pedidos del usuario
          └── admin/    # Panel de administración
```

## Endpoints

| Módulo | Endpoint | Descripción |
|---|---|---|
| Auth | `POST /api/auth/register` / `login` | Registro e inicio de sesión |
| Categorías | `GET/POST/PUT/DELETE /api/categories` | CRUD de categorías |
| Productos | `GET/POST/PUT/DELETE /api/products` | CRUD de productos |
| Usuarios | `GET/PUT/DELETE /api/users` | Administración de usuarios |
| Pedidos | `GET/POST/PUT/DELETE /api/orders` | Gestión de pedidos |
| Pedidos | `PATCH /api/orders/{id}/status` | Cambio de estado (admin) |
| Pedidos | `GET /api/orders/usuario/{id}` | Historial de pedidos del cliente |

## Seguridad

Las contraseñas se almacenan encriptadas con BCrypt. No se implementa autenticación con JWT/tokens de sesión: el frontend guarda los datos del usuario logueado en `localStorage`. Esta configuracion de seguridad es meramente para fines educativos.

## Video demostrativo

[Enlace al video](PENDIENTE)

## Documentación

[Informe técnico completo (PDF)](PENDIENTE)

## Autor

**[Maximiliano Niemiec]** — Tecnicatura Universitaria en Programación, UTN
