package com.utn.foodstore.dto.pedido;

import com.utn.foodstore.model.Pedido;
import com.utn.foodstore.model.enums.EstadoPedido;
import com.utn.foodstore.model.enums.FormaPago;
import lombok.Data;

@Data
public class PedidoEdit {
    private String estado;
    private String formaPago;


    public void applyTo(Pedido pedido) {
        if (this.estado != null) {
            pedido.setEstado(EstadoPedido.valueOf(this.estado.toUpperCase()));
        }
        if (this.formaPago != null) {
            pedido.setFormaPago(FormaPago.valueOf(this.formaPago.toUpperCase()));
        }
    }
}