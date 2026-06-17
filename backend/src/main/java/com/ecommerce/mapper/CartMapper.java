package com.ecommerce.mapper;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {
    
    private final ProductMapper productMapper;
    
    @Autowired
    public CartMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }
    
    public ProductMapper getProductMapper() {
        return productMapper;
    }
    
    /**
     * Converts Cart entity to CartDTO
     */
    public CartDTO toDTO(Cart cart) {
        if (cart == null) {
            return null;
        }
        
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUserId());
        dto.setTotalPrice(cart.getTotalPrice());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());
        
        // Convert cart items to DTOs
        if (cart.getCartItems() != null) {
            List<CartItemDTO> cartItemDTOs = cart.getCartItems().stream()
                    .map(this::toCartItemDTO)
                    .collect(Collectors.toList());
            dto.setCartItems(cartItemDTOs);
        }
        
        return dto;
    }
    
    /**
     * Converts CartItem entity to CartItemDTO
     */
    public CartItemDTO toCartItemDTO(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }
        
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setProductId(cartItem.getProductId());
        dto.setQuantity(cartItem.getQuantity());
        dto.setSubtotal(cartItem.getSubtotal());
        
        return dto;
    }
    
    /**
     * Converts CartItem entity to CartItemDTO with product details
     */
    public CartItemDTO toCartItemDTOWithProduct(CartItem cartItem, Product product) {
        CartItemDTO dto = toCartItemDTO(cartItem);
        if (dto != null && product != null) {
            dto.setProduct(productMapper.toDTO(product));
        }
        return dto;
    }
    
    /**
     * Converts CartDTO to Cart entity (for create operations)
     */
    public Cart toEntity(CartDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Cart cart = new Cart();
        cart.setUserId(dto.getUserId());
        
        return cart;
    }
}

