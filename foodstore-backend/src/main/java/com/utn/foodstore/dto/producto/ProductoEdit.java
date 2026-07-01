package com.utn.foodstore.dto.producto;

import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.model.Producto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductoEdit {
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private Double precio;

    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;

    private Long categoriaId;
    private String imagen;
    private Boolean disponible;

    //pedido en rubrica
    public void applyTo(Producto producto, Categoria nuevaCategoria) {
        if (this.nombre != null) producto.setNombre(this.nombre);
        if (this.precio != null) producto.setPrecio(this.precio);
        if (this.stock != null) producto.setStock(this.stock);
        if (this.descripcion != null) producto.setDescripcion(this.descripcion);
        if (this.imagen != null) producto.setImagen(this.imagen);
        if (this.disponible != null) producto.setDisponible(this.disponible);
        if (nuevaCategoria != null) producto.setCategoria(nuevaCategoria);
    }
}