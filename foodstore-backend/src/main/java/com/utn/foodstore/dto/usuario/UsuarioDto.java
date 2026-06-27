package com.utn.foodstore.dto.usuario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioDto {
    private Long id;
    private String nombre;
    private String apellido;
    private String mail;
    private String celular;
    private String rol;
}