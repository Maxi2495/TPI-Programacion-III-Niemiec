package com.utn.foodstore.service;

import com.utn.foodstore.dto.pedido.DetallePedidoDto;
import com.utn.foodstore.dto.pedido.PedidoCreate;
import com.utn.foodstore.dto.pedido.PedidoDto;
import com.utn.foodstore.exception.ResourceNotFoundException;
import com.utn.foodstore.model.DetallePedido;
import com.utn.foodstore.model.Pedido;
import com.utn.foodstore.model.Producto;
import com.utn.foodstore.model.Usuario;
import com.utn.foodstore.model.enums.EstadoPedido;
import com.utn.foodstore.repository.PedidoRepository;
import com.utn.foodstore.repository.ProductoRepository;
import com.utn.foodstore.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository,
                         UsuarioRepository usuarioRepository,
                         ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
    }

    // HU-016: Crear Pedido (Transaccional)
    @Transactional //Esto me permite que ante cualquier error --> Rollback
    public PedidoDto crear(PedidoCreate dto) {
        //alidar al usuario
        Usuario comprador = usuarioRepository.findByIdAndEliminadoFalse(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getUsuarioId()));

        Set<DetallePedido> detallesReales = new HashSet<>();
        double totalCalculado = 0.0;

        //Iteracion del carrito para armar los detalles y descontar stock
        for (DetallePedidoDto item : dto.getDetalles()) {
            Producto productoDB = productoRepository.findByIdAndEliminadoFalse(item.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + item.getProductoId()));

            //Control de Stock
            if (productoDB.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + productoDB.getNombre() + ". Quedan: " + productoDB.getStock());
            }

            //Descontar el stock. El stock nuevo se guarda al final de la transaccion
            productoDB.setStock(productoDB.getStock() - item.getCantidad());
            productoRepository.save(productoDB);

            //Armado del detalle
            double subtotal = productoDB.getPrecio() * item.getCantidad();
            totalCalculado += subtotal;

            DetallePedido detalle = DetallePedido.builder()
                    .producto(productoDB)
                    .cantidad(item.getCantidad())
                    .subtotal(subtotal)
                    .build();

            detallesReales.add(detalle);
        }

        //Armado del pedido
        Pedido nuevoPedido = Pedido.builder()
                .detalles(detallesReales)
                .estado(EstadoPedido.PENDIENTE)
                //por defecto efvo
                .formaPago(com.utn.foodstore.model.enums.FormaPago.EFECTIVO)
                .build();

        //Calculo del total
        nuevoPedido.calcularTotal();

        //Guardado y genera id
        Pedido pedidoGuardado = pedidoRepository.save(nuevoPedido);

        //Relacion usuario-pedido (Usuario conoc e al pedido)
        comprador.addPedido(pedidoGuardado);
        usuarioRepository.save(comprador); //Actualizo fk

        //Armado de dto para devolver al cliente
        return PedidoDto.builder()
                .id(pedidoGuardado.getId())
                .clienteNombre(comprador.getNombre() + " " + comprador.getApellido())
                .total(pedidoGuardado.getTotal())
                .estado(pedidoGuardado.getEstado().name())
                .build();
    }
}//Fin de clase