package com.seuapp.todolist.controller;

import com.seuapp.todolist.model.Tarefa;
import com.seuapp.todolist.service.TarefaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {

    private final TarefaService service;

    public TarefaController(TarefaService service) {
        this.service = service;
    }

    @PostMapping
    public Tarefa adicionar(@RequestBody Tarefa tarefa, @RequestParam Long userId) {
        tarefa.setUserId(userId);
        return service.adicionarTarefa(tarefa);
    }

    @GetMapping
    public List<Tarefa> listar(@RequestParam Long userId, @RequestParam(required = false) String status) {
        if (status != null) {
            return service.listarPorStatus(status, userId);
        }
        return service.listarTarefas(userId);
    }

    @PutMapping("/{id}/concluir")
    public Optional<Tarefa> concluir(@PathVariable Long id, @RequestParam Long userId) {
        return service.concluirTarefa(id, userId);
    }

    @PutMapping("/{id}/desmarcar")
    public Optional<Tarefa> desmarcar(@PathVariable Long id, @RequestParam Long userId) {
        return service.desmarcarTarefa(id, userId);
    }

    @PutMapping("/{id}")
    public Optional<Tarefa> editar(@PathVariable Long id, @RequestParam Long userId, @RequestBody Tarefa tarefa) {
        return service.editarTarefa(id, userId, tarefa.getTitulo(), tarefa.getDescricao(), tarefa.getDataVencimento());
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id, @RequestParam Long userId) {
        service.excluirTarefa(id, userId);
    }
}
