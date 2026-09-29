package com.example.retailstorealertsystem_api.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.retailstorealertsystem_api.dto.FastMovingProductResponse;
import com.example.retailstorealertsystem_api.enums.MovementReason;
import com.example.retailstorealertsystem_api.enums.MovementType;
import com.example.retailstorealertsystem_api.exceptions.InsufficientStockException;
import com.example.retailstorealertsystem_api.exceptions.ProductNotFound;
import com.example.retailstorealertsystem_api.model.Product;
import com.example.retailstorealertsystem_api.model.StockMovement;
import com.example.retailstorealertsystem_api.repository.ProductRepository;
import com.example.retailstorealertsystem_api.repository.StockMovementRepository;

@Service
public class StockMovementServiceImpl implements StockMovementService {

    private StockMovementRepository stockmovementrepo;
    private ProductRepository productrepo;
    private ReorderAlertService reorderalertservice;

    public StockMovementServiceImpl(
            StockMovementRepository stockmovementrepo,
            ProductRepository productrepo,
            ReorderAlertService reorderalertservice) {

        this.stockmovementrepo = stockmovementrepo;
        this.productrepo = productrepo;
        this.reorderalertservice = reorderalertservice;
    }

    @Override
    public StockMovement createStockMovement(Long productId, StockMovement movement) {

        Product product = productrepo.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFound(
                                "Product not found with id: " + productId));

        if (movement.getQuantity() == null || movement.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0");
        }

        MovementReason reason = movement.getReason();

        if (reason == null) {
            throw new IllegalArgumentException(
                    "Movement reason is required");
        }

        if (reason == MovementReason.PURCHASE ||
            reason == MovementReason.RETURN) {

            movement.setMovementType(MovementType.IN);

        } else if (reason == MovementReason.SALE ||
                   reason == MovementReason.DAMAGE) {

            movement.setMovementType(MovementType.OUT);
        }

        Integer currentStock = getCurrentStock(productId);

        if (movement.getMovementType() == MovementType.OUT) {

            if (movement.getQuantity() > currentStock) {
                throw new InsufficientStockException(
                        "Insufficient stock. Available stock: "
                                + currentStock);
            }
        }

        movement.setProduct(product);
        movement.setMovementDate(LocalDateTime.now());

        StockMovement savedMovement =
                stockmovementrepo.save(movement);

        Integer updatedStock = getCurrentStock(productId);

        if (reason == MovementReason.PURCHASE) {

            reorderalertservice.fulfillOpenAlertForProduct(
                    productId);
        }

        reorderalertservice.checkAndCreateAlert(
                productId, updatedStock);

        return savedMovement;
    }

    @Override
    public List<StockMovement> getAllStockMovements() {
        return stockmovementrepo.findAll();
    }

    @Override
    public List<StockMovement> getStockMovementsByProduct(
            Long productId) {

        productrepo.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFound(
                                "Product not found with id: "
                                        + productId));

        return stockmovementrepo.findByProductProductId(productId);
    }

    @Override
    public Integer getCurrentStock(Long productId) {

        productrepo.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFound(
                                "Product not found with id: "
                                        + productId));

        List<StockMovement> movements =
                stockmovementrepo.findByProductProductId(productId);

        int stock = 0;

        for (StockMovement movement : movements) {

            if (movement.getMovementType() == MovementType.IN) {
                stock = stock + movement.getQuantity();
            }

            if (movement.getMovementType() == MovementType.OUT) {
                stock = stock - movement.getQuantity();
            }
        }

        return stock;
    }

    @Override
    public List<FastMovingProductResponse> getFastMovingProducts(
            LocalDateTime startDate,
            LocalDateTime endDate) {

        List<Object[]> results =
                stockmovementrepo.findFastMovingProducts(
                        startDate, endDate);

        List<FastMovingProductResponse> response =
                new ArrayList<>();

        for (Object[] result : results) {

            Long productId = (Long) result[0];
            String productName = (String) result[1];
            Long salesQuantity = (Long) result[2];

            response.add(
                    new FastMovingProductResponse(
                            productId,
                            productName,
                            salesQuantity));
        }

        return response;
    }
}