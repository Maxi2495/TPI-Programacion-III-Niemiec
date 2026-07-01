package com.utn.foodstore.controller;

import com.utn.foodstore.dto.categoria.CategoriaCreate;
import com.utn.foodstore.dto.categoria.CategoriaDto;
import com.utn.foodstore.dto.categoria.CategoriaEdit;
import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController //Atiende peticiones de internet
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/categories") //La URL donde atiende
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @PostMapping
    public ResponseEntity<CategoriaDto> crearCategoria(@Valid @RequestBody CategoriaCreate dto) {
        CategoriaDto creada = categoriaService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);

    }

    @GetMapping // Atiende peticiones GET
    public ResponseEntity<List<CategoriaDto>> listarCategorias() {
        List<CategoriaDto> lista = categoriaService.listarActivas();


        return ResponseEntity.status(HttpStatus.OK).body(lista);
    }

    // HU-003: GET
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id));
    }

    // HU-004: PUT
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDto> actualizar(@PathVariable Long id, @RequestBody CategoriaEdit dto) {
        return ResponseEntity.ok(categoriaService.actualizar(id, dto));
    }

    // HU-005: DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        categoriaService.eliminarLogico(id);
        return ResponseEntity.noContent().build(); 
    }
}//Fin de clase
