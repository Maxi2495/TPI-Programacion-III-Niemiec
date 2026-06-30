package com.utn.foodstore.service;

import com.utn.foodstore.dto.producto.ProductoCreate;
import com.utn.foodstore.dto.producto.ProductoDto;
import com.utn.foodstore.exception.ResourceNotFoundException;
import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.model.Producto;
import com.utn.foodstore.repository.CategoriaRepository;
import com.utn.foodstore.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // HU-011: Crear Producto
    @Transactional
    public ProductoDto crear(ProductoCreate dto) {
        Categoria categoria = categoriaRepository.findByIdAndEliminadoFalse(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        Producto nuevoProducto = Producto.builder()
                .nombre(dto.getNombre())
                .precio(dto.getPrecio())
                .descripcion(dto.getDescripcion())
                .stock(dto.getStock())
                // Si la imagen viene vacía, le clavamos un placeholder
                .imagen(dto.getImagen() == null || dto.getImagen().isBlank() ? "https://placehold.co/300" : dto.getImagen())
                // Si disponible viene null, por defecto arranca en true
                .disponible(dto.getDisponible() != null ? dto.getDisponible() : true)
                .eliminado(false)
                .categoria(categoria)
                .build();

        Producto guardado = productoRepository.save(nuevoProducto);
        return mapearADto(guardado);
    }

    // HU-012: Listar Productos Activos
    public List<ProductoDto> listarActivos() {
        List<Producto> productos = productoRepository.findByEliminadoFalse();
        return productos.stream().map(this::mapearADto).toList();
    }

    @Transactional
    public ProductoDto actualizar(Long id, ProductoCreate dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        Categoria categoria = categoriaRepository.findByIdAndEliminadoFalse(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        producto.setNombre(dto.getNombre());
        producto.setPrecio(dto.getPrecio());
        producto.setDescripcion(dto.getDescripcion());
        producto.setStock(dto.getStock());
        producto.setCategoria(categoria);

        // Mapeo directo y transparente desde el DTO modificado
        producto.setImagen(dto.getImagen());
        producto.setDisponible(dto.getDisponible() != null ? dto.getDisponible() : true);

        Producto guardado = productoRepository.save(producto);
        return mapearADto(guardado);
    }

    // 🛠️ NUEVA HU: Eliminar Producto (Borrado Lógico)
    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        producto.setEliminado(true);
        productoRepository.save(producto);
    }

    // Transforma la entidad a DTO de salida (mantiene la lectura completa para el Front)
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