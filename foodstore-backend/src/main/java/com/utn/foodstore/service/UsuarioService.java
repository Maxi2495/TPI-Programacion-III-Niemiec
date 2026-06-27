package com.utn.foodstore.service;

import com.utn.foodstore.dto.usuario.LoginRequest;
import com.utn.foodstore.dto.usuario.UsuarioDto;
import com.utn.foodstore.dto.usuario.UsuarioRegistro;
import com.utn.foodstore.exception.ResourceNotFoundException;
import com.utn.foodstore.model.Usuario;
import com.utn.foodstore.model.enums.Rol;
import com.utn.foodstore.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService { //Aca el usuario se registra y se matchea el logueo

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // HU-006: Registrar Usuario
    public UsuarioDto registrar(UsuarioRegistro dto) {
        //Email unico obligatorio
        if (usuarioRepository.findByMailAndEliminadoFalse(dto.getMail()).isPresent()) {
            throw new RuntimeException("El email ya se encuentra registrado");
        }

        Usuario nuevo = Usuario.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .mail(dto.getMail().trim().toLowerCase())
                .contrasena(dto.getContrasena())
                .rol(Rol.USUARIO) //Para que por defecto sea usuario comun
                .build();

        Usuario guardado = usuarioRepository.save(nuevo);
        return mapearADto(guardado);
    }

    // Login
    public UsuarioDto login(LoginRequest dto) {
        Usuario usuario = usuarioRepository.findByMailAndEliminadoFalse(dto.getMail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Credenciales inválidas o usuario inexistente"));

        // Verificacion en texto plano
        if (!usuario.getContrasena().equals(dto.getContrasena())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        return mapearADto(usuario);
    }

    private UsuarioDto mapearADto(Usuario u) {
        return UsuarioDto.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .mail(u.getMail())
                .celular(u.getCelular())
                .rol(u.getRol() != null ? u.getRol().name() : "USUARIO")
                .build();
    }
}