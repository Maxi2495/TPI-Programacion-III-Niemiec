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

    public List<CategoriaDto> listarActivas() {
        //trae TODAS las categorías que no estén dadas de baja
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

    // Método auxiliar (privado) para buscar la entidad y lanzar el error 404 si no existe o está eliminada
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
        if (dto.getNombre() != null) cat.setNombre(dto.getNombre());
        if (dto.getDescripcion() != null) cat.setDescripcion(dto.getDescripcion());
        if (dto.getImagen() != null) cat.setImagen(dto.getImagen());

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
