package com.utn.foodstore.dto.pedido;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class PedidoCreate {
    @NotNull(message = "El ID del usuario comprador es obligatorio")
    private Long usuarioId;

    @NotEmpty(message = "El pedido debe contener al menos un producto")
    private List<DetallePedidoDto> detalles;

    @NotNull(message = "La forma de pago es obligatoria")
    private String formaPago;
}