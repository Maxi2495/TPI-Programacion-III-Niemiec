package com.utn.foodstore.repository;

import com.utn.foodstore.model.Categoria;
import com.utn.foodstore.model.Producto;

import java.util.List;

public interface ProductoRepository extends BaseRepository<Producto, Long>{
    List<Producto> findByCategoriaIdAndEliminadoFalse(Long categoriaId);
    List<Producto> findByEliminadoFalseAndDisponibleTrue();
}