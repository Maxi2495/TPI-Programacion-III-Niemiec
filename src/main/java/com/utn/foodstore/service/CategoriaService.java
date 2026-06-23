package com.utn.foodstore.service;

import com.utn.foodstore.dto.categoria.CategoriaCreate;
import com.utn.foodstore.dto.categoria.CategoriaDto;
import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;


    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public CategoriaDto crear(CategoriaCreate dto) {
        Categoria nuevaCategoria = new Categoria();
        nuevaCategoria.setNombre(dto.getNombre());
        nuevaCategoria.setDescripcion(dto.getDescripcion());
        nuevaCategoria.setImagen(dto.getImagen()); // El cable que faltaba

        Categoria guardada = categoriaRepository.save(nuevaCategoria);

        // Armamos el paquetito limpio para la web
        return CategoriaDto.builder()
                .id(guardada.getId())
                .nombre(guardada.getNombre())
                .descripcion(guardada.getDescripcion())
                .imagen(guardada.getImagen())
                .build();
    }
}//Fin de clase
