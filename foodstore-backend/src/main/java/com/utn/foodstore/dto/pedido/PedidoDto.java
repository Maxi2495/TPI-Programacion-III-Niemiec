package com.utn.foodstore.dto.pedido;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PedidoDto {
    private Long id;
    private String clienteNombre;
    private Double total;
    private String estado;
}