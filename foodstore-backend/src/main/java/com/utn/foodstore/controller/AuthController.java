package com.utn.foodstore.controller;

import com.utn.foodstore.dto.usuario.LoginRequest;
import com.utn.foodstore.dto.usuario.UsuarioDto;
import com.utn.foodstore.dto.usuario.UsuarioRegistro;
import com.utn.foodstore.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Ruta raíz para la autenticación
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Endpoint de la HU-006: Registro
    @PostMapping("/register")
    public ResponseEntity<UsuarioDto> registrar(@Valid @RequestBody UsuarioRegistro dto) {
        UsuarioDto creado = usuarioService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // Endpoint para Login
    @PostMapping("/login")
    public ResponseEntity<UsuarioDto> login(@Valid @RequestBody LoginRequest dto) {
        UsuarioDto logueado = usuarioService.login(dto);
        return ResponseEntity.ok(logueado);
    }
}