package com.utn.foodstore.service;

import com.utn.foodstore.dto.usuario.LoginRequest;
import com.utn.foodstore.dto.usuario.UsuarioDto;
import com.utn.foodstore.dto.usuario.UsuarioEdit;
import com.utn.foodstore.dto.usuario.UsuarioRegistro;
import com.utn.foodstore.exception.ResourceNotFoundException;
import com.utn.foodstore.model.Usuario;
import com.utn.foodstore.model.enums.Rol;
import com.utn.foodstore.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Service
public class UsuarioService { //Aca el usuario se registra y se matchea el logueo

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
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
                .contrasena(passwordEncoder.encode(dto.getContrasena())) //encriptacion
                .rol(Rol.USUARIO) //Para que por defecto sea usuario comun
                .build();

        Usuario guardado = usuarioRepository.save(nuevo);
        return mapearADto(guardado);
    }

    // Login
    public UsuarioDto login(LoginRequest dto) {
        Usuario usuario = usuarioRepository.findByMailAndEliminadoFalse(dto.getMail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Credenciales inválidas o usuario inexistente"));

        // Verificacion con BCrypt
        if (!passwordEncoder.matches(dto.getContrasena(), usuario.getContrasena())) {
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

    //Findall()
    public java.util.List<UsuarioDto> obtenerTodos() {
        return usuarioRepository.findByEliminadoFalse().stream()
                .map(this::mapearADto)
                .collect(java.util.stream.Collectors.toList());
    }

    //FindbyId()
    public UsuarioDto buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findByIdAndEliminadoFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return mapearADto(usuario);
    }

    //Update()
    public UsuarioDto actualizar(Long id, UsuarioEdit dto) {
        Usuario usuario = usuarioRepository.findByIdAndEliminadoFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        //Actualizasolo si recibe datos nuevos
        if (dto.getNombre() != null) usuario.setNombre(dto.getNombre());
        if (dto.getApellido() != null) usuario.setApellido(dto.getApellido());
        if (dto.getCelular() != null) usuario.setCelular(dto.getCelular());

        Usuario guardado = usuarioRepository.save(usuario);
        return mapearADto(guardado);
    }

    //Baja logica
    public void eliminar(Long id) {
        Usuario usuario = usuarioRepository.findByIdAndEliminadoFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        usuario.setEliminado(true);
        usuarioRepository.save(usuario);
    }
}