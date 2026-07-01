package com.utn.foodstore.dto.categoria;

import com.utn.foodstore.model.Categoria;
import lombok.Data;

@Data
public class CategoriaEdit {
    private String nombre;
    private String descripcion;
    private String imagen;

    //Pedido por la rubrica
    public void applyTo(Categoria categoria) {
        if (this.nombre != null) categoria.setNombre(this.nombre);
        if (this.descripcion != null) categoria.setDescripcion(this.descripcion);
        if (this.imagen != null) categoria.setImagen(this.imagen);
    }
}