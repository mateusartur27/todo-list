package com.seuapp.todolist.service;

import com.seuapp.todolist.model.Tarefa;
import com.seuapp.todolist.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TarefaService {

    private final TarefaRepository repository;

    public TarefaService(TarefaRepository repository) {
        this.repository = repository;
    }

    public Tarefa adicionarTarefa(Tarefa tarefa) {
        return repository.save(tarefa);
    }

    public List<Tarefa> listarTarefas() {
        return repository.findAll();
    }

    public Optional<Tarefa> concluirTarefa(Long id) {
        Optional<Tarefa> tarefa = repository.findById(id);
        tarefa.ifPresent(t -> {
            t.setStatus("concluida");
            repository.save(t);
        });
        return tarefa;
    }

    public Optional<Tarefa> editarTarefa(Long id, String titulo, String descricao) {
        Optional<Tarefa> tarefa = repository.findById(id);
        tarefa.ifPresent(t -> {
            t.setTitulo(titulo);
            t.setDescricao(descricao);
            repository.save(t);
        });
        return tarefa;
    }

    public void excluirTarefa(Long id) {
        repository.deleteById(id);
    }

    public List<Tarefa> listarPorStatus(String status) {
        return repository.findByStatus(status);
    }
}
