-- Seed initial data for Moon Salon System

-- Insert default owner
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('owner', 'owner@moonsalon.com', '$2b$10$rQZ8kK0yP7J8Y0mFpT8dxeWKjN5ZqC8dPzR3nT1mD7xB2pL4vF6nG', 'owner', 'Moon Salon Owner', '+1234567890');

-- Update the owner password to a properly hashed version
UPDATE users SET password = '$2b$10$rQZ8kK0yP7J8Y0mFpT8dxeWKjN5ZqC8dPzR3nT1mD7xB2pL4vF6nG' WHERE username = 'owner';

-- Update service categories for kids salon
DELETE FROM service_categories;
INSERT INTO service_categories (name, description) VALUES
('Kids Haircuts', 'Fun and stylish haircuts for children of all ages'),
('Hair Styling & Braids', 'Creative styling, braids, and special occasion looks'),
('Hair Coloring & Fun', 'Temporary colors, highlights, and fun hair accessories'),
('Special Occasions', 'Birthday parties, photoshoots, and special events'),
('Hair Care & Treatment', 'Gentle hair care and conditioning treatments for kids'),
('Nail Fun', 'Kid-friendly manicures and nail art');

-- Update services for kids salon
DELETE FROM services;
INSERT INTO services (name, category_id, price, duration_minutes, description) VALUES
-- Kids Haircuts
('Toddler First Haircut', 1, 25.00, 30, 'Special first haircut experience with certificate'),
('Kids Basic Haircut', 1, 20.00, 30, 'Simple and stylish haircut for kids'),
('Teen Trendy Cut', 1, 35.00, 45, 'Modern and trendy haircuts for teenagers'),
('Buzz Cut Special', 1, 15.00, 20, 'Quick and easy buzz cut'),

-- Hair Styling & Braids
('Princess Braids', 2, 30.00, 45, 'Beautiful braided hairstyles fit for a princess'),
('Fun Ponytails', 2, 15.00, 20, 'Creative ponytail styles with accessories'),
('Special Event Styling', 2, 45.00, 60, 'Elegant styling for special occasions'),
('Crazy Hair Day', 2, 25.00, 30, 'Wild and fun styles for school events'),

-- Hair Coloring & Fun
('Temporary Color Streaks', 3, 20.00, 30, 'Washable color streaks and highlights'),
('Hair Chalk Fun', 3, 15.00, 20, 'Temporary hair chalk coloring'),
('Glitter Hair Magic', 3, 18.00, 25, 'Sparkly glitter hair treatment'),

-- Special Occasions
('Birthday Hair Party', 4, 40.00, 60, 'Special birthday hairstyling experience'),
('Photo Shoot Ready', 4, 35.00, 45, 'Perfect styling for photo sessions'),
('Dance Recital Hair', 4, 30.00, 40, 'Professional styling for performances'),

-- Hair Care & Treatment
('Gentle Conditioning', 5, 20.00, 30, 'Mild conditioning treatment for kids'),
('Detangling Service', 5, 15.00, 20, 'Gentle detangling for difficult hair'),
('Scalp Soothing Treatment', 5, 25.00, 35, 'Gentle scalp care and massage'),

-- Nail Fun
('Kids Manicure', 6, 18.00, 30, 'Fun and colorful nail painting'),
('Nail Art Adventure', 6, 25.00, 40, 'Creative nail art designs'),
('Mini Mani & Pedi', 6, 35.00, 50, 'Complete nail care package for kids');

-- Add sample appointments
INSERT INTO appointments (appointment_number, customer_name, customer_age, parent_name, parent_phone, parent_email, employee_id, service_id, appointment_date, appointment_time, duration_minutes, status, special_notes) VALUES
('APT001', 'Emma Johnson', 6, 'Sarah Johnson', '+1234567890', 'sarah@email.com', 2, 1, '2024-01-15', '10:00:00', 30, 'scheduled', 'First haircut - very excited!'),
('APT002', 'Liam Smith', 8, 'Mike Smith', '+1234567891', 'mike@email.com', 2, 3, '2024-01-15', '14:30:00', 45, 'scheduled', 'Wants a cool trendy look'),
('APT003', 'Sophia Davis', 5, 'Lisa Davis', '+1234567892', 'lisa@email.com', 3, 7, '2024-01-16', '11:00:00', 60, 'scheduled', 'Birthday party tomorrow!');

-- Add a test manager account for easier testing
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('manager', 'manager@moonsalon.com', 'password123', 'manager', 'Sarah Manager', '+1234567899'),
('stylist1', 'stylist1@moonsalon.com', 'password123', 'employee', 'Emma Stylist', '+1234567898');

-- Add employee specialties for the test stylist
INSERT INTO employee_specialties (employee_id, service_category_id) VALUES
(3, 1), -- Kids Haircuts
(3, 2), -- Hair Styling & Braids
(3, 4); -- Special Occasions
