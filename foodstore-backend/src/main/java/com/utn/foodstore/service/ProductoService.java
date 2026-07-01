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
                .imagen(dto.getImagen() == null || dto.getImagen().isBlank() ? "https://placehold.co/300" : dto.getImagen())
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

    //Esto es para que solo del lado del cliente se vea lo activo
    public List<ProductoDto> listarParaTienda() {
        List<Producto> productos = productoRepository.findByEliminadoFalseAndDisponibleTrue();
        return productos.stream().map(this::mapearADto).toList();
    }

    // HU-013: abuscar un producto por su Id
    public ProductoDto buscarPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        return mapearADto(producto);
    }

    // HU-014: Filtrar catálogo de productos por familia/categoría
    public List<ProductoDto> listarPorCategoria(Long categoriaId) {
        List<Producto> productos = productoRepository.findByCategoriaIdAndEliminadoFalse(categoriaId);
        return productos.stream().map(this::mapearADto).toList();
    }

    @Transactional
    public ProductoDto actualizar(Long id, com.utn.foodstore.dto.producto.ProductoEdit dto) { // 👈 Cambiado a ProductoEdit
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        Categoria categoria = null;
        if (dto.getCategoriaId() != null) {
            categoria = categoriaRepository.findByIdAndEliminadoFalse(dto.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoriaId()));
        }


        dto.applyTo(producto, categoria);

        Producto guardado = productoRepository.save(producto);
        return mapearADto(guardado);
    }

    //Eliminar Producto (Borrado Lógico)
    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        producto.setEliminado(true);
        productoRepository.save(producto);
    }

    // Transforma a DTO de salida
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