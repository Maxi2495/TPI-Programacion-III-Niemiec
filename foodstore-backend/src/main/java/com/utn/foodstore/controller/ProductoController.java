package com.utn.foodstore.controller;

import com.utn.foodstore.dto.producto.ProductoCreate;
import com.utn.foodstore.dto.producto.ProductoDto;
import com.utn.foodstore.service.PedidoService;
import com.utn.foodstore.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/products")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public ResponseEntity<ProductoDto> crear(@Valid @RequestBody ProductoCreate dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(dto));
    }


    @GetMapping
    public ResponseEntity<List<ProductoDto>> listar() {
        return ResponseEntity.ok(productoService.listarActivos());
    }

    // 🛠️ HU-004: PUT /api/products/{id} - Editar e inhabilitar disponibilidad
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDto> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoCreate dto) {
        // Nota: Si en tu service el método se llama distinto (ej: editar), cambialo acá.
        return ResponseEntity.ok(productoService.actualizar(id, dto));
    }

    // 🛠️ HU-005: DELETE /api/products/{id} - Baja o eliminación de producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        // Nota: Si en tu service se llama eliminarLogico o darDeBaja, adaptalo al nombre exacto.
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}