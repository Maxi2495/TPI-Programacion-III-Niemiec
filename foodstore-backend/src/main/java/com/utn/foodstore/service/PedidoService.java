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

    // HU-016: Crear Pedido
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

            if (productoDB.getDisponible() == null || !productoDB.getDisponible()) {
                throw new com.utn.foodstore.exception.BusinessException("El producto '" + productoDB.getNombre() + "' no está disponible para la venta");
            }

            //Control de Stock
            if (productoDB.getStock() < item.getCantidad()) {
                throw new com.utn.foodstore.exception.BusinessException("Stock insuficiente para el producto: " + productoDB.getNombre() + ". Quedan: " + productoDB.getStock());
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
                .formaPago(com.utn.foodstore.model.enums.FormaPago.valueOf(dto.getFormaPago().toUpperCase()))
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
                .clienteNombre(comprador != null ? comprador.getNombre() + " " + comprador.getApellido() : "Consumidor Final")
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
                //suma final
                .sum();
    }

    public java.util.List<PedidoDto> obtenerTodos() {
        //formate fecha y hora
        java.time.format.DateTimeFormatter formateador = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        return pedidoRepository.findAll().stream()
                .map(pedido -> {

                    java.util.List<String> prodsMapeados = pedido.getDetalles().stream()
                            .map(detalle -> detalle.getCantidad() + "x " + detalle.getProducto().getNombre())
                            .collect(java.util.stream.Collectors.toList());

                    //formato del tiempo
                    String fechaHoraStr = pedido.getCreatedAt() != null ? pedido.getCreatedAt().format(formateador) : "Fecha no disponible";

                    //armado del dto
                    return PedidoDto.builder()
                            .id(pedido.getId())
                            .clienteNombre(pedido.getUsuario() != null ? pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido() : "Consumidor Final")                            .total(pedido.getTotal())
                            .estado(pedido.getEstado().toString())
                            .fechaHora(fechaHoraStr)
                            .productosDetalle(prodsMapeados)
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
    }


    @Transactional
    public PedidoDto cambiarEstado(Long id, String nuevoEstado) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));


        EstadoPedido estadoEnum = EstadoPedido.valueOf(nuevoEstado.toUpperCase());


        pedido.setEstado(estadoEnum);


        Pedido pedidoActualizado = pedidoRepository.save(pedido);


        return PedidoDto.builder()
                .id(pedidoActualizado.getId())
                .clienteNombre(pedidoActualizado.getUsuario() != null ? pedidoActualizado.getUsuario().getNombre() + " " + pedidoActualizado.getUsuario().getApellido() : "Consumidor Final")                .total(pedidoActualizado.getTotal())
                .estado(pedidoActualizado.getEstado().name())
                .build();
    }

    // HU-018: Buscar pedido por su identificador único (ID)
    public PedidoDto buscarPorId(Long id) {
        java.time.format.DateTimeFormatter formateador = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));

        java.util.List<String> prodsMapeados = pedido.getDetalles().stream()
                .map(detalle -> detalle.getCantidad() + "x " + detalle.getProducto().getNombre())
                .collect(java.util.stream.Collectors.toList());

        String fechaHoraStr = pedido.getCreatedAt() != null ? pedido.getCreatedAt().format(formateador) : "Fecha no disponible";

        return PedidoDto.builder()
                .id(pedido.getId())
                .clienteNombre(pedido.getUsuario() != null ? pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido() : "Consumidor Final")
                .total(pedido.getTotal())
                .estado(pedido.getEstado().toString())
                .fechaHora(fechaHoraStr)
                .productosDetalle(prodsMapeados)
                .build();
    }

    //buscar historial por Usuario ID
    public java.util.List<PedidoDto> obtenerHistorialUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdAndEliminadoFalse(usuarioId).stream()
                .map(pedido -> PedidoDto.builder()
                        .id(pedido.getId())
                        .total(pedido.getTotal())
                        .estado(pedido.getEstado().name())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    //Modificacion PUT
    @Transactional
    public PedidoDto actualizarFormal(Long id, com.utn.foodstore.dto.pedido.PedidoEdit dto) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));

        dto.applyTo(pedido);

        Pedido guardado = pedidoRepository.save(pedido);
        return PedidoDto.builder()
                .id(guardado.getId())
                .clienteNombre(guardado.getUsuario() != null ? guardado.getUsuario().getNombre() + " " + guardado.getUsuario().getApellido() : "Consumidor Final")
                .total(guardado.getTotal())
                .estado(guardado.getEstado().name())
                .build();
    }

    //Baja logica
    @Transactional
    public void eliminarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));

        pedido.setEliminado(true);
        pedidoRepository.save(pedido);
    }

}//Fin de clase