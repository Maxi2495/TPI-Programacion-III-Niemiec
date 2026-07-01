package com.utn.foodstore.controller;

import com.utn.foodstore.dto.pedido.PedidoCreate;
import com.utn.foodstore.dto.pedido.PedidoDto;
import com.utn.foodstore.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")  //Direccion a donde llega el pedido desde la web
@CrossOrigin(origins = "http://localhost:5173", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}) // 👈 Aseguramos PATCH acá
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<PedidoDto> crearPedido(@Valid @RequestBody PedidoCreate dto) {
        PedidoDto nuevoPedido = pedidoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<Double> getTotalFacturado() {
        return ResponseEntity.ok(pedidoService.calcularTotalFacturado());
    }

    // Busca orden por id
    @GetMapping("/{id}")
    public ResponseEntity<PedidoDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<java.util.List<PedidoDto>> listarTodos() {
        
        return ResponseEntity.ok(pedidoService.obtenerTodos());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoDto> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String nuevoEstado
    ) {
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, nuevoEstado));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PedidoDto>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pedidoService.obtenerHistorialUsuario(usuarioId));
    }

    // Actualizacion PUT
    @PutMapping("/{id}")
    public ResponseEntity<com.utn.foodstore.dto.pedido.PedidoDto> actualizarFormal(@PathVariable Long id, @RequestBody com.utn.foodstore.dto.pedido.PedidoEdit dto) {
        return ResponseEntity.ok(pedidoService.actualizarFormal(id, dto));
    }

    //endpoint de Baja logica
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pedidoService.eliminarPedido(id);
        return ResponseEntity.noContent().build();
    }
}