package com.example.retailstorealertsystem_api.exceptions;

public class ProductNotFound extends RuntimeException {

    public ProductNotFound(String message) {
        super(message);
    }
}