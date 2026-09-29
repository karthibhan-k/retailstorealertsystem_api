package com.example.retailstorealertsystem_api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.retailstorealertsystem_api.model.StockMovement;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductProductId(Long productId);

    @Query("""
            SELECT sm.product.productId, sm.product.productName, SUM(sm.quantity)
            FROM StockMovement sm
            WHERE sm.movementType = com.example.retailstorealertsystem_api.enums.MovementType.OUT
            AND sm.reason = com.example.retailstorealertsystem_api.enums.MovementReason.SALE
            AND sm.movementDate BETWEEN :startDate AND :endDate
            GROUP BY sm.product.productId, sm.product.productName
            ORDER BY SUM(sm.quantity) DESC
            """)
    List<Object[]> findFastMovingProducts(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}