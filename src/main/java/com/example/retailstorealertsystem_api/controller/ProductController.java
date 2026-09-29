package com.example.retailstorealertsystem_api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.retailstorealertsystem_api.model.Product;
import com.example.retailstorealertsystem_api.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController 
{

    private ProductService productservice;

    public ProductController(ProductService productservice) {
        this.productservice = productservice;
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productservice.createProduct(product);
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productservice.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productservice.getProductById(id);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id,
                                 @RequestBody Product product) {
        return productservice.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productservice.deleteProduct(id);
        return "Product deleted successfully";
    }
}