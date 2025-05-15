package com.seuapp.todolist.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Tarefa {
  @Id @GeneratedValue
  private Long id;
  private Long userId;
  private String titulo;
  private String descricao;
  private String status;
  private LocalDate dataVencimento;

  public Long getId() { return id; }
  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }
  public String getTitulo() { return titulo; }
  public void setTitulo(String t) { this.titulo = t; }
  public String getDescricao() { return descricao; }
  public void setDescricao(String d) { this.descricao = d; }
  public String getStatus() { return status; }
  public void setStatus(String s) { this.status = s; }

  public LocalDate getDataVencimento() { return dataVencimento; }
  public void setDataVencimento(LocalDate dataVencimento) { this.dataVencimento = dataVencimento; }
}

