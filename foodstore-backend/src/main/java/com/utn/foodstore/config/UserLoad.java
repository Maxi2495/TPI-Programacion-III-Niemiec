package com.utn.foodstore.config;

import com.utn.foodstore.model.Usuario;
import com.utn.foodstore.model.enums.Rol;
import com.utn.foodstore.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserLoad implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UserLoad(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .nombre("Ana").apellido("Martinez")
                    .mail("admin@food.com").celular("1122334455")
                    .rol(Rol.ADMIN)
                    .contrasena(passwordEncoder.encode("admin123"))
                    .eliminado(false)
                    .build();

            Usuario cliente = Usuario.builder()
                    .nombre("Juan").apellido("Perez")
                    .mail("cliente@food.com").celular("1198765432")
                    .rol(Rol.USUARIO)
                    .contrasena(passwordEncoder.encode("cliente123"))
                    .eliminado(false)
                    .build();

            usuarioRepository.save(admin);
            usuarioRepository.save(cliente);
            System.out.println("✅ Usuarios de prueba creados con éxito.");
        }
    }
}