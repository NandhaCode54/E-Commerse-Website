package com.ecommerce.mapper;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {
    
    /**
     * Converts Product entity to ProductDTO
     */
    public ProductDTO toDTO(Product product) {
        if (product == null) {
            return null;
        }
        
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setImageUrl(product.getImageUrl());

        return dto;
    }
    
    /**
     * Converts ProductDTO to Product entity
     */
    public Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        
        return product;
    }
    
    /**
     * Converts ProductDTO to Product entity (for create operations, ignores ID)
     */
    public Product toEntityForCreate(ProductDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setImageUrl(dto.getImageUrl());

        return product;
    }

    /**
     * Converts ProductDTO to Product entity (for update operations, ignores ID from DTO)
     */
    public Product toEntityForUpdate(ProductDTO dto) {
        if (dto == null) {
            return null;
        }

        Product product = new Product();
        // ID is ignored - will be set from path variable in controller
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setImageUrl(dto.getImageUrl());

        return product;
    }
    
    /**
     * Converts list of Product entities to list of ProductDTOs
     */
    public List<ProductDTO> toDTOList(List<Product> products) {
        if (products == null) {
            return null;
        }
        
        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts Page of Product entities to Page of ProductDTOs
     */
    public Page<ProductDTO> toDTOPage(Page<Product> productPage) {
        if (productPage == null) {
            return null;
        }
        
        return productPage.map(this::toDTO);
    }
}
