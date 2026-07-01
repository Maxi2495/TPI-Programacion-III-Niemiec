package com.utn.foodstore.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Entity
@Table(name = "productos")
public class Producto extends Base {

    @EqualsAndHashCode.Include
    @Column(name = "nombre", nullable = false,length = 100)
    private String nombre;

    @Column(name = "precio", nullable = false)
    private Double precio;

    @Column(name = "descripcion",length = 500)
    private String descripcion;

    @Column(name = "stock",nullable = false)
    private Integer stock;

    @Column(name = "imagen")
    private String imagen;

    @Builder.Default
    @Column(name = "disponible")
    private Boolean disponible = Boolean.TRUE;

    @ManyToOne(fetch = FetchType.LAZY) // Muchos productos pueden tener una misma categoría
    @JoinColumn(name = "categoria_id", nullable = false) //Columna de la FK
    private Categoria categoria;

    @Builder.Default
    private boolean eliminado = false;


}
