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
}