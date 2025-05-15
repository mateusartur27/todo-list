package com.seuapp.todolist.repository;

import com.seuapp.todolist.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByStatus(String status);
    List<Tarefa> findByUserId(Long userId);
    List<Tarefa> findByStatusAndUserId(String status, Long userId);
    Optional<Tarefa> findByIdAndUserId(Long id, Long userId);
}
