package com.example.retailstorealertsystem_api.service;

import java.time.LocalDateTime;
import java.util.List;

import com.example.retailstorealertsystem_api.dto.FastMovingProductResponse;
import com.example.retailstorealertsystem_api.model.StockMovement;

public interface StockMovementService {

    StockMovement createStockMovement(Long productId, StockMovement movement);

    List<StockMovement> getAllStockMovements();

    List<StockMovement> getStockMovementsByProduct(Long productId);

    Integer getCurrentStock(Long productId);

    List<FastMovingProductResponse> getFastMovingProducts(
            LocalDateTime startDate,
            LocalDateTime endDate);
}