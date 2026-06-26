package com.utn.foodstore.service;

import com.utn.foodstore.dto.producto.ProductoCreate;
import com.utn.foodstore.dto.producto.ProductoDto;
import com.utn.foodstore.exception.ResourceNotFoundException;
import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.model.Producto;
import com.utn.foodstore.repository.CategoriaRepository;
import com.utn.foodstore.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    // Inyección de ambos repositorios en el constructor
    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // HU-011: Crear Producto
    public ProductoDto crear(ProductoCreate dto) {
        //Aca se busca la categoria en la BD
        Categoria categoria = categoriaRepository.findByIdAndEliminadoFalse(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        // Mapeamos el DTO de entrada a la Entidad real
        Producto nuevoProducto = Producto.builder()
                .nombre(dto.getNombre())
                .precio(dto.getPrecio())
                .descripcion(dto.getDescripcion())
                .stock(dto.getStock())
                .disponible(true) //Producto arrana visible
                .categoria(categoria) //La fk
                .build();

        Producto guardado = productoRepository.save(nuevoProducto);
        return mapearADto(guardado);
    }

    // HU-012: Listar Productos Activos
    public List<ProductoDto> listarActivos() {
        List<Producto> productos = productoRepository.findByEliminadoFalse();
        return productos.stream().map(this::mapearADto).toList();
    }

    // Transforma la entidad a DTO
    private ProductoDto mapearADto(Producto p) {
        return ProductoDto.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .precio(p.getPrecio())
                .descripcion(p.getDescripcion())
                .stock(p.getStock())
                .imagen(p.getImagen())
                .disponible(p.getDisponible())
                .categoriaId(p.getCategoria() != null ? p.getCategoria().getId() : null)
                .categoriaNombre(p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin Categoría")
                .build();
    }
}