-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Descontos de Produtos
CREATE TABLE product_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Combos
CREATE TABLE combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    combo_price DECIMAL(10,2) NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Relacionamento Produto-Combo
CREATE TABLE combo_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combo_id UUID REFERENCES combos(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    required_quantity INTEGER DEFAULT 1,
    is_mandatory BOOLEAN DEFAULT true,
    position_order INTEGER DEFAULT 0
);

-- Índices para Performance
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_combo_products_combo ON combo_products(combo_id);
CREATE INDEX idx_combo_products_product ON combo_products(product_id);
CREATE INDEX idx_combos_active ON combos(is_active);

-- Dados de Exemplo
INSERT INTO categories (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Higiene', 'Produtos de higiene pessoal'),
('550e8400-e29b-41d4-a716-446655440002', 'Beleza', 'Produtos de beleza e cosméticos');

INSERT INTO products (id, name, code, description, base_price, category_id, stock_quantity) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Sabonete Dove Original 90g', 'DOVE001', 'Sabonete hidratante para pele seca', 5.00, '550e8400-e29b-41d4-a716-446655440001', 100),
('550e8400-e29b-41d4-a716-446655440011', 'Shampoo Pantene 400ml', 'PANT001', 'Shampoo para cabelos ressecados', 12.00, '550e8400-e29b-41d4-a716-446655440001', 50),
('550e8400-e29b-41d4-a716-446655440012', 'Condicionador Pantene 400ml', 'PANT002', 'Condicionador hidratante', 15.00, '550e8400-e29b-41d4-a716-446655440001', 45),
('550e8400-e29b-41d4-a716-446655440013', 'Creme Dental Colgate 90g', 'COLG001', 'Creme dental com flúor', 8.00, '550e8400-e29b-41d4-a716-446655440001', 80),
('550e8400-e29b-41d4-a716-446655440014', 'Desodorante Rexona 150ml', 'REXO001', 'Desodorante antitranspirante', 10.00, '550e8400-e29b-41d4-a716-446655440001', 60);

INSERT INTO product_discounts (product_id, discount_type, discount_value) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'percentage', 20.00),
('550e8400-e29b-41d4-a716-446655440011', 'percentage', 15.00),
('550e8400-e29b-41d4-a716-446655440012', 'percentage', 15.00);

INSERT INTO combos (id, name, description, combo_price, discount_type, discount_value, priority) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Combo Higiene', 'Sabonete + Shampoo + Condicionador', 25.00, 'fixed', 10.00, 2),
('550e8400-e29b-41d4-a716-446655440021', 'Combo Família', '2 Sabonetes + Creme Dental', 40.00, 'fixed', 15.00, 1),
('550e8400-e29b-41d4-a716-446655440022', 'Combo Fim de Semana', 'Sabonete + Desodorante', 18.00, 'fixed', 7.00, 3);

INSERT INTO combo_products (combo_id, product_id, required_quantity, is_mandatory) VALUES
-- Combo Higiene
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 1, true),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', 1, true),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440012', 1, true),
-- Combo Família
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', 2, true),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440013', 1, true),
-- Combo Fim de Semana
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440010', 1, true),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440014', 1, true);
