package com.utn.foodstore.dto.categoria;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoriaDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private String imagen;
}