package com.example.retailstorealertsystem_api.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.retailstorealertsystem_api.model.Product;
import com.example.retailstorealertsystem_api.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService 
{

    private ProductRepository productrepo;

    public ProductServiceImpl(ProductRepository productrepo) {
        this.productrepo = productrepo;
    }

    @Override
    public Product createProduct(Product product) {

        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        return productrepo.save(product);
    }

    @Override
    public List<Product> getAllProducts() {

        return productrepo.findAll();
    }

    @Override
    public Product getProductById(Long id) {

        return productrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    public Product updateProduct(Long id, Product product) {

        Product exProduct = productrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        exProduct.setProductName(product.getProductName());
        exProduct.setSku(product.getSku());
        exProduct.setCategory(product.getCategory());
        exProduct.setReorderThreshold(product.getReorderThreshold());
        exProduct.setReorderQuantity(product.getReorderQuantity());
        exProduct.setUpdatedAt(LocalDateTime.now());

        return productrepo.save(exProduct);
    }

    @Override
    public void deleteProduct(Long id) {

        Product exProduct = productrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        productrepo.delete(exProduct);
    }
}