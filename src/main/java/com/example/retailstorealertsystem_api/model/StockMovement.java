package com.example.retailstorealertsystem_api.model;

import java.time.LocalDateTime;

import com.example.retailstorealertsystem_api.enums.MovementReason;
import com.example.retailstorealertsystem_api.enums.MovementType;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movementId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    private MovementType movementType;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private MovementReason reason;

    private LocalDateTime movementDate;

    private String notes;

    public StockMovement() {
    }

    public Long getMovementId() {
        return movementId;
    }

    public void setMovementId(Long movementId) {
        this.movementId = movementId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(MovementType movementType) {
        this.movementType = movementType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public MovementReason getReason() {
        return reason;
    }

    public void setReason(MovementReason reason) {
        this.reason = reason;
    }

    public LocalDateTime getMovementDate() {
        return movementDate;
    }

    public void setMovementDate(LocalDateTime movementDate) {
        this.movementDate = movementDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}