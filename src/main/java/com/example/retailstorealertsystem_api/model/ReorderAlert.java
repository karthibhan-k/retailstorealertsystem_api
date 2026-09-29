package com.example.retailstorealertsystem_api.model;

import java.time.LocalDateTime;

import com.example.retailstorealertsystem_api.enums.AlertStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "reorder_alerts")
public class ReorderAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alertId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Integer stockAtAlert;

    private Integer threshold;

    private Integer reorderQuantity;

    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime fulfilledAt;

    public ReorderAlert() {
    }

    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getStockAtAlert() {
        return stockAtAlert;
    }

    public void setStockAtAlert(Integer stockAtAlert) {
        this.stockAtAlert = stockAtAlert;
    }

    public Integer getThreshold() {
        return threshold;
    }

    public void setThreshold(Integer threshold) {
        this.threshold = threshold;
    }

    public Integer getReorderQuantity() {
        return reorderQuantity;
    }

    public void setReorderQuantity(Integer reorderQuantity) {
        this.reorderQuantity = reorderQuantity;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getFulfilledAt() {
        return fulfilledAt;
    }

    public void setFulfilledAt(LocalDateTime fulfilledAt) {
        this.fulfilledAt = fulfilledAt;
    }
}