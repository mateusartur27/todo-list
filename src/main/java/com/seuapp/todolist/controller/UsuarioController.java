package com.seuapp.todolist.controller;

import com.seuapp.todolist.model.Usuario;
import com.seuapp.todolist.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Mapa simples para armazenar tokens (em produção, use JWT ou outra solução mais robusta)
    private Map<String, String> tokenUsuarioMap = new HashMap<>();

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        // Verifica se o email já está em uso
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Email já cadastrado");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Salva o novo usuário
        Usuario novoUsuario = usuarioRepository.save(usuario);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", novoUsuario.getId());
        response.put("nome", novoUsuario.getNome());
        response.put("email", novoUsuario.getEmail());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");

        // Busca o usuário pelo email
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            
            // Verifica a senha (em produção, use BCrypt ou outra solução segura)
            if (senha.equals(usuario.getSenha())) {
                // Gera um token simples
                String token = UUID.randomUUID().toString();
                tokenUsuarioMap.put(token, usuario.getId().toString());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("id", usuario.getId());
                response.put("nome", usuario.getNome());
                response.put("email", usuario.getEmail());
                
                return ResponseEntity.ok(response);
            }
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("mensagem", "Credenciais inválidas");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUsuarioAtual(@RequestHeader("Authorization") String token) {
        // Remove "Bearer " se presente
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        String usuarioId = tokenUsuarioMap.get(token);
        if (usuarioId != null) {
            Optional<Usuario> usuario = usuarioRepository.findById(Long.parseLong(usuarioId));
            if (usuario.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", usuario.get().getId());
                response.put("nome", usuario.get().getNome());
                response.put("email", usuario.get().getEmail());
                
                return ResponseEntity.ok(response);
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}