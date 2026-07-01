package com.utn.foodstore.controller;

import com.utn.foodstore.dto.producto.ProductoCreate;
import com.utn.foodstore.dto.producto.ProductoDto;
import com.utn.foodstore.dto.producto.ProductoEdit;
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


    @GetMapping //Envia solo los productosdisponibles al cliente
    public ResponseEntity<List<ProductoDto>> listar() {
        return ResponseEntity.ok(productoService.listarParaTienda());
    }

    @GetMapping("/admin-list") //Envia todo (disponible y no disponible) solo al admin
    public ResponseEntity<List<ProductoDto>> listarParaAdmin() {

        return ResponseEntity.ok(productoService.listarActivos());
    }

    //HU-004: PUT editar e inhabilitar disponibilidad
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDto> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoEdit dto) {
        // Nota: Si en tu service el método se llama distinto (ej: editar), cambialo acá.
        return ResponseEntity.ok(productoService.actualizar(id, dto));
    }

    //HU-005: DELETE baja o eliminacion de producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        // Nota: Si en tu service se llama eliminarLogico o darDeBaja, adaptalo al nombre exacto.
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/shop") //GET para que el cliente no vea lo inactivo del lado admin
    public ResponseEntity<List<ProductoDto>> listarParaTienda() {
        return ResponseEntity.ok(productoService.listarParaTienda());
    }

    //GET de Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    //GET de Listar por categoría
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProductoDto>> obtenerPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(productoService.listarPorCategoria(categoriaId));
    }
}