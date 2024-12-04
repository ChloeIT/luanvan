-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hotelnln
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `payment` bit(1) NOT NULL,
  `total_price` float NOT NULL,
  `check_in` datetime(6) DEFAULT NULL,
  `check_out` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkgseyy7t56x7lkjgu3wah5s3t` (`user_id`),
  CONSTRAINT `FKkgseyy7t56x7lkjgu3wah5s3t` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
INSERT INTO `booking` VALUES (_binary '',610,'2024-10-10 15:00:00.000000','2024-10-12 13:00:00.000000',56,4),(_binary '\0',520,'2024-09-30 15:30:00.000000','2024-10-01 10:00:00.000000',63,4),(_binary '',490,'2024-10-30 07:00:00.000000','2024-10-31 10:00:00.000000',66,4),(_binary '',4449,'2024-10-30 07:00:00.000000','2024-10-30 08:00:00.000000',76,NULL),(_binary '\0',22,'2024-09-30 15:30:00.000000','2024-09-30 17:30:00.000000',77,NULL),(_binary '',90,'2024-11-11 07:00:00.000000','2024-11-12 07:00:00.000000',78,NULL),(_binary '',999,'2024-11-11 07:00:00.000000','2024-11-12 07:00:00.000000',79,4),(_binary '',1680,'2024-11-15 07:00:00.000000','2024-11-27 07:00:00.000000',80,4),(_binary '',180,'2024-11-15 07:00:00.000000','2024-11-16 07:00:00.000000',81,4),(_binary '',130,'2024-11-15 07:00:00.000000','2024-11-16 07:00:00.000000',82,4),(_binary '',555,'2024-10-10 15:00:00.000000','2024-11-10 15:00:00.000000',85,4);
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_room`
--

DROP TABLE IF EXISTS `booking_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_room` (
  `booking_id` bigint NOT NULL,
  `room_id` bigint NOT NULL,
  PRIMARY KEY (`booking_id`,`room_id`),
  KEY `FK4e002f18klgu08ekxnav2rwr9` (`room_id`),
  CONSTRAINT `FK4e002f18klgu08ekxnav2rwr9` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`),
  CONSTRAINT `FK9umnt0pjb1nf83qwoqry1cuc2` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_room`
--

LOCK TABLES `booking_room` WRITE;
/*!40000 ALTER TABLE `booking_room` DISABLE KEYS */;
INSERT INTO `booking_room` VALUES (82,64);
/*!40000 ALTER TABLE `booking_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8f4j36u3ealttx057oeppnphm` (`user_id`),
  CONSTRAINT `FKh3f2dg11ibnht4fvnmx60jcif` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
INSERT INTO `favorite` VALUES (1,4);
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite_room`
--

DROP TABLE IF EXISTS `favorite_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite_room` (
  `favorite_id` bigint NOT NULL,
  `room_id` bigint NOT NULL,
  PRIMARY KEY (`favorite_id`,`room_id`),
  KEY `FK5jtydy257ke7p0p566590nw88` (`room_id`),
  CONSTRAINT `FK5jtydy257ke7p0p566590nw88` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`),
  CONSTRAINT `FKtgpgd4u6885ywvjoomrp8pnj4` FOREIGN KEY (`favorite_id`) REFERENCES `favorite` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite_room`
--

LOCK TABLES `favorite_room` WRITE;
/*!40000 ALTER TABLE `favorite_room` DISABLE KEYS */;
INSERT INTO `favorite_room` VALUES (1,7),(1,63),(1,64),(1,66),(1,69),(1,71),(1,72),(1,77),(1,91),(1,93);
/*!40000 ALTER TABLE `favorite_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel`
--

DROP TABLE IF EXISTS `hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel` (
  `rating` float NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `amenities` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel`
--

LOCK TABLES `hotel` WRITE;
/*!40000 ALTER TABLE `hotel` DISABLE KEYS */;
INSERT INTO `hotel` VALUES (4.2,2,'456 Park Ave','Free WiFi, Gym, Spa','hotel10.jpg','Ocean View Resort','1234567891'),(4.8,3,'789 Broadway','Free WiFi, Parking, Restaurant','hotel11.jpg','Mountain Escape Lodge','1234567892'),(3.9,4,'321 Elm St','Gym, Spa, Pool','hotel12.jpg','City Center Inn','1234567893'),(4.7,5,'654 Maple St','Free WiFi, Parking, Gym','hotel13.jpg','The Royal Sands','1234567894'),(4,6,'987 Oak St','Free WiFi, Gym, Pool','hotel14.jpg','Sunset Paradise Hotel','1234567895'),(3.8,7,'555 Pine St','Free WiFi, Parking','hotel15.jpg','Green Valley Retreat','1234567896'),(4.6,8,'222 Cedar St','Free WiFi, Spa, Gym','hotel16.jpg','Golden Gate Suites','1234567897'),(4.3,9,'111 Birch St','Free WiFi, Pool, Gym','hotel17.jpg','Blue Lagoon Resort','1234567898'),(4.1,10,'888 Spruce St','Free WiFi, Parking, Spa','hotel18.jpg','Riverside Inn','1234567899'),(4.5,11,'777 Redwood St','Free WiFi, Gym, Pool','hotel19.jpg','Emerald Bay Hotel','1234567800'),(4,12,'999 Walnut St','Parking, Gym, Spa','hotel20.jpg','Skyline Luxury Suites','1234567801'),(4.2,13,'444 Cherry St','Free WiFi, Gym, Pool','hotel21.jpg','Whispering Pines Lodge','1234567802'),(3.7,14,'666 Ash St','Gym, Spa, Parking','hotel22.jpg','Desert Oasis Hotel','1234567803'),(4.9,15,'333 Sycamore St','Free WiFi, Pool, Parking','hotel23.jpg','Seaside Escape Resort','1234567804'),(4.3,16,'555 Poplar St','Gym, Pool, Free WiFi','hotel24.jpg','The Maple Leaf Inn','1234567805'),(4.1,17,'444 Alder St','Parking, Gym, Pool','hotel25.jpg','Crystal Waters Hotel','1234567806'),(3.9,18,'222 Linden St','Spa, Gym, Free WiFi','hotel26.jpg','Urban Nest Suites','1234567807'),(4.5,19,'777 Palm St','Parking, Pool, Gym','hotel27.jpg','Pine Hill Lodge','1234567808'),(4.7,20,'111 Willow St','Free WiFi, Spa, Gym','hotel28.jpg','Coral Reef Resort','1234567809'),(2,34,'abc','abc','1714827166_saigoncanthohotel.jpg','hihi','0987654321'),(5,35,'CTU','full A','hotel13.jpg','CT501H','0987654321');
/*!40000 ALTER TABLE `hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `rating` float NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `review_date` datetime(6) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKm685o801uf70i84jf94qq3d0b` (`booking_id`),
  CONSTRAINT `FKk4xawqohtguy5yx5nnpba6yf3` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` enum('ROLE_ADMIN','ROLE_MODERATOR','ROLE_USER') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'ROLE_ADMIN'),(2,'ROLE_MODERATOR'),(3,'ROLE_USER');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `availability` bit(1) DEFAULT NULL,
  `capacity` int NOT NULL,
  `create_at` date DEFAULT NULL,
  `price` float NOT NULL,
  `update_at` date DEFAULT NULL,
  `hotel_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `favorite_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdosq3ww4h9m2osim6o0lugng8` (`hotel_id`),
  CONSTRAINT `FKdosq3ww4h9m2osim6o0lugng8` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (_binary '',3,'2024-09-10',170,'2024-09-10',4,7,'room1.jpg','Deluxe Room 4','Deluxe',NULL),(_binary '',2,'2024-09-10',90,'2024-09-10',4,8,'room2.jpg','Standard Room 4','Standard',NULL),(_binary '',2,'2024-09-10',160,'2024-09-10',5,9,'room3.jpg','Deluxe Room 5','Deluxe',NULL),(_binary '',2,'2024-09-10',80,'2024-09-10',5,10,'room4.jpg','Standard Room 5','Standard',NULL),(_binary '',2,'2024-11-06',90,'2024-11-06',2,61,'room6.jpg','Double Room','Standard',NULL),(_binary '',1,'2024-11-06',50,'2024-11-06',2,62,'room7.jpg','Single Room','Standard',NULL),(_binary '\0',3,'2024-11-06',120,'2024-11-06',3,63,'room8.jpg','Triple Room','Deluxe',NULL),(_binary '\0',2,'2024-11-06',130,'2024-11-06',3,64,'room9.jpg','Business Suite','Suite',NULL),(_binary '',2,'2024-11-06',200,'2024-11-06',4,65,'room10.jpg','Executive Suite','Suite',NULL),(_binary '\0',4,'2024-11-06',180,'2024-11-06',4,66,'room11.jpg','Family Deluxe','Deluxe',NULL),(_binary '',2,'2024-11-06',110,'2024-11-06',5,67,'room12.jpg','Superior Queen','Superior',NULL),(_binary '',2,'2024-11-06',220,'2024-11-06',5,68,'room13.jpg','Luxury King','Luxury',NULL),(_binary '\0',2,'2024-11-06',60,'2024-11-06',6,69,'room14.jpg','Budget Twin','Budget',NULL),(_binary '',1,'2024-11-06',40,'2024-11-06',6,70,'room15.jpg','Economy Single','Economy',NULL),(_binary '',2,'2024-11-06',75,'2024-11-06',7,71,'room16.jpg','Standard Twin','Standard',NULL),(_binary '',2,'2024-11-06',140,'2024-11-06',7,72,'room17.jpg','Premium King','Premium',NULL),(_binary '\0',3,'2024-11-06',115,'2024-11-06',8,73,'room18.jpg','Family Standard','Standard',NULL),(_binary '',1,'2024-11-06',45,'2024-11-06',8,74,'room19.jpg','Compact Single','Compact',NULL),(_binary '',2,'2024-11-06',100,'2024-11-06',9,75,'room20.jpg','Superior Twin','Superior',NULL),(_binary '',2,'2024-11-06',210,'2024-11-06',9,76,'room21.jpg','Luxury Queen','Luxury',NULL),(_binary '',2,'2024-11-06',250,'2024-11-06',10,77,'room22.jpg','VIP Suite','VIP',NULL),(_binary '',2,'2024-11-07',90,'2024-11-07',11,78,'room23.jpg','Double Room','Standard',NULL),(_binary '',1,'2024-11-07',50,'2024-11-07',12,91,'room1.jpg','Single Room','Standard',NULL),(_binary '\0',3,'2024-11-07',120,'2024-11-07',13,92,'room2.jpg','Triple Room','Deluxe',NULL),(_binary '',2,'2024-11-07',130,'2024-11-07',14,93,'room3.jpg','Business Suite','Suite',NULL),(_binary '',2,'2024-11-07',200,'2024-11-07',15,94,'room4.jpg','Executive Suite','Suite',NULL),(_binary '\0',4,'2024-11-07',180,'2024-11-07',16,95,'room5.jpg','Family Deluxe','Deluxe',NULL),(_binary '',2,'2024-11-07',110,'2024-11-07',17,96,'room6.jpg','Superior Queen','Superior',NULL),(_binary '',2,'2024-11-07',220,'2024-11-07',18,97,'room7.jpg','Luxury King','Luxury',NULL),(_binary '\0',2,'2024-11-07',60,'2024-11-07',19,98,'room8.jpg','Budget Twin','Budget',NULL),(_binary '',1,'2024-11-07',40,'2024-11-07',20,99,'room9.jpg','Economy Single','Economy',NULL),(_binary '\0',2,'2024-11-10',333,'2024-11-10',NULL,108,'room10.jpg','room999','dup',NULL),(_binary '\0',2,'2024-11-10',111,'2024-11-10',NULL,109,'room11.jpg','hihi','abc',NULL),(_binary '\0',2,'2024-11-11',222,'2024-11-11',NULL,110,'room12.jpg','Nang Ngoai San','Duplex',NULL),(_binary '\0',2,'2024-11-16',500,'2024-11-16',NULL,111,'','CICT','VIP',NULL);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `phone` int DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `password` varchar(120) NOT NULL,
  `username` varchar(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (943332824,4,'chloeit@gmail.com',NULL,NULL,'$2a$10$hIgDaJ96x6hNvVfwrjBmouCfQPZ.0C5HTr1SjUSnh3hGN7RzXexzy','chloeit','can tho','2024-10-10','male'),(922445654,5,'admin1@gmail.com','dasda','cus2_khanhlinh_truong.jpg','$2a$10$/IQMDf5gEq0p650vTvy4Kuy2jw0pIavZqZmazj0EaUAPEMB6ghTqq','admin1','can tho',NULL,'male'),(987654321,8,'pamela@gmail.com','HD pamela','review8.jpg','$2a$10$L4QdYbBQNWF/NH2l8sXiMuT44W6bRyThgLOv1s8/m0NTD9n3fQVhe','pamela','pam',NULL,'male'),(828239292,9,'linhlinh@gmail.com',NULL,NULL,'$2a$10$S72yqlRaI7tbm/KSJN1y9eDQeMS5oWaxjTHku7jUweN1wOF6XAAiq','linhlinh',NULL,NULL,NULL),(987654321,11,'ct501h@gmail.com','CT501H','1714826389_cus8_laelia_kaylin.jpg','$2a$10$9C9FiNJ9hB7KmOk2/QK6rOUkCpB3Gom.8SPGerZZC72RgtSizc7jm','CT501H','Can Tho',NULL,'male');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKrhfovtciq1l558cw6udg0h0d3` (`role_id`),
  CONSTRAINT `FK55itppkw3i07do3h7qoclqd4k` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKrhfovtciq1l558cw6udg0h0d3` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (4,1),(5,1),(9,1),(11,1),(4,2),(8,3);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-17 22:43:52
