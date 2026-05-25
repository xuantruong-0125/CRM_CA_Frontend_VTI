-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 20, 2026 lúc 02:13 AM
-- Phiên bản máy phục vụ: 9.1.0
-- Phiên bản PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `db_crm`
--

DELIMITER $$
--
-- Thủ tục
--
DROP PROCEDURE IF EXISTS `sp_ConvertLeadToCustomer`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ConvertLeadToCustomer` (IN `p_lead_id` BIGINT, IN `p_user_id` BIGINT, OUT `p_customer_id` BIGINT, OUT `p_contact_id` BIGINT, OUT `p_opportunity_id` BIGINT)   BEGIN
    DECLARE v_contact_name VARCHAR(150); DECLARE v_company_name VARCHAR(200); DECLARE v_phone VARCHAR(20); DECLARE v_email VARCHAR(150); DECLARE v_address VARCHAR(255); DECLARE v_province_id INT; DECLARE v_tax_code VARCHAR(50); DECLARE v_expected_revenue DECIMAL(15,2); DECLARE v_source_id BIGINT; DECLARE v_assigned_to BIGINT; DECLARE v_is_converted TINYINT;
    DECLARE exit handler for sqlexception BEGIN ROLLBACK; RESIGNAL; END;

    SELECT contact_name, company_name, phone, email, address, province_id, tax_code, expected_revenue, source_id, assigned_to, is_converted INTO v_contact_name, v_company_name, v_phone, v_email, v_address, v_province_id, v_tax_code, v_expected_revenue, v_source_id, v_assigned_to, v_is_converted FROM leads WHERE id = p_lead_id AND deleted_at IS NULL;
    IF v_is_converted = 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lead đã được chuyển đổi!'; END IF;

    START TRANSACTION;
    -- 1. Create Customer
    INSERT INTO customers (type, name, short_name, tax_code, phone, email, description, source_id, assigned_to, created_by) VALUES (IF(v_company_name IS NOT NULL AND v_company_name != '', 'B2B', 'B2C'), IFNULL(v_company_name, v_contact_name), IFNULL(v_company_name, v_contact_name), v_tax_code, v_phone, v_email, CONCAT('Convert từ Lead ID: ', p_lead_id), v_source_id, v_assigned_to, p_user_id);
    SET p_customer_id = LAST_INSERT_ID();
    
    -- 2. Create Address
    IF v_address IS NOT NULL OR v_province_id IS NOT NULL THEN INSERT INTO customer_addresses (customer_id, address_type, full_address, province_id, is_primary) VALUES (p_customer_id, 'HQ', IFNULL(v_address, ''), v_province_id, 1); END IF;
    
    -- 3. Create Contact
    INSERT INTO contacts (customer_id, full_name, phone, email, address, is_primary, created_by) VALUES (p_customer_id, v_contact_name, v_phone, v_email, v_address, 1, p_user_id);
    SET p_contact_id = LAST_INSERT_ID();
    
    -- 4. Create Opportunity
    INSERT INTO opportunities (name, customer_id, total_amount, expected_close_date, assigned_user_id, created_by) VALUES (CONCAT('Cơ hội từ ', IFNULL(v_company_name, v_contact_name)), p_customer_id, v_expected_revenue, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), v_assigned_to, p_user_id);
    SET p_opportunity_id = LAST_INSERT_ID();
    
    -- 5. Update Lead
    UPDATE leads 
    SET status_id = (
        SELECT id FROM sys_lead_statuses WHERE code = 'CONVERTED'
    ),
    is_converted = 1,
    converted_customer_id = p_customer_id,
    converted_contact_id = p_contact_id,
    converted_opportunity_id = p_opportunity_id,
    converted_at = NOW(),
    updated_by = p_user_id
    WHERE id = p_lead_id;
    
    -- 6. Transfer Links (Activities, Tasks, Attachments)
    UPDATE activities SET related_to_type = 'CUSTOMER', related_to_id = p_customer_id, updated_by = p_user_id WHERE related_to_type = 'LEAD' AND related_to_id = p_lead_id;
    UPDATE tasks SET related_to_type = 'CUSTOMER', related_to_id = p_customer_id, updated_by = p_user_id WHERE related_to_type = 'LEAD' AND related_to_id = p_lead_id;
    UPDATE attachments SET attachable_type = 'CUSTOMER', attachable_id = p_customer_id WHERE attachable_type = 'LEAD' AND attachable_id = p_lead_id;
    
    -- 7. Audit
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes) VALUES (p_user_id, 'CONVERT', 'LEADS', p_lead_id, JSON_OBJECT('new_customer_id', p_customer_id, 'new_opportunity_id', p_opportunity_id, 'new_contact_id', p_contact_id));
    
    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `activities`
--

DROP TABLE IF EXISTS `activities`;
CREATE TABLE IF NOT EXISTS `activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `activity_type` int NOT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `outcome` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_to_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_to_id` bigint NOT NULL,
  `performed_by` bigint NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` int DEFAULT NULL,
  `is_important` tinyint(1) DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_activity_polymorphic` (`related_to_type`,`related_to_id`),
  KEY `fk_act_user` (`performed_by`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `activities`
--

INSERT INTO `activities` (`id`, `activity_type`, `subject`, `description`, `start_date`, `end_date`, `completed_at`, `outcome`, `related_to_type`, `related_to_id`, `performed_by`, `created_by`, `updated_by`, `created_at`, `updated_at`, `status`, `is_important`, `deleted_at`) VALUES
(1, 2, 'Cuộc gọi tiếp cận (Cold Call) thành công', 'Chị B đã nghe máy, đồng ý nhận thông tin qua email. Thái độ khá cởi mở.', '2026-04-06 15:05:14', NULL, '2026-04-06 15:05:14', 'Kết nối thành công', 'LEAD', 2, 2, NULL, NULL, '2026-04-08 08:05:14', '2026-04-08 08:05:14', NULL, 0, NULL),
(2, 1, 'Đã gửi Email chào mừng và tài liệu', 'Đã gửi profile công ty. Đang chờ khách hàng phản hồi.', '2026-04-07 15:05:14', NULL, '2026-04-07 15:05:14', 'Đã gửi', 'LEAD', 2, 2, NULL, NULL, '2026-04-08 08:05:14', '2026-04-08 08:05:14', NULL, 0, NULL),
(4, 2, 'Cuộc gọi tư vấn giải pháp', 'Khách hàng yêu cầu gửi báo giá chi tiết gói Pro cho 50 user.', NULL, NULL, NULL, NULL, 'CUSTOMER', 2, 2, NULL, NULL, '2026-04-10 02:00:00', '2026-04-12 16:22:38', 1, 0, NULL),
(5, 1, 'Gửi Email báo giá lần 1', 'Đã gửi file PDF báo giá đính kèm chính sách chiết khấu 5%.', NULL, NULL, NULL, NULL, 'CUSTOMER', 2, 2, NULL, NULL, '2026-04-11 03:30:00', '2026-04-12 16:22:38', 1, 0, NULL),
(6, 3, 'Họp trực tiếp tại văn phòng KH', 'Thảo luận về quy trình triển khai và tích hợp API.', NULL, NULL, NULL, NULL, 'CUSTOMER', 3, 2, NULL, NULL, '2026-04-12 07:00:00', '2026-04-12 16:22:38', 1, 0, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attachments`
--

DROP TABLE IF EXISTS `attachments`;
CREATE TABLE IF NOT EXISTS `attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `attachable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachable_id` bigint NOT NULL,
  `uploaded_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_attachable` (`attachable_type`,`attachable_id`),
  KEY `fk_attach_user` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CREATE, UPDATE, DELETE, CONVERT',
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'LEADS, QUOTES, CUSTOMERS...',
  `entity_id` bigint NOT NULL,
  `changes` json DEFAULT NULL COMMENT 'Lưu dạng JSON: {"field": {"old": 1, "new": 2}}',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `changes`, `ip_address`, `created_at`) VALUES
(1, 1, 'CONVERT', 'LEADS', 6, '{\"new_contact_id\": 1, \"new_customer_id\": 1, \"new_opportunity_id\": 1}', NULL, '2026-04-10 05:47:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `campaigns`
--

INSERT INTO `campaigns` (`id`, `name`, `start_date`, `end_date`) VALUES
(1, 'Chiến dịch Mùa Hè 2026', '2026-04-01', '2026-06-30'),
(2, 'Hội thảo Chuyển đổi số', '2026-04-15', '2026-04-20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Phần mềm', 'Bản quyền phần mềm CRM'),
(2, 'Dịch vụ', 'Dịch vụ triển khai và đào tạo');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contacts`
--

DROP TABLE IF EXISTS `contacts`;
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contact_cust` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `contacts`
--

INSERT INTO `contacts` (`id`, `customer_id`, `full_name`, `position`, `phone`, `email`, `address`, `dob`, `notes`, `is_primary`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Test', NULL, '0381234567', 'abc@gmail.com', '123 Test HCM', NULL, NULL, 1, 1, NULL, '2026-04-10 05:47:57', '2026-04-10 05:47:57', NULL),
(2, 2, 'Lê Anh Tuấn', 'Giám đốc Kỹ thuật', '0912345678', 'tuan.le@phanmemviet.vn', NULL, NULL, NULL, 1, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL),
(3, 2, 'Phạm Thị Lan', 'Kế toán trưởng', '0912888999', 'lan.pham@phanmemviet.vn', NULL, NULL, NULL, 0, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL),
(4, 3, 'Trần Quốc Toản', 'Trưởng phòng Thu mua', '0909000111', 'toan.tran@toancaugroup.com', NULL, NULL, NULL, 1, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL),
(5, 6, 'Hoàng Văn Thái', 'Chủ tịch HĐQT', '0987111222', 'thai.hoang@cleanfood.com', NULL, NULL, NULL, 1, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contracts`
--

DROP TABLE IF EXISTS `contracts`;
CREATE TABLE IF NOT EXISTS `contracts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `quote_id` bigint DEFAULT NULL,
  `template_id` bigint DEFAULT NULL,
  `contract_value` decimal(38,2) DEFAULT NULL,
  `currency_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `exchange_rate` decimal(10,4) DEFAULT '1.0000',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `owner_id` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contract_number` (`contract_number`),
  KEY `fk_contract_cust` (`customer_id`),
  KEY `fk_contracts_template` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `customer_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('B2B','B2C') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fax` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `established_date` date DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `source_id` bigint DEFAULT NULL,
  `status_id` bigint DEFAULT NULL,
  `tier_id` bigint DEFAULT NULL,
  `assigned_to` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_code` (`customer_code`),
  KEY `idx_cus_dashboard` (`assigned_to`,`status_id`),
  KEY `fk_cust_parent` (`parent_id`),
  KEY `fk_customers_status` (`status_id`),
  KEY `fk_customers_tier` (`tier_id`),
  KEY `fk_customers_lead_source` (`source_id`),
  KEY `fk_customers_created_by` (`created_by`),
  KEY `fk_customers_updated_by` (`updated_by`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customers`
--

INSERT INTO `customers` (`id`, `parent_id`, `customer_code`, `type`, `name`, `short_name`, `tax_code`, `phone`, `email`, `fax`, `established_date`, `description`, `source_id`, `status_id`, `tier_id`, `assigned_to`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, NULL, 'B2B', 'Công ty Test', 'Công ty Test', '1234567891', '0381234566', 'abc@gmail.com', '', '2026-04-09', 'Convert từ Lead ID: 6', 1, 1, 3, 2, 1, NULL, '2026-04-10 05:47:57', '2026-04-12 13:39:28', NULL),
(2, NULL, 'CUS-2026-001', 'B2B', 'Công ty TNHH Giải pháp Phần mềm Việt', 'Phần mềm Việt', '0101234567', '0243123456', 'contact@phanmemviet.vn', NULL, '2015-05-20', 'Khách hàng quan tâm giải pháp CRM tổng thể.', 1, 1, 1, 4, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 15:13:15', NULL),
(3, NULL, 'CUS-2026-002', 'B2B', 'Tập đoàn Xây dựng Toàn Cầu', 'Toàn Cầu Group', '0309876543', '0283999888', 'info@toancaugroup.com', NULL, '2010-10-10', 'Đối tác chiến lược mảng hạ tầng.', 4, 1, 2, 2, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL),
(4, NULL, 'CUS-2026-003', 'B2C', 'Nguyễn Thị Minh Khai', NULL, NULL, '0901112223', 'khai.nguyen@gmail.com', NULL, NULL, 'Khách hàng cá nhân mua gói lẻ.', 2, 1, 1, 2, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL),
(5, NULL, 'CUS-2026-004', 'B2C', 'Trần Văn Bình', '', '', '0988555444', 'binh.tran88@yahoo.com', '', NULL, 'Khách hàng tiềm năng từ sự kiện Offline.', 1, 1, 1, 2, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 12:09:33', NULL),
(6, NULL, 'CUS-2026-005', 'B2B', 'Công ty Cổ phần Thực phẩm Sạch', 'Clean Food', '0802223334', '0236355544', 'admin@cleanfood.com', '', NULL, 'Khách hàng đang nợ đọng, cần lưu ý.', 1, 1, 1, 2, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 12:09:43', NULL),
(8, NULL, 'CUS-1776020090650', 'B2C', 'Test Them TT', 'TEST', '0987654321', '0987654321', 'abctest@gmail.com', '', '2026-04-09', 'Test Thêm', 2, 1, 1, 2, NULL, NULL, '2026-04-12 11:54:51', '2026-04-12 12:38:00', NULL),
(9, NULL, 'CUS-1776031815892', 'B2C', 'Test111', 'ACV', '1234567890', '0123456789', 'abcfgh@gmail.com', '125347655543', '2026-04-09', 'Test Thêm', 1, 1, 2, 2, NULL, NULL, '2026-04-12 15:10:16', '2026-04-12 15:10:16', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer_addresses`
--

DROP TABLE IF EXISTS `customer_addresses`;
CREATE TABLE IF NOT EXISTS `customer_addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `address_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `province_id` int DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_address_customer` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customer_addresses`
--

INSERT INTO `customer_addresses` (`id`, `customer_id`, `address_type`, `full_address`, `province_id`, `is_primary`) VALUES
(1, 1, 'HQ', '123 Test HCM', 1, 1),
(2, 2, 'HQ', 'Tòa nhà Innovation, Công viên phần mềm Quang Trung, Q.12', 2, 1),
(3, 2, 'BILLING', 'Số 10, Đường số 5, KDC CityLand, Gò Vấp', 2, 0),
(4, 3, 'HQ', '55 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', 1, 1),
(5, 4, 'SHIPPING', '123 Cách Mạng Tháng 8, Quận 3, TP.HCM', 2, 1),
(6, 5, 'HQ', '789 Phan Châu Trinh, Hải Châu, Đà Nẵng', 3, 1),
(7, 1, 'SHIPPING', '1231243', NULL, 0),
(8, 2, 'SHIPPING', 'ABC', NULL, 0),
(9, 9, 'HQ', '123 Test', NULL, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `document_templates`
--

DROP TABLE IF EXISTS `document_templates`;
CREATE TABLE IF NOT EXISTS `document_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` enum('QUOTE','CONTRACT','INVOICE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_html` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `subject` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `priority` enum('LOW','NORMAL','HIGH','URGENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NORMAL',
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `assigned_to` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_fb_cust` (`customer_id`),
  KEY `fk_fb_assign` (`assigned_to`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `feedbacks`
--

INSERT INTO `feedbacks` (`id`, `customer_id`, `subject`, `description`, `priority`, `status`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 2, 'Lỗi không đăng nhập được mobile app', 'Khách hàng báo lỗi 500 khi dùng 4G đăng nhập.', 'HIGH', 'OPEN', 1, NULL, '2026-04-12 09:22:38', '2026-04-12 09:22:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoices`
--

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `template_id` bigint DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `currency_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `exchange_rate` decimal(10,4) DEFAULT '1.0000',
  `issue_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `fk_inv_cust` (`customer_id`),
  KEY `fk_invoices_template` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoice_line_items`
--

DROP TABLE IF EXISTS `invoice_line_items`;
CREATE TABLE IF NOT EXISTS `invoice_line_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(18,2) NOT NULL,
  `total_price` decimal(18,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ili_invoice` (`invoice_id`),
  KEY `fk_ili_product` (`product_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `kpi_configs`
--

DROP TABLE IF EXISTS `kpi_configs`;
CREATE TABLE IF NOT EXISTS `kpi_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `kpi_targets`
--

DROP TABLE IF EXISTS `kpi_targets`;
CREATE TABLE IF NOT EXISTS `kpi_targets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `kpi_config_id` bigint NOT NULL,
  `metric_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_value` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_kpit_conf` (`kpi_config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `leads`
--

DROP TABLE IF EXISTS `leads`;
CREATE TABLE IF NOT EXISTS `leads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contact_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `citizen_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `expected_revenue` decimal(38,2) DEFAULT NULL,
  `source_id` bigint DEFAULT NULL,
  `campaign_id` bigint DEFAULT NULL,
  `organization_id` bigint DEFAULT NULL,
  `assigned_to` bigint DEFAULT NULL,
  `is_converted` tinyint(1) DEFAULT '0',
  `converted_customer_id` bigint DEFAULT NULL,
  `converted_contact_id` bigint DEFAULT NULL,
  `converted_opportunity_id` bigint DEFAULT NULL,
  `converted_at` datetime DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lead_phone` (`phone`),
  KEY `fk_lead_org` (`organization_id`),
  KEY `fk_lead_conv_cust` (`converted_customer_id`),
  KEY `fk_leads_campaign` (`campaign_id`),
  KEY `fk_leads_province` (`province_id`),
  KEY `fk_leads_source` (`source_id`),
  KEY `fk_lead_conv_contact` (`converted_contact_id`),
  KEY `fk_lead_conv_opp` (`converted_opportunity_id`),
  KEY `fk_leads_created_by` (`created_by`),
  KEY `fk_leads_updated_by` (`updated_by`),
  KEY `idx_leads_email` (`email`),
  KEY `idx_leads_contact_name` (`contact_name`),
  KEY `idx_leads_company_name` (`company_name`),
  KEY `fk_leads_status` (`status_id`),
  KEY `idx_lead_assign` (`assigned_to`),
  KEY `idx_lead_dashboard` (`assigned_to`,`status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `leads`
--

INSERT INTO `leads` (`id`, `contact_name`, `company_name`, `phone`, `email`, `address`, `website`, `tax_code`, `citizen_id`, `province_id`, `description`, `expected_revenue`, `source_id`, `campaign_id`, `organization_id`, `assigned_to`, `is_converted`, `converted_customer_id`, `converted_contact_id`, `converted_opportunity_id`, `converted_at`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `status_id`) VALUES
(1, 'Trần Văn A', 'Công ty Cổ phần ABC', '0901111222', 'tran.a@abc.com', '123 Nguyễn Văn Linh, Quận 7', NULL, NULL, NULL, 2, NULL, 50000000.00, 1, 1, 2, 2, 0, NULL, NULL, NULL, NULL, 1, NULL, '2026-04-08 08:05:14', '2026-04-10 03:23:30', NULL, 1),
(2, 'Nguyễn Thị B', 'Công ty TNHH TM XYZ', '0988333444', 'b.nguyen@xyz.vn', '456 Lê Lợi, Hoàn Kiếm', NULL, NULL, NULL, 1, NULL, 120000000.00, 2, 1, 2, 2, 0, NULL, NULL, NULL, NULL, 2, NULL, '2026-04-08 08:05:14', '2026-04-10 03:23:30', NULL, 2),
(3, 'Lê Văn C', NULL, '0912555666', 'levanc_personal@gmail.com', '789 Trần Phú, Hải Châu', '', NULL, NULL, 3, '', 15000000.00, 3, 2, 2, 1, 0, NULL, NULL, NULL, NULL, 1, NULL, '2026-04-08 08:05:14', '2026-04-10 05:19:08', NULL, 4),
(6, 'Test', 'Công ty Test', '0381234567', 'abc@gmail.com', '123 Test HCM', '', '1234567890', '123456789011', 1, 'Test Thêm', 50000000.00, 1, 1, NULL, 2, 1, 1, 1, 1, '2026-04-10 12:47:57', NULL, 1, '2026-04-10 05:18:41', '2026-04-10 05:47:57', NULL, 3),
(7, 'Testets', 'Tsesaa', '0381234562', 'agb@gmail.com', '123 Test HN', '', '1234567890', '123456789000', 1, 'Test lai them', 200000000.00, 1, 2, NULL, 2, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-10 05:29:30', '2026-04-10 12:29:37', NULL, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lead_product_interests`
--

DROP TABLE IF EXISTS `lead_product_interests`;
CREATE TABLE IF NOT EXISTS `lead_product_interests` (
  `lead_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`lead_id`,`product_id`),
  KEY `fk_lpi_prod` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lead_product_interests`
--

INSERT INTO `lead_product_interests` (`lead_id`, `product_id`) VALUES
(1, 1),
(7, 1),
(2, 2),
(3, 2),
(6, 2),
(7, 2),
(1, 3),
(6, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loss_reasons`
--

DROP TABLE IF EXISTS `loss_reasons`;
CREATE TABLE IF NOT EXISTS `loss_reasons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `menus`
--

DROP TABLE IF EXISTS `menus`;
CREATE TABLE IF NOT EXISTS `menus` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_menu_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notes`
--

DROP TABLE IF EXISTS `notes`;
CREATE TABLE IF NOT EXISTS `notes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notable_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notable_id` bigint NOT NULL,
  `created_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_note_polymorphic` (`notable_type`,`notable_id`,`created_date` DESC),
  KEY `idx_note_created` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `notes`
--

INSERT INTO `notes` (`id`, `content`, `created_date`, `notable_type`, `notable_id`, `created_by`) VALUES
(1, 'Khách hàng ABC đang dùng hệ thống cũ, muốn tìm hiểu tính năng Automation.', '2026-04-08 08:05:14', 'LEAD', 1, 2),
(2, 'Chị B báo ngân sách phòng Marketing năm nay khoảng 100-150 triệu.', '2026-04-08 08:05:14', 'LEAD', 2, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `opportunities`
--

DROP TABLE IF EXISTS `opportunities`;
CREATE TABLE IF NOT EXISTS `opportunities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `pipeline_id` bigint DEFAULT NULL,
  `stage_id` bigint DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `deposit_amount` decimal(15,2) DEFAULT NULL,
  `remaining_amount` decimal(15,2) DEFAULT NULL,
  `currency_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `exchange_rate` decimal(10,4) DEFAULT '1.0000',
  `expected_close_date` date DEFAULT NULL,
  `loss_reason_id` bigint DEFAULT NULL,
  `health_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_user_id` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_opp_dashboard` (`assigned_user_id`,`stage_id`),
  KEY `fk_opp_cust` (`customer_id`),
  KEY `fk_opp_stage` (`stage_id`),
  KEY `fk_opp_loss` (`loss_reason_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `opportunities`
--

INSERT INTO `opportunities` (`id`, `name`, `customer_id`, `pipeline_id`, `stage_id`, `total_amount`, `deposit_amount`, `remaining_amount`, `currency_code`, `exchange_rate`, `expected_close_date`, `loss_reason_id`, `health_status`, `assigned_user_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Cơ hội từ Công ty Test', 1, NULL, NULL, 50000000.00, NULL, NULL, 'VND', 1.0000, '2026-05-10', NULL, 'ON_TRACK', 2, 1, NULL, '2026-04-10 05:47:57', '2026-04-10 05:47:57', NULL),
(2, 'Triển khai CRM cho Công ty Phần mềm Việt', 2, NULL, NULL, 150000000.00, NULL, NULL, 'VND', 1.0000, '2026-06-30', NULL, 'ON_TRACK', 2, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL),
(3, 'Cung cấp giải pháp quản lý hạ tầng - Toàn Cầu', 3, NULL, NULL, 500000000.00, NULL, NULL, 'VND', 1.0000, '2026-12-15', NULL, 'AT_RISK', 2, NULL, NULL, '2026-04-12 16:22:38', '2026-04-12 16:22:38', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `opportunity_id` bigint DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `currency_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `exchange_rate` decimal(10,4) DEFAULT '1.0000',
  `status` enum('DRAFT','CONFIRMED','PROCESSING','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `fk_order_cust` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_line_items`
--

DROP TABLE IF EXISTS `order_line_items`;
CREATE TABLE IF NOT EXISTS `order_line_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(18,2) NOT NULL,
  `total_price` decimal(18,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_oli_order` (`order_id`),
  KEY `fk_oli_product` (`product_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `organizations`
--

DROP TABLE IF EXISTS `organizations`;
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_org_parent` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `parent_id`, `created_at`, `updated_at`) VALUES
(1, 'Công ty TNHH phần mềm CRM', NULL, '2026-04-08 08:05:13', '2026-04-08 08:05:13'),
(2, 'Phòng Kinh Doanh', 1, '2026-04-08 08:05:13', '2026-04-08 08:05:13');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pipelines`
--

DROP TABLE IF EXISTS `pipelines`;
CREATE TABLE IF NOT EXISTS `pipelines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pipeline_stages`
--

DROP TABLE IF EXISTS `pipeline_stages`;
CREATE TABLE IF NOT EXISTS `pipeline_stages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `pipeline_id` bigint NOT NULL,
  `stage_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `probability` int DEFAULT NULL,
  `max_days_allowed` int DEFAULT NULL COMMENT 'SLA cảnh báo ngâm Deal',
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_stage_pipe` (`pipeline_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sku_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('PRODUCT','SERVICE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRODUCT',
  `category_id` bigint DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_sku` (`sku_code`),
  KEY `fk_prod_cat` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `sku_code`, `name`, `type`, `category_id`, `description`, `is_active`, `created_by`, `created_at`, `deleted_at`) VALUES
(1, 'CRM-BASIC', 'Gói phần mềm CRM Cơ bản', 'PRODUCT', 1, NULL, 1, NULL, '2026-04-08 08:05:14', NULL),
(2, 'CRM-PRO', 'Gói phần mềm CRM Nâng cao', 'PRODUCT', 1, NULL, 1, NULL, '2026-04-08 08:05:14', NULL),
(3, 'SRV-TRAIN', 'Gói đào tạo Onsite', 'SERVICE', 2, NULL, 1, NULL, '2026-04-08 08:05:14', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_prices`
--

DROP TABLE IF EXISTS `product_prices`;
CREATE TABLE IF NOT EXISTS `product_prices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `base_price` decimal(15,2) DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `final_price` decimal(15,2) DEFAULT NULL,
  `currency_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_price_prod` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `provinces`
--

DROP TABLE IF EXISTS `provinces`;
CREATE TABLE IF NOT EXISTS `provinces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `provinces`
--

INSERT INTO `provinces` (`id`, `name`, `code`) VALUES
(1, 'Hà Nội', 'HN'),
(2, 'Hồ Chí Minh', 'HCM'),
(3, 'Đà Nẵng', 'DN');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quotes`
--

DROP TABLE IF EXISTS `quotes`;
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quote_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `opportunity_id` bigint DEFAULT NULL,
  `status_id` bigint DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `currency_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `exchange_rate` decimal(10,4) DEFAULT '1.0000',
  `valid_until` date DEFAULT NULL,
  `template_id` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quote_number` (`quote_number`),
  KEY `fk_quote_cust` (`customer_id`),
  KEY `fk_quotes_template` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quote_line_items`
--

DROP TABLE IF EXISTS `quote_line_items`;
CREATE TABLE IF NOT EXISTS `quote_line_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quote_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_value` decimal(15,2) DEFAULT '0.00',
  `line_total` decimal(15,2) GENERATED ALWAYS AS (((`quantity` * `unit_price`) - `discount_value`)) STORED,
  PRIMARY KEY (`id`),
  KEY `fk_qli_quote` (`quote_id`),
  KEY `fk_qli_prod` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Bẫy `quote_line_items`
--
DROP TRIGGER IF EXISTS `trg_qli_after_delete`;
DELIMITER $$
CREATE TRIGGER `trg_qli_after_delete` AFTER DELETE ON `quote_line_items` FOR EACH ROW BEGIN UPDATE quotes q SET q.total_amount = (SELECT IFNULL(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = OLD.quote_id) WHERE q.id = OLD.quote_id; END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_qli_after_insert`;
DELIMITER $$
CREATE TRIGGER `trg_qli_after_insert` AFTER INSERT ON `quote_line_items` FOR EACH ROW BEGIN UPDATE quotes q SET q.total_amount = (SELECT IFNULL(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = NEW.quote_id) WHERE q.id = NEW.quote_id; END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_qli_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_qli_after_update` AFTER UPDATE ON `quote_line_items` FOR EACH ROW BEGIN UPDATE quotes q SET q.total_amount = (SELECT IFNULL(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = OLD.quote_id) WHERE q.id = OLD.quote_id; IF NEW.quote_id <> OLD.quote_id THEN UPDATE quotes q SET q.total_amount = (SELECT IFNULL(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = NEW.quote_id) WHERE q.id = NEW.quote_id; END IF; END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'Sales Representative', 'Nhân viên kinh doanh');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role_menu_permissions`
--

DROP TABLE IF EXISTS `role_menu_permissions`;
CREATE TABLE IF NOT EXISTS `role_menu_permissions` (
  `role_id` bigint NOT NULL,
  `menu_id` bigint NOT NULL,
  `can_view` tinyint(1) DEFAULT '0',
  `can_create` tinyint(1) DEFAULT '0',
  `can_update` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`role_id`,`menu_id`),
  KEY `menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stage_checklists`
--

DROP TABLE IF EXISTS `stage_checklists`;
CREATE TABLE IF NOT EXISTS `stage_checklists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `stage_id` bigint NOT NULL,
  `task_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_mandatory` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_check_stage` (`stage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sys_configs`
--

DROP TABLE IF EXISTS `sys_configs`;
CREATE TABLE IF NOT EXISTS `sys_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'timezone, language, default_currency, smtp_server...',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sys_customer_statuses`
--

DROP TABLE IF EXISTS `sys_customer_statuses`;
CREATE TABLE IF NOT EXISTS `sys_customer_statuses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sys_customer_statuses`
--

INSERT INTO `sys_customer_statuses` (`id`, `code`, `name`) VALUES
(1, 'ACTIVE', 'Đang chăm sóc'),
(2, 'STOP_CARING', 'Ngừng chăm sóc'),
(3, 'BLACKLIST', 'Khách hàng xấu (Blacklist)'),
(4, 'OTHER', 'Khác');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sys_customer_tiers`
--

DROP TABLE IF EXISTS `sys_customer_tiers`;
CREATE TABLE IF NOT EXISTS `sys_customer_tiers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_spending` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sys_customer_tiers`
--

INSERT INTO `sys_customer_tiers` (`id`, `code`, `name`, `min_spending`) VALUES
(1, 'SILVER', 'Bạc', 0.00),
(2, 'GOLD', 'Vàng', 50000000.00),
(3, 'PLATINUM', 'Kim cương', 200000000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sys_lead_sources`
--

DROP TABLE IF EXISTS `sys_lead_sources`;
CREATE TABLE IF NOT EXISTS `sys_lead_sources` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sys_lead_sources`
--

INSERT INTO `sys_lead_sources` (`id`, `name`) VALUES
(1, 'Form Đăng ký Website'),
(2, 'Facebook Ads'),
(3, 'Sự kiện Offline'),
(4, 'Khách hàng giới thiệu');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sys_lead_statuses`
--

DROP TABLE IF EXISTS `sys_lead_statuses`;
CREATE TABLE IF NOT EXISTS `sys_lead_statuses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `sys_lead_statuses`
--

INSERT INTO `sys_lead_statuses` (`id`, `code`, `name`) VALUES
(1, 'NEW', 'Mới'),
(2, 'CONTACTING', 'Đang liên hệ'),
(3, 'CONVERTED', 'Đã chuyển đổi'),
(4, 'HAS_TRANSACTION', 'Phát sinh giao dịch'),
(5, 'STOP_CARING', 'Ngừng chăm sóc');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `target_assignments`
--

DROP TABLE IF EXISTS `target_assignments`;
CREATE TABLE IF NOT EXISTS `target_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `kpi_config_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL COMMENT 'Áp dụng cho Cá nhân',
  `organization_id` bigint DEFAULT NULL COMMENT 'Áp dụng cho Nhóm/Phòng ban',
  `commission_percent` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ta_conf` (`kpi_config_id`),
  KEY `fk_ta_user` (`user_id`),
  KEY `fk_ta_org` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tasks`
--

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `start_date` datetime DEFAULT NULL,
  `due_date` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `status` enum('NOT_STARTED','IN_PROGRESS','WAITING','COMPLETED','DEFERRED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NOT_STARTED',
  `priority` enum('LOW','NORMAL','HIGH','URGENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NORMAL',
  `progress_percent` int DEFAULT '0',
  `related_to_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_to_id` bigint DEFAULT NULL,
  `assigned_to` bigint NOT NULL,
  `assigned_by` bigint NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `contact_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_task_assignee` (`assigned_to`),
  KEY `idx_task_polymorphic` (`related_to_type`,`related_to_id`),
  KEY `fk_task_assigner` (`assigned_by`),
  KEY `fk_tasks_contact` (`contact_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tasks`
--

INSERT INTO `tasks` (`id`, `subject`, `description`, `start_date`, `due_date`, `completed_at`, `status`, `priority`, `progress_percent`, `related_to_type`, `related_to_id`, `assigned_to`, `assigned_by`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `contact_id`) VALUES
(1, 'Gọi điện tư vấn lần 1 - Lead ABC', 'Cần chuẩn bị slide giới thiệu các tính năng tự động hóa.', '2026-04-08 15:05:14', '2026-04-10 15:05:14', NULL, 'NOT_STARTED', 'HIGH', 0, 'LEAD', 1, 2, 2, NULL, NULL, '2026-04-08 08:05:14', '2026-04-08 08:05:14', NULL, NULL),
(2, 'Gửi báo giá sơ bộ cho chị B', 'Gửi báo giá gói Pro kèm discount 10% theo chiến dịch.', '2026-04-08 15:05:14', '2026-04-09 15:05:14', NULL, 'IN_PROGRESS', 'NORMAL', 0, 'LEAD', 2, 2, 2, NULL, NULL, '2026-04-08 08:05:14', '2026-04-08 08:05:14', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` bigint NOT NULL,
  `organization_id` bigint NOT NULL,
  `status` enum('ACTIVE','INACTIVE','LOCKED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `ui_preferences` json DEFAULT NULL COMMENT 'Cấu hình UI Dashboard cá nhân',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_role` (`role_id`),
  KEY `idx_user_org` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `role_id`, `organization_id`, `status`, `ui_preferences`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'admin', 'hashed_password_123', 'admin@crm.vn', 'Quản trị viên', 1, 1, 'ACTIVE', NULL, NULL, '2026-04-08 08:05:13', '2026-04-08 08:05:13', NULL),
(2, 'nv_sale_1', 'hashed_password_456', 'sale1@crm.vn', 'Nguyễn Văn Sale', 2, 2, 'ACTIVE', NULL, NULL, '2026-04-08 08:05:13', '2026-04-08 08:05:13', NULL),
(3, 'sale2', '', 'sale2@crm.vn', 'Trần Thị Marketing', 2, 2, 'ACTIVE', NULL, NULL, '2026-04-12 22:13:01', '2026-04-12 22:13:01', NULL),
(4, 'sale3', '', 'sale3@crm.vn', 'Lê Văn Hỗ Trợ', 2, 2, 'ACTIVE', NULL, NULL, '2026-04-12 22:13:01', '2026-04-12 22:13:01', NULL);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `fk_act_user` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `fk_attach_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `fk_contact_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `fk_contract_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_contracts_template` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_cust_assign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cust_parent` FOREIGN KEY (`parent_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_customers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_customers_lead_source` FOREIGN KEY (`source_id`) REFERENCES `sys_lead_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customers_status` FOREIGN KEY (`status_id`) REFERENCES `sys_customer_statuses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customers_tier` FOREIGN KEY (`tier_id`) REFERENCES `sys_customer_tiers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD CONSTRAINT `fk_addr_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD CONSTRAINT `fk_fb_assign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_fb_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_inv_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invoices_template` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `kpi_targets`
--
ALTER TABLE `kpi_targets`
  ADD CONSTRAINT `fk_kpit_conf` FOREIGN KEY (`kpi_config_id`) REFERENCES `kpi_configs` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_lead_assign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lead_conv_contact` FOREIGN KEY (`converted_contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lead_conv_cust` FOREIGN KEY (`converted_customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lead_conv_opp` FOREIGN KEY (`converted_opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lead_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leads_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leads_province` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_source` FOREIGN KEY (`source_id`) REFERENCES `sys_lead_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_status` FOREIGN KEY (`status_id`) REFERENCES `sys_lead_statuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `lead_product_interests`
--
ALTER TABLE `lead_product_interests`
  ADD CONSTRAINT `fk_lpi_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lpi_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `fk_note_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `opportunities`
--
ALTER TABLE `opportunities`
  ADD CONSTRAINT `fk_opp_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `fk_opp_loss` FOREIGN KEY (`loss_reason_id`) REFERENCES `loss_reasons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_opp_stage` FOREIGN KEY (`stage_id`) REFERENCES `pipeline_stages` (`id`);

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Các ràng buộc cho bảng `organizations`
--
ALTER TABLE `organizations`
  ADD CONSTRAINT `fk_org_parent` FOREIGN KEY (`parent_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `pipeline_stages`
--
ALTER TABLE `pipeline_stages`
  ADD CONSTRAINT `fk_stage_pipe` FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_prod_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `product_prices`
--
ALTER TABLE `product_prices`
  ADD CONSTRAINT `fk_price_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `fk_quote_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quotes_template` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `quote_line_items`
--
ALTER TABLE `quote_line_items`
  ADD CONSTRAINT `fk_qli_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_qli_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `role_menu_permissions`
--
ALTER TABLE `role_menu_permissions`
  ADD CONSTRAINT `role_menu_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_menu_permissions_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `stage_checklists`
--
ALTER TABLE `stage_checklists`
  ADD CONSTRAINT `fk_check_stage` FOREIGN KEY (`stage_id`) REFERENCES `pipeline_stages` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `target_assignments`
--
ALTER TABLE `target_assignments`
  ADD CONSTRAINT `fk_ta_conf` FOREIGN KEY (`kpi_config_id`) REFERENCES `kpi_configs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ta_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ta_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_task_assignee` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_task_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_tasks_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
