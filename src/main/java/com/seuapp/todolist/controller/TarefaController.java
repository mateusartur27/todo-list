package com.seuapp.todolist.controller;

import com.seuapp.todolist.model.Tarefa;
import com.seuapp.todolist.service.TarefaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {

    private final TarefaService service;

    public TarefaController(TarefaService service) {
        this.service = service;
    }

    @PostMapping
    public Tarefa adicionar(@RequestBody Tarefa tarefa) {
        return service.adicionarTarefa(tarefa);
    }

    @GetMapping
    public List<Tarefa> listar(@RequestParam(required = false) String status) {
        if (status != null) {
            return service.listarPorStatus(status);
        }
        return service.listarTarefas();
    }

    @PutMapping("/{id}/concluir")
    public Optional<Tarefa> concluir(@PathVariable Long id) {
        return service.concluirTarefa(id);
    }

    @PutMapping("/{id}")
    public Optional<Tarefa> editar(@PathVariable Long id, @RequestBody Tarefa tarefa) {
        return service.editarTarefa(id, tarefa.getTitulo(), tarefa.getDescricao());
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluirTarefa(id);
    }
}
