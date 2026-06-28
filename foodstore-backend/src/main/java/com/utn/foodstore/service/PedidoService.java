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

    // HU-022: Total Facturado (para pedidos terminados)
    public Double calcularTotalFacturado() {
        //Busca pedidos activos
        return pedidoRepository.findByEliminadoFalse().stream()
                // Filto para los terminados
                .filter(pedido -> pedido.getEstado() == EstadoPedido.TERMINADO)
                //total de cada pedido
                .mapToDouble(Pedido::getTotal)
                // Suma final
                .sum();
    }

    public java.util.List<PedidoDto> obtenerTodos() {
        return pedidoRepository.findAll().stream()
                .map(pedido -> PedidoDto.builder()
                        .id(pedido.getId())
                        // Concatenamos nombre y apellido para meterlo en tu campo clienteNombre
                        .clienteNombre(pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido())
                        .total(pedido.getTotal())
                        .estado(pedido.getEstado().toString())
                        .build()
                )
                .collect(java.util.stream.Collectors.toList());
    }


    @Transactional
    public PedidoDto cambiarEstado(Long id, String nuevoEstado) {
        // 1. Buscamos el pedido en la base de datos usando tu repositorio de Spring Data JPA
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));

        // 2. Convertimos el String que viene de la web al ENUM exacto de tus imports (EstadoPedido)
        EstadoPedido estadoEnum = EstadoPedido.valueOf(nuevoEstado.toUpperCase());

        // 3. Modificamos el estado en el objeto
        pedido.setEstado(estadoEnum);

        // 4. Persistimos el cambio (Hibernate se encarga de generar el UPDATE en H2)
        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        // 5. Devolvemos el DTO ensamblado con el Builder para que viaje limpio hacia TypeScript
        return PedidoDto.builder()
                .id(pedidoActualizado.getId())
                .clienteNombre(pedidoActualizado.getUsuario().getNombre() + " " + pedidoActualizado.getUsuario().getApellido())
                .total(pedidoActualizado.getTotal())
                .estado(pedidoActualizado.getEstado().name())
                .build();
    }

}//Fin de clase