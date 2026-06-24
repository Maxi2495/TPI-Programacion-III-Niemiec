# Food Store - API REST (Trabajo Práctico Integrador)

**Alumno:** Maximiliano Niemiec
**Institución:** UTN - Tecnicatura Universitaria en Programación
**Materia:** Programación III

Este repositorio contiene el backend (API REST) del sistema Food Store, habiendo migrado la plantilla original de consola hacia una arquitectura moderna con Spring Boot, respetando el modelo de dominio y las relaciones JPA solicitadas en la rúbrica.

## 🔗 Enlaces de Entrega
* 🎥 **Video Demostrativo:** [Colocar Link a YouTube aquí]
* 📄 **Documentación PDF:** [Colocar Link a Drive o archivo aquí]

## 🛠️ Tecnologías Utilizadas
- **Java 21**
- **Spring Boot 3.2.5** (Web, Data JPA, Validation)
- **H2 Database** (Base de datos en archivo local)
- **Hibernate / JPA**
- **Lombok**

## 🏗️ Arquitectura
El proyecto fue refactorizado utilizando un diseño en capas:
- **Controllers:** Exponen los endpoints HTTP para la comunicación con el Frontend.
- **Services:** Centralizan la lógica de negocio y la transformación entre Entidades y DTOs para no exponer datos sensibles.
- **Repositories:** Interfaces de Spring Data JPA que extienden de un `BaseRepository` para estandarizar el Soft Delete (Baja lógica).
- **Models:** Entidades JPA con herencia de clase `Base` (`@MappedSuperclass`) y control de concurrencia optimista (`@Version`).

## 🚀 Cómo ejecutar el proyecto
1. Clonar el repositorio.
2. Abrir en IntelliJ IDEA o ejecutar vía terminal: `./gradlew bootRun`
3. El servidor iniciará en `http://localhost:8080`.