package com.utn.foodstore.repository;

import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.model.Pedido;
import com.utn.foodstore.model.Producto;

import java.util.List;

public interface PedidoRepository extends BaseRepository<Pedido, Long>{
    List<Pedido> findByUsuarioIdAndEliminadoFalse(Long usuarioId);
}