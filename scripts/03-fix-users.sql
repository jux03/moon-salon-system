-- Fix users table and ensure test accounts exist

-- First, let's make sure we have the right users
DELETE FROM users WHERE username IN ('owner', 'manager', 'stylist1');

-- Insert users with plain text passwords for testing
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('owner', 'owner@moonsalon.com', 'password123', 'owner', 'Moon Salon Owner', '+1234567890'),
('manager', 'manager@moonsalon.com', 'password123', 'manager', 'Sarah Manager', '+1234567899'),
('stylist1', 'stylist1@moonsalon.com', 'password123', 'employee', 'Emma Stylist', '+1234567898');

-- Add employee specialties for the test stylist
DELETE FROM employee_specialties WHERE employee_id IN (SELECT id FROM users WHERE username = 'stylist1');

INSERT INTO employee_specialties (employee_id, service_category_id) 
SELECT u.id, 1 FROM users u WHERE u.username = 'stylist1'
UNION ALL
SELECT u.id, 2 FROM users u WHERE u.username = 'stylist1'
UNION ALL
SELECT u.id, 4 FROM users u WHERE u.username = 'stylist1';

-- Verify the users were created
SELECT id, username, email, role, full_name FROM users;
