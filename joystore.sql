-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 29, 2025 at 06:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `joystore`
--

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_products`
-- (See below for the actual view)
--
CREATE TABLE `active_products` (
`id` char(36)
,`name` varchar(255)
,`brand` varchar(255)
,`category` varchar(255)
,`description` text
,`actualPrice` decimal(10,2)
,`discountPrice` decimal(10,2)
,`finalPrice` decimal(10,2)
,`quantity` int(11)
,`featured` tinyint(1)
,`image` text
,`color` varchar(50)
,`created_at` timestamp
,`updated_at` timestamp
,`sku` varchar(50)
,`keyFeatures` longtext
,`specifications` longtext
,`productDetails` text
,`rating` decimal(2,1)
,`reviewCount` int(11)
,`availability` varchar(50)
,`originalPrice` decimal(10,2)
,`savings` decimal(10,2)
,`tags` longtext
,`is_deleted` tinyint(1)
,`deleted_at` timestamp
,`deleted_reason` text
);

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `image`, `slug`, `description`, `featured`, `createdAt`, `updatedAt`) VALUES
('00707dcb-d4e0-4e4d-9edf-0f221b570243', 'CVR', 'image-1748662133933-737685501.jpg', 'cvr', NULL, 0, '2025-05-31 03:28:53', '2025-05-31 03:28:53'),
('4474b0e9-103b-4853-811e-f7feb73406cf', 'Samsung', 'image-1748537964830.png', 'samsung', NULL, 0, '2025-05-21 19:39:23', '2025-05-29 16:59:24'),
('c2f80799-8392-4069-b2a6-94c1318f37a5', 'Marshall', 'image-1748537937044.png', 'marshall', NULL, 0, '2025-05-21 20:16:40', '2025-05-29 16:58:57'),
('fca9cb15-38a2-4caf-a1f0-d45d67c4e6f0', 'Apple', 'image-1748415871040.jpeg', 'apple', NULL, 0, '2025-05-21 19:39:03', '2025-05-28 07:04:31'),
('ff2113e1-71cc-4486-845d-cb685920041a', 'Lenovo', 'image-1748537902431.jpeg', 'lenovo', NULL, 0, '2025-05-21 19:39:17', '2025-05-29 16:58:22');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` varchar(36) CHARACTER SET armscii8 COLLATE armscii8_general_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `selected` tinyint(1) DEFAULT 1,
  `original_price` decimal(10,2) DEFAULT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT NULL,
  `discount_value` decimal(10,2) DEFAULT NULL,
  `sale_id` varchar(255) DEFAULT NULL,
  `sale_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `brandId` char(36) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `brandId`, `createdAt`, `updatedAt`) VALUES
('08692376-2622-42f0-a735-8db4eec7653c', 'Smartphone', 'smartphone', '4474b0e9-103b-4853-811e-f7feb73406cf', '2025-06-08 05:06:50', '2025-06-08 05:06:50'),
('6055cfec-f033-4a83-af72-00502a61d70d', 'Iphone', 'iphone', 'fca9cb15-38a2-4caf-a1f0-d45d67c4e6f0', '2025-05-23 09:59:17', '2025-05-23 09:59:17'),
('80d4cba3-8a22-4679-abbe-c736cd39b379', 'Speakers', 'speakers', 'c2f80799-8392-4069-b2a6-94c1318f37a5', '2025-05-21 20:17:05', '2025-05-21 20:17:05'),
('9b3d13be-a7d5-4259-b039-2939ffeb1ca5', 'Tabs', 'tabs', '4474b0e9-103b-4853-811e-f7feb73406cf', '2025-05-31 03:36:43', '2025-05-31 03:36:43'),
('b0b058d8-3802-40a8-8436-33ddfec3b169', 'Smart Watches', 'smart-watches', 'fca9cb15-38a2-4caf-a1f0-d45d67c4e6f0', '2025-06-06 12:08:43', '2025-06-06 12:08:43'),
('d85fd94a-f1c1-4e5b-92a5-7893a5211af5', 'Ipads', 'ipads', 'fca9cb15-38a2-4caf-a1f0-d45d67c4e6f0', '2025-06-06 12:12:25', '2025-06-06 12:12:25'),
('f018bc48-377b-4b02-a79b-69d614b53c93', 'Mac Book', 'mac-book', 'fca9cb15-38a2-4caf-a1f0-d45d67c4e6f0', '2025-05-21 19:52:12', '2025-05-21 19:52:12');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `phone`, `email`, `subject`, `message`, `created_at`, `updated_at`) VALUES
('74a708f1-4189-41cb-abda-eaa087736837', 'Its Sunab', '9810010010', 'test1@gmail.com', 'support', 'help me in my purchase', '2025-06-06 12:43:55', '2025-06-06 12:43:55');

-- --------------------------------------------------------

--
-- Stand-in structure for view `deleted_products`
-- (See below for the actual view)
--
CREATE TABLE `deleted_products` (
`id` char(36)
,`name` varchar(255)
,`brand` varchar(255)
,`category` varchar(255)
,`description` text
,`actualPrice` decimal(10,2)
,`discountPrice` decimal(10,2)
,`finalPrice` decimal(10,2)
,`quantity` int(11)
,`featured` tinyint(1)
,`image` text
,`color` varchar(50)
,`created_at` timestamp
,`updated_at` timestamp
,`sku` varchar(50)
,`keyFeatures` longtext
,`specifications` longtext
,`productDetails` text
,`rating` decimal(2,1)
,`reviewCount` int(11)
,`availability` varchar(50)
,`originalPrice` decimal(10,2)
,`savings` decimal(10,2)
,`tags` longtext
,`is_deleted` tinyint(1)
,`deleted_at` timestamp
,`deleted_reason` text
);

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` char(36) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `order`, `created_at`, `updated_at`) VALUES
('d100f657-2241-446e-917c-da08d9de1d5f', 'How can i make a payment when purchsing from store??', 'You can pay Via COD (Cash on Delivery) or you can use online payment like esewa, khalti or PhonePay ', 1, '2025-04-04 12:42:52', '2025-06-03 13:57:51');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','unsubscribed') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `newsletter_subscribers`
--

INSERT INTO `newsletter_subscribers` (`id`, `email`, `name`, `subscribed_at`, `status`) VALUES
('0116258c-0fd8-44d5-be74-3943f893af2e', 'sunabbaskota@gmail.com', NULL, '2025-05-27 07:27:09', 'active'),
('0f5722ee-acd0-4925-9b4b-da57f5e18a27', 'james.bond000@gmail.com', NULL, '2025-06-01 19:16:32', 'active'),
('6082c1fc-09c3-4c47-bd03-89fd4cb3f1b1', 'prakashtimilsina76@gmail.com', NULL, '2025-04-29 03:04:51', 'active'),
('7468df9f-a795-4c63-9a22-50c3a11c55f7', 'rbaskota10@gmail.com', NULL, '2025-05-27 07:26:18', 'active'),
('a67bdd39-5af3-4155-8101-20a739c538b9', 'developer@gmail.com', NULL, '2025-04-29 04:53:35', 'active'),
('ce44c4cd-4626-4b3a-a3f2-0250a8daab14', 'surajkhadka@spacex.com', NULL, '2025-04-29 04:53:47', 'active'),
('d1acc43c-7db7-4ef2-8894-01025d5036f2', 'test@gmail.com', NULL, '2025-04-28 03:21:50', 'active'),
('d852af58-19f1-459a-9e44-cf5cf68c4aa6', 'darkshadow2057@gmmail.com', NULL, '2025-06-06 12:35:46', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `notification_settings`
--

CREATE TABLE `notification_settings` (
  `id` varchar(36) NOT NULL,
  `order_confirmation` tinyint(1) DEFAULT 1,
  `order_delivery` tinyint(1) DEFAULT 1,
  `low_stock_alert` tinyint(1) DEFAULT 1,
  `new_user_registration` tinyint(1) DEFAULT 1,
  `order_cancellation` tinyint(1) DEFAULT 1,
  `payment_confirmation` tinyint(1) DEFAULT 1,
  `newsletter_subscription` tinyint(1) DEFAULT 0,
  `promotional_emails` tinyint(1) DEFAULT 0,
  `sms_notifications` tinyint(1) DEFAULT 0,
  `email_notifications` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_settings`
--

INSERT INTO `notification_settings` (`id`, `order_confirmation`, `order_delivery`, `low_stock_alert`, `new_user_registration`, `order_cancellation`, `payment_confirmation`, `newsletter_subscription`, `promotional_emails`, `sms_notifications`, `email_notifications`, `created_at`, `updated_at`) VALUES
('54a60392-4dd4-492c-b07d-bc5956b4df48', 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, '2025-05-31 08:30:01', '2025-05-31 08:30:01');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`shipping_address`)),
  `payment_method` varchar(50) NOT NULL DEFAULT 'credit_card',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `promo_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `sale_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `shipping_address`, `payment_method`, `status`, `created_at`, `updated_at`, `promo_code`, `discount_amount`, `sale_id`) VALUES
('0b58e5e0-185d-43a3-9ce8-520eaca13bd0', '62a0eae4-0671-40b8-9398-8faedc09768c', 169000.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tinkune, Kathmandu\",\"city\":\"\",\"district\":\"\",\"province\":\"\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-12 00:06:23', NULL, NULL, 0.00, NULL),
('0e36c4db-2c35-42dc-bbd9-4f5a63592c67', '62a0eae4-0671-40b8-9398-8faedc09768c', 140300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"gadatantra chowk\",\"city\":\"Damak\",\"district\":\"jhapa\",\"province\":\"koshi\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:43:44', NULL, NULL, 0.00, NULL),
('15ef807f-779d-4517-ba74-3ecc8893dc01', '62a0eae4-0671-40b8-9398-8faedc09768c', 331800.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Schoolchaun\",\"city\":\"Gauradaha\",\"district\":\"jhapa\",\"province\":\"koshi\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-06 18:26:50', NULL, 'ASHAR', 58500.00, NULL),
('17b7fcec-811a-4e82-9085-fb082be41750', '62a0eae4-0671-40b8-9398-8faedc09768c', 84650.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Bara, Parsa\",\"city\":\"Birgunj\",\"district\":\"parsa\",\"province\":\"province2\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-06 17:44:30', NULL, 'NEWTON', 84350.00, NULL),
('1baa546f-06ca-4e8a-8dc5-886c128eca31', '62a0eae4-0671-40b8-9398-8faedc09768c', 169000.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"somewhere\",\"city\":\"somewhere\",\"district\":\"rupandehi\",\"province\":\"lumbini\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:33:18', NULL, NULL, 0.00, NULL),
('1e6f28d0-557e-49ae-8e0e-48ef59965394', '9629a361-1ea6-49a0-9685-5146d8042662', 200.00, '{\"name\":\"Newton Timilsina\",\"phone\":\"9841454545\",\"address\":\"Brihaspati, Marga\",\"city\":\"Balkot\",\"district\":\"bhaktapur\",\"province\":\"bagmati\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-05-30 15:59:17', NULL, NULL, 0.00, NULL),
('2829850b-31fe-4e93-bbac-c3157b5789a3', '62a0eae4-0671-40b8-9398-8faedc09768c', 750.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tinkune, Kathmandu\",\"city\":\"kathmandu\",\"district\":\"bhojpur\",\"province\":\"koshi\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:56:50', NULL, NULL, 0.00, NULL),
('2e6442f8-9db6-4920-b4d0-89a0fa0c820a', '62a0eae4-0671-40b8-9398-8faedc09768c', 389800.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"anywhere\",\"city\":\"something \",\"district\":\"saptari\",\"province\":\"province2\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-08 10:39:38', NULL, 'DASHAIN', 500.00, NULL),
('3d7eddd5-7b00-4cdc-8b8b-a527217f1d9a', '62a0eae4-0671-40b8-9398-8faedc09768c', 390300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tarkhal\",\"city\":\"Suryabinayak\",\"district\":\"bhaktapur\",\"province\":\"bagmati\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:15:35', NULL, NULL, 0.00, NULL),
('441bcb96-ba0b-45fb-8163-b003d3c4605c', '62a0eae4-0671-40b8-9398-8faedc09768c', 200.00, '{\"name\":\"Test User\",\"phone\":\"9814945424\",\"address\":\"Gangabu\",\"city\":\"Jhapa\",\"postalCode\":\"45689\",\"country\":\"France\"}', 'cod', 'cancelled', '2025-05-23 16:00:15', '2025-05-28 21:57:52', NULL, 0.00, NULL),
('46f9acd5-55ca-447d-a838-2181a30f6416', '62a0eae4-0671-40b8-9398-8faedc09768c', 387300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"itahari chowk\",\"city\":\"Itahari\",\"district\":\"sunsari\",\"province\":\"koshi\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-07 16:30:55', NULL, 'ASHAR100', 3000.00, NULL),
('5d3158ef-d691-4bbe-a2ba-e7d2cb6741a2', '62a0eae4-0671-40b8-9398-8faedc09768c', 680.00, '{\"name\":\"Test User\",\"phone\":\"9814945424\",\"address\":\"Tinkune\",\"city\":\"kathmandu\",\"district\":\"kathmandu\",\"province\":\"bagmati\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-05-29 20:39:37', NULL, NULL, 0.00, NULL),
('676f7e29-4a54-49e9-bee9-cdba9886b092', '62a0eae4-0671-40b8-9398-8faedc09768c', 6800.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tinkune, Kathmandu\",\"city\":\"\",\"district\":\"\",\"province\":\"\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:57:38', NULL, NULL, 0.00, NULL),
('6e1a8b50-9442-4c12-a2bb-1932f0830961', '62a0eae4-0671-40b8-9398-8faedc09768c', 169750.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"kailash Parbat\",\"city\":\"Mansarovar\",\"district\":\"dhanusha\",\"province\":\"province2\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'delivered', '2025-05-31 10:36:54', '2025-05-31 10:39:09', NULL, 0.00, NULL),
('87f099d5-b13f-4b94-8e8c-842648d68201', '62a0eae4-0671-40b8-9398-8faedc09768c', 700.00, '{\"name\":\"Test User\",\"phone\":\"9814945424\",\"address\":\"Gangabu\",\"city\":\"\",\"postalCode\":\"\",\"country\":\"United States\"}', 'cod', 'processing', '2025-05-22 15:56:49', '2025-05-28 22:00:04', NULL, 0.00, NULL),
('96256417-e28d-4255-8ae7-990fe7c248d8', '62a0eae4-0671-40b8-9398-8faedc09768c', 140300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Schoolchaun\",\"city\":\"Gauradaha\",\"district\":\"jhapa\",\"province\":\"koshi\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:22:53', NULL, NULL, 0.00, NULL),
('99c59de8-a7bf-4738-8315-7b9320fec7da', '9629a361-1ea6-49a0-9685-5146d8042662', 200.00, '{\"name\":\"Newton Timilsina\",\"phone\":\"9841454545\",\"address\":\"Laure haude galli\",\"city\":\"pokhara\",\"district\":\"kaski\",\"province\":\"gandaki\",\"storeLocation\":\"pokhara\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-05-30 16:05:28', NULL, NULL, 0.00, NULL),
('9c305c4f-f29f-4480-b348-9300b299e2d3', '62a0eae4-0671-40b8-9398-8faedc09768c', 300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tinkune, Kathmandu\",\"city\":\"Gothatar\",\"district\":\"kathmandu\",\"province\":\"bagmati\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-02 01:34:12', NULL, NULL, 0.00, NULL),
('9ca2081e-260f-4666-8af9-c6437c47b782', '62a0eae4-0671-40b8-9398-8faedc09768c', 390300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"madhumalla\",\"city\":\"urlabari\",\"district\":\"morang\",\"province\":\"koshi\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:51:07', NULL, NULL, 0.00, NULL),
('a6967c2d-630c-45f9-aec2-7def678fbcc1', '62a0eae4-0671-40b8-9398-8faedc09768c', 1050.00, '{\"name\":\"Test User\",\"phone\":\"9814945424\",\"address\":\"Gangabu\",\"city\":\"Kathmandu\",\"postalCode\":\"44600\",\"country\":\"Germany\"}', 'cod', 'delivered', '2025-05-22 12:31:05', '2025-05-28 21:59:42', NULL, 0.00, NULL),
('b5089f3a-c935-48fc-9e6a-166ca987eb37', '62a0eae4-0671-40b8-9398-8faedc09768c', 159000.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tinkune\",\"city\":\"kathmandu\",\"district\":\"kathmandu\",\"province\":\"bagmati\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-08 10:42:38', NULL, NULL, 0.00, NULL),
('bf8fc966-c05a-4fab-90a6-8f4869c4e804', '62a0eae4-0671-40b8-9398-8faedc09768c', 164000.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Schoolchaun\",\"city\":\"Gauradaha\",\"district\":\"jhapa\",\"province\":\"koshi\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'delivered', '2025-06-08 10:29:17', '2025-06-08 10:30:34', 'ASHAR100', 3000.00, NULL),
('c0e7e4be-c88b-4323-9af5-57c3c09bece7', '62a0eae4-0671-40b8-9398-8faedc09768c', 300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tinkune, Kathmandu\",\"city\":\"Suryabinayak\",\"district\":\"bhaktapur\",\"province\":\"bagmati\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'cancelled', '2025-06-02 01:21:06', '2025-06-02 01:22:12', NULL, 0.00, NULL),
('ca120712-7a52-40d5-a22a-eb638ac59261', '9e54329d-ab8c-42d3-ab97-1f9412f0d4ba', 168900.00, '{\"name\":\"Its Sunab\",\"phone\":\"9860280289\",\"address\":\"Tarkhal\",\"city\":\"Suryabinayak\",\"district\":\"bhaktapur\",\"province\":\"bagmati\",\"storeLocation\":\"kathmandu\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-02 02:26:40', NULL, NULL, 0.00, NULL),
('f68ce99e-bc8a-4df7-8481-49a2ba90cae1', '62a0eae4-0671-40b8-9398-8faedc09768c', 140300.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"fewa tal\",\"city\":\"pokhara\",\"district\":\"kaski\",\"province\":\"gandaki\",\"storeLocation\":\"pokhara\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-08 10:57:38', NULL, NULL, 0.00, NULL),
('fe4d7f0e-173a-4aa1-b7be-7663662dd8f7', '62a0eae4-0671-40b8-9398-8faedc09768c', 6800.00, '{\"name\":\"Nyxis QA\",\"phone\":\"9814945424\",\"address\":\"Tinkune, Kathmandu\",\"city\":\"\",\"district\":\"\",\"province\":\"\",\"storeLocation\":\"loc_1749661343848_2cka8mq9u\",\"postalCode\":\"\",\"country\":\"Nepal\"}', 'cod', 'pending', '2025-06-11 23:09:11', NULL, NULL, 0.00, NULL),
('ff2f41f8-d41c-4b20-b841-b3d13064d3e4', '62a0eae4-0671-40b8-9398-8faedc09768c', 2000.00, '{\"name\":\"Test User\",\"phone\":\"9814945424\",\"address\":\"Gangabu\",\"city\":\"\",\"postalCode\":\"\",\"country\":\"United States\"}', 'cod', 'shipped', '2025-05-22 16:04:40', '2025-05-28 22:00:00', NULL, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `sale_id` varchar(255) DEFAULT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `discount_applied` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`, `sale_id`, `original_price`, `discount_applied`) VALUES
('04e1e8f4-23fb-41c9-8c41-82022eedcaef', '3d7eddd5-7b00-4cdc-8b8b-a527217f1d9a', '79c2cf4f-7154-47ad-91b3-6a1334fbbfd3', 1, 390000.00, '2025-06-11 23:15:35', NULL, NULL, 0.00),
('0908452a-d77e-45e0-872b-5792dff69024', '99c59de8-a7bf-4738-8315-7b9320fec7da', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 3, 168700.00, '2025-05-30 16:05:28', NULL, NULL, 0.00),
('0e922a52-e362-41d6-895a-fc6ea05e2d24', 'f68ce99e-bc8a-4df7-8481-49a2ba90cae1', 'df41108e-8642-4cb2-a17e-fae6219ec56e', 1, 140000.00, '2025-06-08 10:57:38', NULL, NULL, 0.00),
('18ef96cb-e494-400a-8bf6-fcc88654317e', '0b58e5e0-185d-43a3-9ce8-520eaca13bd0', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 168700.00, '2025-06-12 00:06:23', NULL, NULL, 0.00),
('19d19279-11e6-4a7d-b58c-1a5fab51da97', '1e6f28d0-557e-49ae-8e0e-48ef59965394', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 3, 168700.00, '2025-05-30 15:59:18', NULL, NULL, 0.00),
('1ca5a094-bda4-4fb2-9613-8477760c596d', 'b5089f3a-c935-48fc-9e6a-166ca987eb37', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 158700.00, '2025-06-08 10:42:38', NULL, NULL, 0.00),
('23e1bf87-d81a-4c98-a9d7-0eff7c3e90f3', '6e1a8b50-9442-4c12-a2bb-1932f0830961', '7cdbca63-77f8-4e25-8eba-0cb7deb9c5aa', 1, 850.00, '2025-05-31 10:36:55', NULL, NULL, 0.00),
('324d4668-2c97-4585-a59b-5c8a4feb4a32', '2829850b-31fe-4e93-bbac-c3157b5789a3', 'e271e16e-7ed7-46f5-889f-283290631663', 1, 450.00, '2025-06-11 23:56:50', NULL, NULL, 0.00),
('44a2a063-5a87-4ec4-b48e-2eefd5591bd0', '96256417-e28d-4255-8ae7-990fe7c248d8', 'df41108e-8642-4cb2-a17e-fae6219ec56e', 1, 140000.00, '2025-06-11 23:22:53', NULL, NULL, 0.00),
('461aa6a8-9262-41c9-8435-799eba5e1bcf', '0e36c4db-2c35-42dc-bbd9-4f5a63592c67', 'df41108e-8642-4cb2-a17e-fae6219ec56e', 1, 140000.00, '2025-06-11 23:43:44', NULL, NULL, 0.00),
('48ce5c2e-ac72-4dc2-885c-77df7156eb39', '15ef807f-779d-4517-ba74-3ecc8893dc01', '79c2cf4f-7154-47ad-91b3-6a1334fbbfd3', 1, 390000.00, '2025-06-06 18:26:50', NULL, NULL, 0.00),
('6d4380e9-4db4-4d2d-b259-046563416377', '2e6442f8-9db6-4920-b4d0-89a0fa0c820a', '79c2cf4f-7154-47ad-91b3-6a1334fbbfd3', 1, 390000.00, '2025-06-08 10:39:38', NULL, NULL, 0.00),
('750455fb-ae8a-45c0-8b00-c93b03d3216c', 'fe4d7f0e-173a-4aa1-b7be-7663662dd8f7', '0d44f0fa-4e52-4610-802e-7547dd6c3a8f', 1, 6500.00, '2025-06-11 23:09:11', NULL, NULL, 0.00),
('78c36fab-0a4f-4e50-a5d2-1e955996109e', '1baa546f-06ca-4e8a-8dc5-886c128eca31', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 168700.00, '2025-06-11 23:33:18', NULL, NULL, 0.00),
('8158f406-c23f-4479-91cb-f041ed6c8d0f', '5d3158ef-d691-4bbe-a2ba-e7d2cb6741a2', '83867671-b141-4096-8dd7-5527b5a944d2', 1, 480.00, '2025-05-29 20:39:37', NULL, NULL, 0.00),
('86cd4656-9d9f-4ad0-869a-d284e27bdd33', 'bf8fc966-c05a-4fab-90a6-8f4869c4e804', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 166700.00, '2025-06-08 10:29:17', NULL, NULL, 0.00),
('8bcc7b45-5f37-4b16-abfb-adc394d7dd47', 'c0e7e4be-c88b-4323-9af5-57c3c09bece7', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 168700.00, '2025-06-02 01:21:06', NULL, NULL, 0.00),
('a6f7b8c0-ba5a-4fec-9de7-a8261a22391d', '46f9acd5-55ca-447d-a838-2181a30f6416', '79c2cf4f-7154-47ad-91b3-6a1334fbbfd3', 1, 390000.00, '2025-06-07 16:30:55', NULL, NULL, 0.00),
('a77c5721-afff-448c-8fe8-0c976501361f', '676f7e29-4a54-49e9-bee9-cdba9886b092', '0d44f0fa-4e52-4610-802e-7547dd6c3a8f', 1, 6500.00, '2025-06-11 23:57:38', NULL, NULL, 0.00),
('aa05ea04-c05e-43c7-bfd9-da6650b786bc', '17b7fcec-811a-4e82-9085-fb082be41750', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 168700.00, '2025-06-06 17:44:32', NULL, NULL, 0.00),
('b08300e7-738c-47e3-a05a-68fbb6ec711a', 'a6967c2d-630c-45f9-aec2-7def678fbcc1', '7cdbca63-77f8-4e25-8eba-0cb7deb9c5aa', 1, 850.00, '2025-05-22 12:31:05', NULL, NULL, 0.00),
('bddfaeee-c7b9-47fb-a3a3-91c2fc59a695', 'ff2f41f8-d41c-4b20-b841-b3d13064d3e4', '7cdbca63-77f8-4e25-8eba-0cb7deb9c5aa', 1, 850.00, '2025-05-22 16:04:40', NULL, NULL, 0.00),
('c33cd6da-3b9f-4fb3-abf8-2b2663cb79db', '9ca2081e-260f-4666-8af9-c6437c47b782', '79c2cf4f-7154-47ad-91b3-6a1334fbbfd3', 1, 390000.00, '2025-06-11 23:51:07', NULL, NULL, 0.00),
('cb953fa8-384e-4cce-a36b-4bc79b2d7aed', 'ca120712-7a52-40d5-a22a-eb638ac59261', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 168700.00, '2025-06-02 02:26:40', NULL, NULL, 0.00),
('cd3b6f2e-d655-4e2f-8009-7d7ba0c08275', '1e6f28d0-557e-49ae-8e0e-48ef59965394', '4f6baae2-7d48-4acf-be5a-b29be9e42787', 1, 500.00, '2025-05-30 15:59:18', NULL, NULL, 0.00),
('ce1bb62d-a3f7-4b68-9e71-7ff4b7744884', '9c305c4f-f29f-4480-b348-9300b299e2d3', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 168700.00, '2025-06-02 01:34:12', NULL, NULL, 0.00),
('e06f2b7c-2104-4c83-b980-3151ba7c7665', '87f099d5-b13f-4b94-8e8c-842648d68201', '4f6baae2-7d48-4acf-be5a-b29be9e42787', 1, 500.00, '2025-05-22 15:56:49', NULL, NULL, 0.00),
('ebe7acbc-3978-448d-adc9-06316096d05d', 'ff2f41f8-d41c-4b20-b841-b3d13064d3e4', 'e271e16e-7ed7-46f5-889f-283290631663', 1, 450.00, '2025-05-22 16:04:40', NULL, NULL, 0.00),
('fe0a1e75-f88c-4392-9909-af70e2336a14', '6e1a8b50-9442-4c12-a2bb-1932f0830961', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', 1, 168700.00, '2025-05-31 10:36:55', NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `actualPrice` decimal(10,2) DEFAULT NULL,
  `discountPrice` decimal(10,2) DEFAULT NULL,
  `finalPrice` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `image` text DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sku` varchar(50) DEFAULT NULL,
  `keyFeatures` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`keyFeatures`)),
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `productDetails` text DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `reviewCount` int(11) DEFAULT 0,
  `availability` varchar(50) DEFAULT 'In Stock',
  `originalPrice` decimal(10,2) DEFAULT NULL,
  `savings` decimal(10,2) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `is_deleted` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `brand`, `category`, `description`, `actualPrice`, `discountPrice`, `finalPrice`, `quantity`, `featured`, `image`, `color`, `created_at`, `updated_at`, `sku`, `keyFeatures`, `specifications`, `productDetails`, `rating`, `reviewCount`, `availability`, `originalPrice`, `savings`, `tags`, `is_deleted`, `deleted_at`, `deleted_reason`) VALUES
('0d44f0fa-4e52-4610-802e-7547dd6c3a8f', 'Apple Watch Series 8 45MM', 'Apple', 'Smart Watches', 'Track temperature changes, monitor blood oxygen levels, and check your heart with the ECG app', 7000.00, 500.00, 6500.00, 98, 1, '[\"uploads/images-1749211917233-23727803.jpeg\",\"uploads/images-1749211917233-460492620.jpeg\"]', 'white', '2025-06-06 12:11:57', '2025-06-06 12:11:57', 'SMA-917277', '[]', '{}', 'Stay aware of irregular heart rhythms and receive alerts for high or low heart rates. Built-in safety features like Fall Detection, Emergency SOS, and Crash Detection provide peace of mind. The redesigned Compass with Backtrack keeps you on course, while the Advanced Workout app helps optimize your fitness goals. Calls, texts, and emails stay within reach.', 0.0, 0, 'In Stock', 8000.00, 1500.00, '[]', 0, NULL, NULL),
('4f6baae2-7d48-4acf-be5a-b29be9e42787', 'Macbook m1', 'Apple', 'Mac Book', 'Mac Book M1', 600.00, 100.00, 500.00, 1495, 0, '[\"/uploads/images-1747860156587.jpg\"]', 'white', '2025-05-21 20:42:36', '2025-05-21 20:44:45', NULL, NULL, NULL, NULL, 0.0, 0, 'In Stock', NULL, NULL, NULL, 0, NULL, NULL),
('62b03d50-7c89-4cc4-bb94-9df10a53f44a', 'iPhone 15 Pro 256GB', 'Apple', 'Iphone', 'The iPhone 15 Pro 256GB, available at Oliz Store in Nepal, combines state-of-the-art technology with a refined aesthetic, making it an exceptional choice for those seeking both performance and style. Its titanium body not only exudes sophistication but also enhances durability, complemented by a customizable Action button for a personalized user experience. The 6.1-inch Super Retina XDR display, equipped with Always-On and ProMotion features, delivers breathtaking visuals, while the innovative Dynamic Island provides a unique way to receive alerts and engage with Live Activities seamlessly. The iPhone 15 Pro\'s Pro camera system, featuring a 48MP Main camera, a 12MP Ultra Wide camera, and a 12MP 3x Telephoto camera, captures every moment with stunning clarity.', 187199.00, 18499.00, 168700.00, 34, 0, '[\"uploads/newImages-1748594069260-308046227.jpg\",\"uploads/newImages-1748594069262-92728316.jpg\",\"uploads/newImages-1748594069262-104199441.jpg\"]', 'mixed', '2025-05-30 08:24:17', '2025-05-30 08:34:29', 'IPH-457977', '[]', '{\"Manufacturer\":\"Apple\",\"Model\":\"iPhone 15 Pro\"}', 'Powering this device is the formidable A17 Pro chip, complete with a 6-core GPU, ensuring outstanding gaming performance and all-day battery life. Safety features like Crash Detection, which can detect severe car accidents and alert emergency services, underscore the device\'s commitment to user security. The iPhone 15 Pro is also equipped with Ceramic Shield and is water and dust resistant, ensuring reliability in various conditions. For professionals, the inclusion of USB-C with USB 3 offers seamless connectivity, while MagSafe wireless charging provides convenient power replenishment. The iPhone 15 Pro 256GB is more than just a smartphone; it’s a sophisticated companion designed to enhance every aspect of modern life.', 0.0, 0, 'In Stock', 187199.00, 18499.00, '[\"iphone\",\"apple\",\"brand\",\"iphone 15 pro max\"]', 0, NULL, NULL),
('79c2cf4f-7154-47ad-91b3-6a1334fbbfd3', 'Apple 13\" iPad Pro M4 2TB Wi-Fi', 'Apple', 'Ipads', '13\" Ultra Retina XDR Display: Enjoy stunning visuals with a resolution of 2752 x 2064 pixels and vibrant color accuracy.', 400000.00, 10000.00, 390000.00, 995, 1, '[\"uploads/images-1749212157721-207881841.jpeg\",\"uploads/images-1749212157721-914540370.jpg\",\"uploads/images-1749212157721-485183315.jpg\"]', 'black', '2025-06-06 12:15:57', '2025-06-06 12:15:57', 'IPA-157732', '[]', '{}', '\r\n\r\nBlazing Fast Performance: Powered by the Apple M4 10-Core CPU, 10-Core GPU, and a 16-Core Neural Engine for effortless multitasking.\r\n\r\nMassive Storage and Memory: With 2TB of storage and 16GB of RAM, store more and run apps seamlessly.\r\n\r\nNext-Level Connectivity: Supports Wi-Fi 6E and Bluetooth 5.3 for faster, more reliable connections.\r\n\r\nPro-Level Cameras: Equipped with 12MP Ultra Wide front and rear cameras for stunning photos and videos.\r\n\r\nThunderbolt Support: Transfer data at up to 40 Gb/s with Thunderbolt connectivity.\r\n', 0.0, 0, 'In Stock', 420000.00, 30000.00, '[]', 0, NULL, NULL),
('7cdbca63-77f8-4e25-8eba-0cb7deb9c5aa', 'Macbook Air M2', 'Apple', 'Laptop', 'New Laptop', 900.00, 50.00, 850.00, 97, 1, '[\"/uploads/images-1747768204778.jpeg\"]', 'white', '2025-05-20 19:10:04', '2025-05-20 19:10:04', NULL, NULL, NULL, NULL, 0.0, 0, 'In Stock', NULL, NULL, NULL, 0, NULL, NULL),
('83867671-b141-4096-8dd7-5527b5a944d2', 'Test User', 'Marshall', 'Speakers', 'Hey can you suggest me the brand name atleast 6-7 characters which represent the nepal life standard, culture, tradition,diversity and architecture with traveling and making videos, documentry, inform', 500.00, 20.00, 480.00, 99, 0, '[\"/uploads/images-1747963678410.jpeg\"]', 'red', '2025-05-22 11:14:46', '2025-05-23 01:27:58', NULL, NULL, NULL, NULL, 0.0, 0, 'In Stock', NULL, NULL, NULL, 0, NULL, NULL),
('df41108e-8642-4cb2-a17e-fae6219ec56e', 'Samsung Galaxy S25 Ultra', 'Samsung', 'Smartphone', 'new samsung galxay mobile in town', 145000.00, 5000.00, 140000.00, 17, 1, '[\"uploads/images-1749359361821-946649857.jpeg\",\"uploads/images-1749359361822-422306153.jpeg\",\"uploads/newImages-1749359460210-795293133.jpeg\"]', 'white', '2025-06-08 05:09:21', '2025-06-08 05:13:23', 'SMA-361835', '[]', '{}', 'new samsung galxay mobile in town with heavy discount', 0.0, 0, 'Out of Stock', 150000.00, 10000.00, '[\"samsung\",\"smartphone\",\"smartphone in nepal\"]', 0, NULL, NULL),
('e271e16e-7ed7-46f5-889f-283290631663', 'Iphone 16', 'Apple', 'iphone', 'Summer sales', 450.00, NULL, 450.00, 494, 1, '[\"/uploads/images-1747771410360.jpeg\"]', 'red', '2025-05-20 18:58:59', '2025-05-20 20:03:30', NULL, NULL, NULL, NULL, 0.0, 0, 'In Stock', NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `promocodes`
--

CREATE TABLE `promocodes` (
  `id` varchar(36) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `min_purchase` decimal(10,2) DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) NOT NULL,
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `max_uses` int(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promocodes`
--

INSERT INTO `promocodes` (`id`, `code`, `description`, `min_purchase`, `max_discount_amount`, `valid_from`, `valid_until`, `max_uses`, `is_active`, `created_at`, `updated_at`) VALUES
('5aff816a-70f1-48d9-bc4b-04cfc4c3630c', 'TEST TEST', 'gdshghjfgzxhjsbk', 10000.00, 500.00, '2025-06-11 00:00:00', '2025-06-17 00:00:00', 0, 1, '2025-06-10 15:47:58', '2025-06-10 15:47:58'),
('7abd85a8-11c8-42cf-bcc3-16964bec9449', 'ASHAR100', 'Ashar', 10000.00, 3000.00, '2025-06-07 00:00:00', '2025-06-14 00:00:00', 0, 1, '2025-06-07 10:32:56', '2025-06-07 10:32:56'),
('b88e4e5c-7b8a-4055-a7e8-b32096509447', 'NEWTON', 'Sir Issac Newton Birthday Special Discount', 1000.00, 500.00, '2025-05-30 00:00:00', '2026-05-01 00:00:00', 10, 1, '2025-05-30 10:16:24', '2025-05-30 10:16:24'),
('bb057212-9e30-46e0-8a40-e9ba8f75ea73', 'DASHAIN', 'Happy Dashain', 1000.00, 500.00, '2025-06-08 00:00:00', '2025-06-14 00:00:00', 0, 1, '2025-06-08 04:53:05', '2025-06-08 04:53:05'),
('e397f13d-36bf-4215-bc2a-63a7ae4e4768', 'ASHAR', 'dahi chiura discount', 10000.00, 1000.00, '2025-06-06 00:00:00', '2025-06-10 00:00:00', 0, 1, '2025-06-06 12:39:21', '2025-06-06 12:39:21');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `reviewer_name` varchar(100) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('draft','scheduled','active','ended') NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `name`, `description`, `discount_type`, `discount_value`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
('4fd901a8-3ee0-465e-bcef-4c82df34608b', 'Ashar 15', 'sale sale sale', 'fixed', 99.91, '2025-06-29 00:00:00', '2025-07-05 00:00:00', 'active', '2025-06-29 14:54:28', '2025-06-29 14:54:28');

-- --------------------------------------------------------

--
-- Table structure for table `sale_gift_products`
--

CREATE TABLE `sale_gift_products` (
  `id` varchar(36) NOT NULL,
  `sale_id` varchar(36) NOT NULL,
  `gift_product_id` varchar(36) NOT NULL,
  `gift_quantity` int(11) DEFAULT 1,
  `min_purchase_amount` decimal(10,2) DEFAULT 0.00,
  `min_quantity` int(11) DEFAULT 1,
  `max_gifts_per_order` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_gift_products`
--

INSERT INTO `sale_gift_products` (`id`, `sale_id`, `gift_product_id`, `gift_quantity`, `min_purchase_amount`, `min_quantity`, `max_gifts_per_order`, `is_active`, `created_at`) VALUES
('62b70d30-5b89-4d6b-9b3a-8200d2fa31ba', '4fd901a8-3ee0-465e-bcef-4c82df34608b', '83867671-b141-4096-8dd7-5527b5a944d2', 1, 0.00, 1, 1, 1, '2025-06-29 09:09:29');

-- --------------------------------------------------------

--
-- Table structure for table `sale_products`
--

CREATE TABLE `sale_products` (
  `sale_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_products`
--

INSERT INTO `sale_products` (`sale_id`, `product_id`, `created_at`) VALUES
('4fd901a8-3ee0-465e-bcef-4c82df34608b', '62b03d50-7c89-4cc4-bb94-9df10a53f44a', '2025-06-29 14:54:29'),
('4fd901a8-3ee0-465e-bcef-4c82df34608b', '79c2cf4f-7154-47ad-91b3-6a1334fbbfd3', '2025-06-29 14:54:29');

-- --------------------------------------------------------

--
-- Table structure for table `sale_product_gifts`
--

CREATE TABLE `sale_product_gifts` (
  `id` varchar(36) NOT NULL,
  `sale_id` varchar(36) NOT NULL,
  `main_product_id` varchar(36) NOT NULL,
  `gift_product_id` varchar(36) NOT NULL,
  `gift_quantity` int(11) DEFAULT 1,
  `min_main_quantity` int(11) DEFAULT 1,
  `max_gifts_per_order` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `splash_screens`
--

CREATE TABLE `splash_screens` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(500) DEFAULT NULL,
  `background_color` varchar(7) DEFAULT NULL,
  `text_color` varchar(7) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_settings`
--

CREATE TABLE `store_settings` (
  `id` varchar(36) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `store_email` varchar(255) NOT NULL,
  `store_phone` varchar(20) NOT NULL,
  `store_address` text NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `footer_logo` varchar(255) DEFAULT NULL,
  `store_description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_media` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_media`)),
  `business_hours` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`business_hours`)),
  `currency` varchar(10) DEFAULT 'NPR',
  `timezone` varchar(50) DEFAULT 'Asia/Kathmandu',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sub_store_locations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON array storing sub-store location data with id, locationName, address, phone, email, isActive, createdAt, updatedAt fields' CHECK (json_valid(`sub_store_locations`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_settings`
--

INSERT INTO `store_settings` (`id`, `store_name`, `store_email`, `store_phone`, `store_address`, `logo`, `footer_logo`, `store_description`, `website`, `social_media`, `business_hours`, `currency`, `timezone`, `created_at`, `updated_at`, `sub_store_locations`) VALUES
('8d5cfbaa-dff4-4d99-8980-ab804f55c974', 'Joy Store', 'contact@joystore.com', '+977-01-4123456', 'Kathmandu, Nepal', 'logo-1748685070582-271994152.png', 'footerLogo-1748685070583-758297300.png', '', NULL, '\"[object Object]\"', '\"[object Object]\"', 'NPR', 'Asia/Kathmandu', '2025-05-31 08:30:01', '2025-06-29 09:10:55', '[{\"id\":\"loc_1749661343848_2cka8mq9u\",\"locationName\":\"Pokhara Branch\",\"address\":\"pokhara\",\"phone\":\"9814945424\",\"email\":\"pokhara@joystore.com\",\"isActive\":true,\"createdAt\":\"2025-06-11T17:02:23.848Z\",\"updatedAt\":\"2025-06-11T17:04:09.942Z\"},{\"id\":\"loc_1751188255987_gnt9vylt0\",\"locationName\":\"Kathmandu\",\"address\":\"kathmandu\",\"phone\":\"9814945424\",\"email\":\"\",\"isActive\":true,\"createdAt\":\"2025-06-29T09:10:55.987Z\",\"updatedAt\":\"2025-06-29T09:10:55.987Z\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `image`, `phone`, `address`, `active`, `created_at`) VALUES
('4c2e2058-7238-444c-a587-7200972cf882', 'New User', 'new@gmail.com', '$2b$10$PL.VIXHtLtFyVGT.yHCxzOCwG1R/7q.Q/4wLUScgxhsPlbbAfJ/bi', 'user', NULL, '9814945424', NULL, 1, '2025-05-20 10:33:22'),
('62a0eae4-0671-40b8-9398-8faedc09768c', 'Nyxis QA', 'test@gmail.com', '$2b$10$4foUbCUobmUI6FvjBxMo4uxpgL8Wa7Mxb2F657E8wng0gyJTsQRnm', 'user', NULL, '9814945424', 'Tinkune, Kathmandu', 1, '2025-05-19 14:27:49'),
('7c09391e-f12e-4a4d-9c91-67bc4a9859f7', 'test test', 'test@test.com', '$2b$10$Zwr3DGcKoCFyFMqaZO7ru.GSgtis9JpIsC5QzWcVOQF/gOI5IOunG', 'user', NULL, '9814945424', NULL, 1, '2025-05-20 13:41:20'),
('9629a361-1ea6-49a0-9685-5146d8042662', 'Newton Timilsina', 'newton@newton.com', '$2b$10$j9rJ6N8JOwJmsHjSRT1GNOsDDtsrEGilvLZuGWUt2fPBJTdcHxeZK', 'user', NULL, '9841454545', NULL, 1, '2025-05-30 15:57:38'),
('9e54329d-ab8c-42d3-ab97-1f9412f0d4ba', 'Its Sunab', 'test1@gmail.com', '$2b$10$kkjTZchWHg0rPSCu5oMTgOFiNYpesvquyHImNqIg.yPBLxERovtsu', 'user', NULL, '9860280289', NULL, 1, '2025-05-22 15:46:17'),
('b277710b-f478-4277-b411-6b1b8c0096b0', 'superadmin', 'admin@superadmin.com', '$2b$10$OgMzqn6lZDNcDcwjtvWy9ejkpn4jSVSNfp5qvtZkxksNzBH7Zvwuq', 'admin', NULL, '9814945424', 'Kathmandu', 1, '2025-05-10 14:39:07'),
('da2daf2b-bd4c-4afd-b3a6-0c4d224db976', 'Sale Manager', 'sales@joystore.com', '$2b$10$drikXH79ZOwaq/Qf4x9xNOWmFUrT0DImYPkXmY/MF2WAeXncp1Z.O', 'sales', NULL, '9814945424', NULL, 1, '2025-06-07 15:00:41');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `product_id` varchar(36) CHARACTER SET armscii8 COLLATE armscii8_general_ci NOT NULL,
  `added_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `active_products`
--
DROP TABLE IF EXISTS `active_products`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_products`  AS SELECT `products`.`id` AS `id`, `products`.`name` AS `name`, `products`.`brand` AS `brand`, `products`.`category` AS `category`, `products`.`description` AS `description`, `products`.`actualPrice` AS `actualPrice`, `products`.`discountPrice` AS `discountPrice`, `products`.`finalPrice` AS `finalPrice`, `products`.`quantity` AS `quantity`, `products`.`featured` AS `featured`, `products`.`image` AS `image`, `products`.`color` AS `color`, `products`.`created_at` AS `created_at`, `products`.`updated_at` AS `updated_at`, `products`.`sku` AS `sku`, `products`.`keyFeatures` AS `keyFeatures`, `products`.`specifications` AS `specifications`, `products`.`productDetails` AS `productDetails`, `products`.`rating` AS `rating`, `products`.`reviewCount` AS `reviewCount`, `products`.`availability` AS `availability`, `products`.`originalPrice` AS `originalPrice`, `products`.`savings` AS `savings`, `products`.`tags` AS `tags`, `products`.`is_deleted` AS `is_deleted`, `products`.`deleted_at` AS `deleted_at`, `products`.`deleted_reason` AS `deleted_reason` FROM `products` WHERE `products`.`is_deleted` = 0 ;

-- --------------------------------------------------------

--
-- Structure for view `deleted_products`
--
DROP TABLE IF EXISTS `deleted_products`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `deleted_products`  AS SELECT `products`.`id` AS `id`, `products`.`name` AS `name`, `products`.`brand` AS `brand`, `products`.`category` AS `category`, `products`.`description` AS `description`, `products`.`actualPrice` AS `actualPrice`, `products`.`discountPrice` AS `discountPrice`, `products`.`finalPrice` AS `finalPrice`, `products`.`quantity` AS `quantity`, `products`.`featured` AS `featured`, `products`.`image` AS `image`, `products`.`color` AS `color`, `products`.`created_at` AS `created_at`, `products`.`updated_at` AS `updated_at`, `products`.`sku` AS `sku`, `products`.`keyFeatures` AS `keyFeatures`, `products`.`specifications` AS `specifications`, `products`.`productDetails` AS `productDetails`, `products`.`rating` AS `rating`, `products`.`reviewCount` AS `reviewCount`, `products`.`availability` AS `availability`, `products`.`originalPrice` AS `originalPrice`, `products`.`savings` AS `savings`, `products`.`tags` AS `tags`, `products`.`is_deleted` AS `is_deleted`, `products`.`deleted_at` AS `deleted_at`, `products`.`deleted_reason` AS `deleted_reason` FROM `products` WHERE `products`.`is_deleted` = 1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_brand_name` (`name`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_category_name` (`name`),
  ADD KEY `idx_category_brand` (`brandId`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders_users_idx` (`user_id`),
  ADD KEY `idx_sale_id` (`sale_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order_items_sale_id` (`sale_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_products_is_deleted` (`is_deleted`),
  ADD KEY `idx_products_deleted_at` (`deleted_at`);

--
-- Indexes for table `promocodes`
--
ALTER TABLE `promocodes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sale_gift_products`
--
ALTER TABLE `sale_gift_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_gifts` (`sale_id`),
  ADD KEY `idx_gift_product` (`gift_product_id`);

--
-- Indexes for table `sale_products`
--
ALTER TABLE `sale_products`
  ADD PRIMARY KEY (`sale_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `sale_product_gifts`
--
ALTER TABLE `sale_product_gifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `main_product_id` (`main_product_id`),
  ADD KEY `idx_sale_product_gifts` (`sale_id`,`main_product_id`),
  ADD KEY `idx_gift_product_specific` (`gift_product_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `splash_screens`
--
ALTER TABLE `splash_screens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_display_order` (`display_order`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_end_date` (`end_date`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `store_settings`
--
ALTER TABLE `store_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_category_brand` FOREIGN KEY (`brandId`) REFERENCES `brands` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sale_gift_products`
--
ALTER TABLE `sale_gift_products`
  ADD CONSTRAINT `sale_gift_products_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_gift_products_ibfk_2` FOREIGN KEY (`gift_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sale_product_gifts`
--
ALTER TABLE `sale_product_gifts`
  ADD CONSTRAINT `sale_product_gifts_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_product_gifts_ibfk_2` FOREIGN KEY (`main_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_product_gifts_ibfk_3` FOREIGN KEY (`gift_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
