package com.example.retailstorealertsystem_api.dto;

public class FastMovingProductResponse {

    private Long productId;
    private String productName;
    private Long salesQuantity;

    public FastMovingProductResponse() {
    }

    public FastMovingProductResponse(
            Long productId,
            String productName,
            Long salesQuantity) {

        this.productId = productId;
        this.productName = productName;
        this.salesQuantity = salesQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getSalesQuantity() {
        return salesQuantity;
    }

    public void setSalesQuantity(Long salesQuantity) {
        this.salesQuantity = salesQuantity;
    }
}