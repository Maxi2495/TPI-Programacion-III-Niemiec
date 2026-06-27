package com.utn.foodstore.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "El email es obligatorio")
    private String mail;

    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;
}