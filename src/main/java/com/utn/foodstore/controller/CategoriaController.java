package com.utn.foodstore.controller;

import com.utn.foodstore.dto.categoria.CategoriaCreate;
import com.utn.foodstore.dto.categoria.CategoriaDto;
import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController //Atiende peticiones de internet
@RequestMapping("/api/categories") // La URL donde atiende
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
}