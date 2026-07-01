package com.utn.foodstore.service;

import com.utn.foodstore.dto.categoria.CategoriaCreate;
import com.utn.foodstore.dto.categoria.CategoriaDto;
import com.utn.foodstore.dto.categoria.CategoriaEdit;
import com.utn.foodstore.exception.ResourceNotFoundException;
import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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
        nuevaCategoria.setImagen(dto.getImagen());

        Categoria guardada = categoriaRepository.save(nuevaCategoria);

        // dto de vuelta a la web
        return CategoriaDto.builder()
                .id(guardada.getId())
                .nombre(guardada.getNombre())
                .descripcion(guardada.getDescripcion())
                .imagen(guardada.getImagen())
                .build();
    }

    public List<CategoriaDto> listarActivas() {
        //trae TODAS las categorias que no esten dadas de baja
        List<Categoria> categoriasReales = categoriaRepository.findByEliminadoFalse();

        //transformO Entidades a DTOs
        return categoriasReales.stream()
                .map(cat -> CategoriaDto.builder()
                        .id(cat.getId())
                        .nombre(cat.getNombre())
                        .descripcion(cat.getDescripcion())
                        .imagen(cat.getImagen())
                        .build())
                .toList(); //A lista.
    }


    private Categoria obtenerEntidad(Long id) {
        return categoriaRepository.findByIdAndEliminadoFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
    }

    // HU-003: Buscar por ID
    public CategoriaDto buscarPorId(Long id) {
        Categoria cat = obtenerEntidad(id);
        return CategoriaDto.builder().id(cat.getId()).nombre(cat.getNombre())
                .descripcion(cat.getDescripcion()).imagen(cat.getImagen()).build();
    }

    // HU-004: Actualizar
    public CategoriaDto actualizar(Long id, CategoriaEdit dto) {
        Categoria cat = obtenerEntidad(id);

        //Solo actualizamos lo que el cliente nos mandoa
        dto.applyTo(cat);

        Categoria guardada = categoriaRepository.save(cat);
        return CategoriaDto.builder().id(guardada.getId()).nombre(guardada.getNombre())
                .descripcion(guardada.getDescripcion()).imagen(guardada.getImagen()).build();
    }

    // HU-005: Baja Lógica
    public void eliminarLogico(Long id) {
        Categoria cat = obtenerEntidad(id);
        cat.setEliminado(true); //No borro fisicamente. La "marco" como borrada
        categoriaRepository.save(cat);
    }
}//Fin de clase
