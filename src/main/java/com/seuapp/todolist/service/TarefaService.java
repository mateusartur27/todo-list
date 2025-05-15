package com.seuapp.todolist.service;

import com.seuapp.todolist.model.Tarefa;
import com.seuapp.todolist.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TarefaService {

    private final TarefaRepository repository;

    public TarefaService(TarefaRepository repository) {
        this.repository = repository;
    }

    public Tarefa adicionarTarefa(Tarefa tarefa) {
        if (tarefa.getStatus() == null) {
            tarefa.setStatus("PENDENTE");
        }
        return repository.save(tarefa);
    }

    public List<Tarefa> listarTarefas(Long userId) {
        return repository.findByUserId(userId);
    }

    public Optional<Tarefa> concluirTarefa(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId)
            .map(tarefa -> {
                tarefa.setStatus("CONCLUIDA");
                return repository.save(tarefa);
            });
    }

    public Optional<Tarefa> desmarcarTarefa(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId)
            .map(tarefa -> {
                tarefa.setStatus("PENDENTE");
                return repository.save(tarefa);
            });
    }

    public Optional<Tarefa> editarTarefa(Long id, Long userId, String titulo, String descricao, LocalDate dataVencimento) {
        Optional<Tarefa> tarefa = repository.findByIdAndUserId(id, userId);
        tarefa.ifPresent(t -> {
            t.setTitulo(titulo);
            t.setDescricao(descricao);
            t.setDataVencimento(dataVencimento);
            repository.save(t);
        });
        return tarefa;
    }

    public void excluirTarefa(Long id, Long userId) {
        repository.findByIdAndUserId(id, userId).ifPresent(repository::delete);
    }

    public List<Tarefa> listarPorStatus(String status, Long userId) {
        return repository.findByStatusAndUserId(status, userId);
    }
}
