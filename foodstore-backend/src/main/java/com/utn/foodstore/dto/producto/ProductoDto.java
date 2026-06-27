package com.utn.foodstore.dto.producto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductoDto {
    private Long id;
    private String nombre;
    private Double precio;
    private String descripcion;
    private int stock;
    private String imagen;
    private Boolean disponible;
    private Long categoriaId;
    private String categoriaNombre; // Evita bucles infinitos en el JSON
}