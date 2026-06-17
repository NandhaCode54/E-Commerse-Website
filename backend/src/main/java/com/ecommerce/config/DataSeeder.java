package com.ecommerce.config;

import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds baseline data on startup so the app is usable out of the box:
 *
 * <ul>
 *   <li>an ADMIN account ({@code admin@ecommerce.local} / {@code password123})</li>
 *   <li>a regular USER account ({@code user@ecommerce.local} / {@code Password@123})</li>
 *   <li>a catalogue of demo products (only when the table is empty)</li>
 * </ul>
 *
 * Every step is idempotent: accounts are created only when their email is absent,
 * and products are seeded only when no products exist yet, so the seeder is safe
 * to run on every boot.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
                               ProductRepository productRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            seedUser(userRepository, passwordEncoder,
                    "Site Admin", "admin@ecommerce.local", "password123", User.Role.ADMIN);
            seedUser(userRepository, passwordEncoder,
                    "Demo User", "user@ecommerce.local", "Password@123", User.Role.USER);
            seedProducts(productRepository);
        };
    }

    private void seedUser(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          String name, String email, String rawPassword, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            log.info("Seed: {} account already exists ({})", role, email);
            return;
        }
        User user = new User(name, email, passwordEncoder.encode(rawPassword), role);
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Seed: created {} account {}", role, email);
    }

    private void seedProducts(ProductRepository productRepository) {
        if (productRepository.count() > 0) {
            log.info("Seed: products already present ({}), skipping product seed", productRepository.count());
            return;
        }

        List<Product> products = List.of(
                product("Wireless Noise-Cancelling Headphones",
                        "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.",
                        "7999.00", 40, "HEAD-001",
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"),
                product("Smart Fitness Watch",
                        "AMOLED smartwatch with heart-rate, SpO2, GPS and a 7-day battery.",
                        "5499.00", 60, "WATCH-001",
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"),
                product("Portable Bluetooth Speaker",
                        "Waterproof 360° speaker with deep bass and 20-hour playback.",
                        "2999.00", 75, "SPKR-001",
                        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"),
                product("RGB Mechanical Keyboard",
                        "Hot-swappable mechanical keyboard with per-key RGB and tactile switches.",
                        "4499.00", 35, "KEYB-001",
                        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80"),
                product("7-in-1 USB-C Hub",
                        "Aluminium hub with 4K HDMI, USB 3.0, SD/microSD and 100W power delivery.",
                        "1999.00", 120, "HUB-001",
                        "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&q=80"),
                product("Ergonomic Wireless Mouse",
                        "Silent-click wireless mouse with adjustable DPI and a 12-month battery.",
                        "1299.00", 150, "MOUSE-001",
                        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80"),
                product("Aluminium Laptop Stand",
                        "Adjustable, foldable laptop riser that improves airflow and posture.",
                        "1799.00", 80, "STAND-001",
                        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80"),
                product("4K Action Camera",
                        "Waterproof 4K/60fps action camera with image stabilisation and mounts.",
                        "8999.00", 25, "CAM-001",
                        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80"),
                product("True Wireless Earbuds",
                        "Compact TWS earbuds with ENC mic, touch controls and a charging case.",
                        "2499.00", 200, "BUDS-001",
                        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"),
                product("Smartphone Gimbal Stabilizer",
                        "3-axis foldable gimbal for smooth handheld smartphone video.",
                        "6499.00", 30, "GIMB-001",
                        "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=600&q=80"),
                product("10000mAh Power Bank",
                        "Slim fast-charging power bank with dual USB-A and USB-C output.",
                        "1499.00", 180, "PWR-001",
                        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80"),
                product("Compact Mirrorless Camera",
                        "24MP mirrorless camera with interchangeable lens and 4K video.",
                        "54999.00", 12, "MIRR-001",
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80")
        );

        productRepository.saveAll(products);
        log.info("Seed: inserted {} demo products", products.size());
    }

    private Product product(String name, String description, String price, int stock,
                            String sku, String imageUrl) {
        Product p = new Product(name, description, new BigDecimal(price), stock);
        p.setSku(sku);
        p.setImageUrl(imageUrl);
        p.setActive(true);
        return p;
    }
}
