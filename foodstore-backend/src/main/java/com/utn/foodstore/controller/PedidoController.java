package com.utn.foodstore.controller;

import com.utn.foodstore.dto.pedido.PedidoCreate;
import com.utn.foodstore.dto.pedido.PedidoDto;
import com.utn.foodstore.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<java.util.List<PedidoDto>> listarTodos() {
        // Asumiendo que tu servicio tiene un método para listar todo o buscar todos
        return ResponseEntity.ok(pedidoService.obtenerTodos());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoDto> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String nuevoEstado
    ) {
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, nuevoEstado));
    }
}