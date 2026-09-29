package com.example.retailstorealertsystem_api.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.retailstorealertsystem_api.dto.FastMovingProductResponse;
import com.example.retailstorealertsystem_api.model.StockMovement;
import com.example.retailstorealertsystem_api.service.StockMovementService;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private StockMovementService stockmovementservice;

    public StockMovementController(StockMovementService stockmovementservice) {
        this.stockmovementservice = stockmovementservice;
    }

    @PostMapping("/{productId}")
    public StockMovement createStockMovement(
            @PathVariable Long productId,
            @RequestBody StockMovement movement) {

        return stockmovementservice.createStockMovement(productId, movement);
    }

    @GetMapping
    public List<StockMovement> getAllStockMovements() {
        return stockmovementservice.getAllStockMovements();
    }

    @GetMapping("/product/{productId}")
    public List<StockMovement> getStockMovementsByProduct(
            @PathVariable Long productId) {

        return stockmovementservice.getStockMovementsByProduct(productId);
    }

    @GetMapping("/product/{productId}/stock")
    public Integer getCurrentStock(@PathVariable Long productId) {
        return stockmovementservice.getCurrentStock(productId);
    }

    @GetMapping("/fast-moving")
    public List<FastMovingProductResponse> getFastMovingProducts(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);

        return stockmovementservice.getFastMovingProducts(
                start, end);
    }
}