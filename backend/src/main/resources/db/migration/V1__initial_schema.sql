-- =====================================================================
-- V1: Initial schema for the e-commerce platform (Phase 1 data model).
-- Owns the full schema going forward. Tables are created in FK-dependency
-- order. All money columns use DECIMAL(12,2); timestamps use DATETIME(6)
-- to match Hibernate's LocalDateTime mapping.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL,
    password       VARCHAR(255) NOT NULL,
    phone          VARCHAR(15),
    company_name   VARCHAR(60),
    role           VARCHAR(20)  NOT NULL,
    enabled        BIT(1)       NOT NULL DEFAULT b'1',
    email_verified BIT(1)       NOT NULL DEFAULT b'0',
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------------------------------------------------------------------
-- Categories (self-referencing for subcategories)
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    image_url   VARCHAR(500),
    parent_id   BIGINT,
    active      BIT(1)       NOT NULL DEFAULT b'1',
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_categories_slug UNIQUE (slug),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------------------------------------------------------------------
-- Brands
-- ---------------------------------------------------------------------
CREATE TABLE brands (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL,
    logo_url    VARCHAR(500),
    description VARCHAR(500),
    active      BIT(1)       NOT NULL DEFAULT b'1',
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_brands_slug UNIQUE (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------
CREATE TABLE products (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    name           VARCHAR(100)  NOT NULL,
    description    VARCHAR(500),
    price          DECIMAL(12, 2) NOT NULL,
    stock          INT           NOT NULL,
    sku            VARCHAR(64),
    image_url      VARCHAR(500),
    category_id    BIGINT,
    brand_id       BIGINT,
    active         BIT(1)        NOT NULL DEFAULT b'1',
    rating_average DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    rating_count   INT           NOT NULL DEFAULT 0,
    created_at     DATETIME(6)   NOT NULL,
    updated_at     DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_brand ON products (brand_id);
CREATE INDEX idx_products_name ON products (name);

-- ---------------------------------------------------------------------
-- Carts & cart items
-- ---------------------------------------------------------------------
CREATE TABLE carts (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    user_id     BIGINT        NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at  DATETIME(6)   NOT NULL,
    updated_at  DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_carts_user UNIQUE (user_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE cart_items (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    cart_id    BIGINT        NOT NULL,
    product_id BIGINT        NOT NULL,
    quantity   INT           NOT NULL,
    subtotal   DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_cart_items_cart ON cart_items (cart_id);

-- ---------------------------------------------------------------------
-- Addresses
-- ---------------------------------------------------------------------
CREATE TABLE addresses (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(15)  NOT NULL,
    line1       VARCHAR(255) NOT NULL,
    line2       VARCHAR(255),
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100) NOT NULL,
    postal_code VARCHAR(15)  NOT NULL,
    country     VARCHAR(100) NOT NULL DEFAULT 'India',
    type        VARCHAR(20)  NOT NULL,
    is_default  BIT(1)       NOT NULL DEFAULT b'0',
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_address_user ON addresses (user_id);

-- ---------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------
CREATE TABLE coupons (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    code                VARCHAR(40)   NOT NULL,
    description         VARCHAR(255),
    discount_type       VARCHAR(20)   NOT NULL,
    discount_value      DECIMAL(12, 2) NOT NULL,
    min_order_amount    DECIMAL(12, 2),
    max_discount_amount DECIMAL(12, 2),
    usage_limit         INT,
    used_count          INT           NOT NULL DEFAULT 0,
    starts_at           DATETIME(6),
    expires_at          DATETIME(6),
    active              BIT(1)        NOT NULL DEFAULT b'1',
    created_at          DATETIME(6)   NOT NULL,
    updated_at          DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_coupons_code UNIQUE (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------------------------------------------------------------------
-- Orders & order items
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    id                   BIGINT        NOT NULL AUTO_INCREMENT,
    order_number         VARCHAR(40)   NOT NULL,
    user_id              BIGINT        NOT NULL,
    status               VARCHAR(25)   NOT NULL,
    subtotal             DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount      DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount           DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_amount      DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount         DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    coupon_id            BIGINT,
    shipping_name        VARCHAR(100),
    shipping_phone       VARCHAR(15),
    shipping_line1       VARCHAR(255),
    shipping_line2       VARCHAR(255),
    shipping_city        VARCHAR(100),
    shipping_state       VARCHAR(100),
    shipping_postal_code VARCHAR(15),
    shipping_country     VARCHAR(100),
    placed_at            DATETIME(6),
    created_at           DATETIME(6)   NOT NULL,
    updated_at           DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_orders_number UNIQUE (order_number),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_order_user ON orders (user_id);
CREATE INDEX idx_order_status ON orders (status);

CREATE TABLE order_items (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    product_name VARCHAR(150)  NOT NULL,
    unit_price   DECIMAL(12, 2) NOT NULL,
    quantity     INT           NOT NULL,
    subtotal     DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_order_item_order ON order_items (order_id);
CREATE INDEX idx_order_item_product ON order_items (product_id);

-- ---------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------
CREATE TABLE payments (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    order_id            BIGINT        NOT NULL,
    amount              DECIMAL(12, 2) NOT NULL,
    method              VARCHAR(20)   NOT NULL,
    status              VARCHAR(20)   NOT NULL,
    provider            VARCHAR(40)   NOT NULL,
    razorpay_order_id   VARCHAR(80),
    razorpay_payment_id VARCHAR(80),
    razorpay_signature  VARCHAR(255),
    transaction_id      VARCHAR(100),
    created_at          DATETIME(6)   NOT NULL,
    updated_at          DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_payments_order UNIQUE (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_payment_order ON payments (order_id);

-- ---------------------------------------------------------------------
-- Wishlist
-- ---------------------------------------------------------------------
CREATE TABLE wishlist_items (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    product_id BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_wishlist_user ON wishlist_items (user_id);

-- ---------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    product_id BIGINT       NOT NULL,
    user_id    BIGINT       NOT NULL,
    rating     INT          NOT NULL,
    title      VARCHAR(150),
    comment    VARCHAR(1000),
    status     VARCHAR(20)  NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_review_product_user UNIQUE (product_id, user_id),
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_review_product ON reviews (product_id);
CREATE INDEX idx_review_status ON reviews (status);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    title      VARCHAR(150) NOT NULL,
    message    VARCHAR(500) NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    is_read    BIT(1)       NOT NULL DEFAULT b'0',
    created_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_notification_user ON notifications (user_id);
