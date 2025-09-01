CREATE DATABASE  IF NOT EXISTS `maya` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `maya`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: maya
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `categoria_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `descuento` int DEFAULT NULL,
  `dia_descuento` enum('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO','NINGUNO','FINES DE SEMANA','LUNES Y MARTES') DEFAULT 'NINGUNO',
  `impuesto` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (5,'Genericos','Genericos',0,'NINGUNO',0.00),(6,'Con receta','Solidos',15,'NINGUNO',0.00),(7,'Bebidas','Bebidas en gral',10,'NINGUNO',0.00),(8,'Salud Sexual','Salud sexual',10,'VIERNES',0.00),(9,'Bebidas','BEBIDAS GRAL',0,'NINGUNO',0.00),(10,'Electrolit Polvo','Electrolit polvo',12,'LUNES',0.00),(11,'Curaciones','Curaciones',0,'NINGUNO',0.00),(12,'Dulces','Dulces GRAL',0,'NINGUNO',8.00),(13,'Electrolit liquido','Electrolit liquido',5,'FINES DE SEMANA',0.00),(14,'Cronico degenerativo','Cronico degenerativo',12,'LUNES Y MARTES',0.00),(15,'Vitaminas','Vitaminas gral',0,'NINGUNO',0.00),(16,'Salud Femenina','Salud femenina',0,'NINGUNO',0.00),(17,'Toallas y pañales','Toallas y pañales',0,'NINGUNO',0.00),(18,'Drogueria','Drogueria',0,'NINGUNO',0.00),(19,'Higiene personal','Higiene personal',0,'NINGUNO',0.00),(20,'Patente','Patente',0,'NINGUNO',0.00),(21,'Hospitalario','Hospitalario',0,'NINGUNO',0.00),(22,'Suero inyectable','Suero inyectable',0,'NINGUNO',0.00),(23,'Electronicos','Electronicos',0,'NINGUNO',0.00),(24,'Belleza','Belleza',0,'NINGUNO',0.00);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `detalle_venta_id` int NOT NULL AUTO_INCREMENT,
  `venta_id` varchar(20) DEFAULT NULL,
  `codigo_barras` varchar(50) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `sucursal_id` varchar(10) DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  `producto_inventario_id` int DEFAULT NULL,
  PRIMARY KEY (`detalle_venta_id`),
  KEY `venta_id` (`venta_id`),
  KEY `codigo_barras` (`codigo_barras`),
  KEY `detalle_venta_ibfk_3_idx` (`usuario_id`),
  KEY `detalle_venta_ibfk_4_idx` (`sucursal_id`),
  KEY `detalle_venta_ibfk_5_idx` (`producto_inventario_id`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`venta_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`codigo_barras`) REFERENCES `producto` (`codigo_barras`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_venta_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_venta_ibfk_4` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`sucursal_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_venta_ibfk_5` FOREIGN KEY (`producto_inventario_id`) REFERENCES `producto_inventario` (`producto_inventario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1164 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (1136,'VMY1-1755194252652','1125',8,'MY1',7,50.00,50.00,0.00,NULL),(1137,'VMY1-1755194266995','1125',8,'MY1',3,50.00,50.00,0.00,NULL),(1138,'VMY1-1755194765631','1125',8,'MY1',5,50.00,50.00,0.00,NULL),(1139,'VMY1-1755194833563','1125',8,'MY1',5,50.00,50.00,0.00,NULL),(1140,'VMY1-1755195605743','1125',8,'MY1',5,50.00,50.00,0.00,NULL),(1141,'VMY1-1755195613330','1125',8,'MY1',5,50.00,50.00,0.00,NULL),(1143,'VMY1-1755196755271','1125',8,'MY1',10,50.00,50.00,0.00,NULL),(1144,'VMY1-1755196798454','1125',8,'MY1',10,50.00,50.00,0.00,NULL),(1145,'VMY1-1755199143873','1125',8,'MY1',20,50.00,50.00,0.00,NULL),(1146,'VMY1-1755199643027','1125',8,'MY1',10,50.00,50.00,0.00,NULL),(1147,'VMY1-1755200785436','1125',8,'MY1',10,50.00,50.00,0.00,NULL),(1148,'VMY1-1755201517269','1124',9,'MY1',10,8.00,80.00,8.00,NULL),(1149,'VMY1-1755206332257','1123',9,'MY1',1,12.00,12.00,1.20,NULL),(1150,'VMY1-1755206332257','75981023',9,'MY1',1,65.00,65.00,9.75,NULL),(1151,'VMY1-1755206353484','1123',9,'MY1',11,12.00,132.00,13.20,NULL),(1152,'VMY1-1755206836498','000001',9,'MY1',5,10.00,50.00,5.00,NULL),(1153,'VMY1-1755207056737','000001',9,'MY1',1,10.00,10.00,1.00,NULL),(1154,'VMY1-1755207118784','000001',9,'MY1',1,10.00,10.00,1.00,NULL),(1155,'VMY1-1755207254031','000001',9,'MY1',1,10.00,10.00,1.00,NULL),(1156,'VMY1-1755207555179','000001',9,'MY1',1,10.00,10.00,1.00,NULL),(1157,'VMY2-1755218474052','252500',18,'MY2',5,28.00,140.00,14.00,NULL),(1158,'VMY2-1755218530042','252500',18,'MY2',10,28.00,280.00,28.00,NULL),(1159,'VMY2-1755218913126','1122',18,'MY2',1,9.00,9.00,0.90,NULL),(1160,'VMY3-1755220387046','1122',24,'MY3',1,9.00,9.00,0.90,NULL),(1161,'VMY3-1755226122279','1111',8,'MY3',10,50.00,50.00,0.00,20),(1162,'VMY3-1756693868682','1122',8,'MY3',10,50.00,50.00,0.00,NULL),(1163,'VMY3-1756693970962','1122',8,'MY3',10,50.00,50.00,0.00,20);
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctores_cedula`
--

DROP TABLE IF EXISTS `doctores_cedula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctores_cedula` (
  `cedula_id` int NOT NULL AUTO_INCREMENT,
  `cedula` varchar(100) DEFAULT NULL,
  `doctor` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`cedula_id`),
  UNIQUE KEY `cedula_id_UNIQUE` (`cedula_id`),
  UNIQUE KEY `cedula_UNIQUE` (`cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctores_cedula`
--

LOCK TABLES `doctores_cedula` WRITE;
/*!40000 ALTER TABLE `doctores_cedula` DISABLE KEYS */;
INSERT INTO `doctores_cedula` VALUES (1,'32427','Lucia');
/*!40000 ALTER TABLE `doctores_cedula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `inventario_id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` varchar(10) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventario_id`),
  KEY `sucursal_id` (`sucursal_id`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`sucursal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (5,'MY1','2025-03-26 23:09:04'),(6,'MY2','2025-03-26 23:10:53'),(7,'MY3','2025-03-27 17:13:36'),(8,'MY0','2025-05-15 13:24:43'),(11,'MY4','2025-07-10 15:54:11');
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `movimiento_id` int NOT NULL AUTO_INCREMENT,
  `producto_inventario_id` int DEFAULT NULL,
  `tipo_movimiento_id` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `fecha_movimiento` datetime DEFAULT CURRENT_TIMESTAMP,
  `referencia` varchar(255) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`movimiento_id`),
  KEY `producto_inventario_id` (`producto_inventario_id`),
  KEY `tipo_movimiento_id` (`tipo_movimiento_id`),
  CONSTRAINT `fk_movinv_producto` FOREIGN KEY (`producto_inventario_id`) REFERENCES `producto_inventario` (`producto_inventario_id`) ON UPDATE CASCADE,
  CONSTRAINT `movimiento_inventario_ibfk_2` FOREIGN KEY (`tipo_movimiento_id`) REFERENCES `tipo_movimiento` (`tipo_movimiento_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1320 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
INSERT INTO `movimiento_inventario` VALUES (1265,21,4,10,'2025-08-14 11:56:59','Lote: LOTE-2023-006','Múltiples productos ingresados'),(1268,76,4,10,'2025-08-14 12:05:20','Lote: LT005','Múltiples productos ingresados'),(1271,76,4,10,'2025-08-14 12:19:35','Lote: LT005','Múltiples productos ingresados'),(1274,76,4,10,'2025-08-14 12:39:11','Lote: LT005 | Código: 1125 | Lote: LT005','Múltiples productos ingresados'),(1277,76,4,10,'2025-08-14 12:39:36','Lote: LT005 | Código: 1125 | Lote: LT005','Múltiples productos ingresados'),(1280,76,4,10,'2025-08-14 12:45:52','Lote: LT005 | Código: 1125 | Lote: LT005','Abastecimiento del inventario'),(1281,52,5,10,'2025-08-14 12:47:17','Abastecimiento al inventario | Código: 1122 | Lote: LT0','Reabastecimiento a inventario MY1'),(1282,61,4,10,'2025-08-14 12:47:17','Abastecimiento al inventario | Código: 1122 | Lote: LT0','Transferencia desde inventario MY0'),(1284,76,4,10,'2025-08-14 13:18:39','Lote: LT005 | Código: 1125 | Lote: LT005','Abastecimiento del inventario'),(1288,89,4,10,'2025-08-14 13:46:16','Lote: LOTE-2023-006 | Código: N/A | Lote: N/A','Nuevo lote ingresado'),(1289,89,5,10,'2025-08-14 13:46:25','LOTE-2023-006','Venta de productos'),(1290,70,5,10,'2025-08-14 13:58:37','LT0','Venta de productos'),(1291,35,5,1,'2025-08-14 15:18:52','LOTE-2023-007','Venta de productos'),(1292,83,5,1,'2025-08-14 15:18:52','LH08','Venta de productos'),(1293,35,5,11,'2025-08-14 15:19:13','LOTE-2023-007','Venta de productos'),(1294,56,5,5,'2025-08-14 15:27:16','12345','Venta de productos'),(1295,90,4,2,'2025-08-14 15:30:23','Lote: 21 | Código: N/A | Lote: N/A','Nuevo lote ingresado'),(1296,90,5,1,'2025-08-14 15:30:56','21','Venta de productos'),(1297,56,5,1,'2025-08-14 15:31:58','12345','Venta de productos'),(1298,91,4,1,'2025-08-14 15:33:53','Lote: 11111 | Código: N/A | Lote: N/A','Nuevo lote ingresado'),(1299,91,5,1,'2025-08-14 15:34:14','11111','Venta de productos'),(1300,56,5,1,'2025-08-14 15:39:15','12345','Venta de productos'),(1301,92,4,35,'2025-08-14 18:36:26','Lote: LK09 | Código: N/A | Lote: N/A','Nuevo lote ingresado'),(1302,92,5,15,'2025-08-14 18:37:11','Abastecimiento al inventario | Código: 252500 | Lote: LK09','Reabastecimiento a inventario MY2'),(1303,93,4,15,'2025-08-14 18:37:11','Lote: LK09 | Código: N/A | Lote: N/A','Nuevo lote ingresado'),(1304,93,4,15,'2025-08-14 18:37:11','Abastecimiento al inventario | Código: N/A | Lote: N/A','Transferencia desde inventario MY0'),(1305,93,5,5,'2025-08-14 18:41:14','LK09','Venta de productos'),(1306,93,5,10,'2025-08-14 18:42:10','LK09','Venta de productos'),(1307,62,5,1,'2025-08-14 18:48:33','LT0','Venta de productos'),(1308,94,4,5,'2025-08-14 18:52:04','Lote: LW87 | Código: N/A | Lote: N/A','Nuevo lote ingresado'),(1309,54,5,10,'2025-08-14 19:05:39','Abastecimiento al inventario | Código: 1122 | Lote: LT1','Reabastecimiento a inventario MY3'),(1310,58,4,10,'2025-08-14 19:05:39','Abastecimiento al inventario | Código: 1122 | Lote: LT1','Transferencia desde inventario MY0'),(1311,58,5,1,'2025-08-14 19:13:07','LT1','Venta de productos'),(1312,53,5,5,'2025-08-14 19:16:15','Abastecimiento al inventario | Código: 1111 | Lote: LT0','Reabastecimiento a inventario MY2'),(1313,82,4,5,'2025-08-14 19:16:15','Abastecimiento al inventario | Código: 1111 | Lote: LT0','Transferencia desde inventario MY0'),(1314,81,5,10,'2025-08-14 20:47:23','Abastecimiento al inventario | Código: 1111 | Lote: LT04','Reabastecimiento a inventario MY3'),(1315,95,4,10,'2025-08-14 20:47:23','Lote: LT04 | Código: N/A | Lote: N/A','Nuevo lote ingresado'),(1316,95,4,10,'2025-08-14 20:47:23','Abastecimiento al inventario | Código: N/A | Lote: N/A','Transferencia desde inventario MY0'),(1317,95,5,10,'2025-08-14 20:48:42','LT04','Venta de productos'),(1318,58,5,10,'2025-08-31 20:31:08','LT1','Venta de productos'),(1319,58,5,10,'2025-08-31 20:32:50','LT1','Venta de productos');
/*!40000 ALTER TABLE `movimiento_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `codigo_barras` varchar(50) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `gramaje` varchar(50) DEFAULT NULL,
  `precio_minimo` decimal(10,2) DEFAULT NULL,
  `precio_maximo` decimal(10,2) DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `proveedor_id` int DEFAULT NULL,
  `presentacion` varchar(50) DEFAULT NULL,
  `sustancia_activa` varchar(100) DEFAULT NULL,
  `precio_max_anterior` decimal(10,2) DEFAULT NULL,
  `fecha_updt_precio` date DEFAULT NULL,
  PRIMARY KEY (`codigo_barras`),
  KEY `categoria_id` (`categoria_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`proveedor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES ('000001','N/A','Agua Great Value','500ml',3.50,10.00,7,5,'Agua embotellada','H2O',6.00,'2025-06-26'),('0004','N/A','Alcanfor','5mg',2.00,6.00,6,6,'Sobre con 2 pastillas','',6.00,'2025-07-27'),('1001','N/A','Omega 3','200mg',25.20,45.00,5,8,'Bote de plastico','',NULL,NULL),('1111','Paracetamoil','tabletas','500',3.00,9.00,5,5,'Tabletas','tabletas',NULL,NULL),('1112','Diclofenaco','tabetas','400',2.00,8.00,5,5,'Tabletas','Tabletas',NULL,NULL),('1113','Amoxicilina','Tabletas','500',1.00,2.00,5,5,'Tabletas','tabletas',NULL,NULL),('1122','Diazepam','tabetas','300',4.00,9.00,5,5,'tabetas','tabetas',NULL,NULL),('1123','Electrolit','Bebida','600',8.00,12.00,5,5,'Bebida','Bebida',NULL,NULL),('1124','Agua ciel','Bebida','500',4.00,8.00,5,5,'Bebida','Bebida',NULL,NULL),('1125','Proteina','Proteina','800',12.00,34.00,7,5,'Proteina','Proteina',NULL,NULL),('252500','Jugo del valle','jugo','500',16.50,28.00,7,8,'Bebida','H2O',NULL,NULL),('75981023','N/A','Ac. Clavulaníco/Amoxicilina','100mg/5mg',38.20,65.00,6,8,'Tabletas','Ac. Clavulaníco/Amoxicilina',NULL,NULL),('780016','N/A','Ibuprofeno','2',21.98,60.00,5,8,'Suspension','Ibuprofeno',NULL,NULL);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_inventario`
--

DROP TABLE IF EXISTS `producto_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_inventario` (
  `producto_inventario_id` int NOT NULL AUTO_INCREMENT,
  `codigo_barras` varchar(50) DEFAULT NULL,
  `sucursal_id` varchar(10) DEFAULT NULL,
  `inventario_id` int DEFAULT NULL,
  `existencias` int DEFAULT '0',
  `fecha_ultima_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `lote` varchar(45) DEFAULT NULL,
  `fecha_caducidad` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`producto_inventario_id`),
  UNIQUE KEY `uq_producto_inventario` (`codigo_barras`,`inventario_id`,`lote`),
  KEY `inventario_id` (`inventario_id`),
  KEY `producto_inventario_ibfk_3_idx` (`sucursal_id`),
  CONSTRAINT `producto_inventario_ibfk_1` FOREIGN KEY (`codigo_barras`) REFERENCES `producto` (`codigo_barras`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `producto_inventario_ibfk_2` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`inventario_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `producto_inventario_ibfk_3` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`sucursal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_inventario`
--

LOCK TABLES `producto_inventario` WRITE;
/*!40000 ALTER TABLE `producto_inventario` DISABLE KEYS */;
INSERT INTO `producto_inventario` VALUES (20,'1111','MY1',5,3970,'2025-07-15 21:42:43','LOTE-2023-006','2025-12-30 18:00:00',1),(21,'1112','MY1',5,2953,'2025-08-14 11:56:59','LOTE-2023-006','2025-12-30 18:00:00',1),(22,'1111','MY2',6,18,'2025-08-05 16:45:43','LOTE-2023-006','2024-12-31 00:00:00',1),(23,'1112','MY2',6,18,'2025-08-06 16:27:04','LOTE-2023-007','2024-12-31 00:00:00',1),(24,'1111','MY2',6,18,'2025-08-05 16:28:39','LOTE-2023-007','2024-12-31 00:00:00',1),(25,'1111','MY1',5,20,'2025-07-14 19:00:13','LOTE-2023-007','2026-12-30 18:00:00',1),(35,'1123','MY1',5,0,'2025-08-14 15:19:13','LOTE-2023-007','2026-12-30 18:00:00',0),(44,'1124','MY1',NULL,22,'2025-08-06 21:15:49','LT89','2025-07-08 00:00:00',1),(46,'1123','MY1',NULL,40,'2025-07-11 15:47:36','LT50','2025-12-12 00:00:00',1),(47,'1123','MY1',NULL,49,'2025-07-27 14:32:24','LT88','2025-12-18 00:00:00',1),(52,'1122','MY0',NULL,0,'2025-05-17 13:27:10','LT0','2025-05-16 18:00:00',0),(53,'1111','MY0',NULL,5,'2025-05-20 14:00:38','LT0','2031-03-11 18:00:00',1),(54,'1122','MY0',NULL,30,'2025-05-17 13:27:10','LT1','2222-12-11 18:00:00',1),(55,'1124','MY0',NULL,10,'2025-05-20 14:00:38','LT0','3200-12-19 18:00:00',1),(56,'000001','MY1',NULL,2,'2025-08-14 15:39:15','12345','2026-12-29 18:00:00',1),(57,'252500','MY1',NULL,9,'2025-06-03 16:05:36','LT45','2025-08-24 18:00:00',1),(58,'1122','MY3',NULL,14,'2025-08-31 20:32:50','LT1','2222-12-11 18:00:00',1),(59,'1111','MY3',NULL,163,'2025-08-06 16:21:31','LT0','2031-03-11 18:00:00',1),(61,'1122','MY1',NULL,60,'2025-07-27 14:32:25','LT0','2025-09-16 18:00:00',1),(62,'1122','MY2',NULL,0,'2025-08-14 18:48:33','LT0','2025-08-09 18:00:00',0),(63,'1111','MY1',NULL,25,'2025-07-10 16:19:45','LT0','2031-03-11 18:00:00',1),(64,'1122','MY1',NULL,17,'2025-08-06 21:15:12','LT1','2222-12-11 18:00:00',1),(65,'780016','MY0',NULL,15,'2025-07-10 16:04:17','1234','2027-03-29 18:00:00',1),(66,'780016','MY4',NULL,6,'2025-07-10 16:04:43','LT02','2027-03-29 18:00:00',1),(67,'780016','MY1',NULL,10,'2025-07-13 13:06:33','1234','2027-03-29 18:00:00',1),(68,'780016','MY2',NULL,10,'2025-07-13 13:06:33','1234','2027-03-29 18:00:00',1),(69,'780016','MY3',NULL,15,'2025-07-13 13:06:33','1234','2027-03-29 18:00:00',1),(70,'1124','MY1',NULL,0,'2025-08-14 13:58:37','LT0','3200-12-19 18:00:00',0),(71,'1124','MY2',NULL,13,'2025-08-05 16:45:43','LT0','3200-12-19 18:00:00',1),(72,'1124','MY3',NULL,15,'2025-07-15 10:54:56','LT0','3200-12-19 18:00:00',1),(73,'1111','MY4',NULL,16,'2025-07-27 11:27:42','LT0','2031-03-11 18:00:00',1),(74,'1125','MY0',NULL,8,'2025-07-27 14:17:23','LT005','2025-02-11 18:00:00',1),(75,'1125','MY4',NULL,25,'2025-07-27 14:23:47','LT005','2025-02-11 18:00:00',1),(76,'1125','MY1',NULL,65,'2025-08-14 13:18:39','LT005','2025-02-11 18:00:00',1),(77,'1125','MY3',NULL,7,'2025-08-03 17:28:32','LT005','2025-02-11 18:00:00',1),(78,'1125','MY2',NULL,5,'2025-08-03 17:41:24','LT005','2025-02-11 18:00:00',1),(79,'1122','MY4',NULL,10,'2025-08-03 17:44:02','LT1','2222-12-11 18:00:00',1),(80,'1124','MY4',NULL,5,'2025-08-05 16:12:36','LT0','3200-12-19 18:00:00',1),(81,'1111','MY0',NULL,40,'2025-08-05 16:18:19','LT04','2025-09-14 18:00:00',1),(82,'1111','MY2',NULL,10,'2025-08-06 15:29:58','LT0','2031-03-11 18:00:00',1),(83,'75981023','MY1',NULL,48,'2025-08-14 15:18:52','LH08','2025-12-09 18:00:00',1),(84,'1122','MY4',NULL,12,'2025-08-06 20:37:28','LT11','2025-12-11 18:00:00',1),(89,'1125','MY1',NULL,0,'2025-08-14 13:46:25','LOTE-2023-006','2024-12-30 18:00:00',0),(90,'000001','MY1',NULL,1,'2025-08-14 15:30:56','21','2025-08-14 18:00:00',1),(91,'000001','MY1',NULL,0,'2025-08-14 15:34:14','11111','2025-08-12 18:00:00',0),(92,'252500','MY0',NULL,20,'2025-08-14 18:36:26','LK09','2026-01-14 18:00:00',1),(93,'252500','MY2',NULL,0,'2025-08-14 18:42:10','LK09','2026-01-14 18:00:00',0),(94,'252500','MY2',NULL,5,'2025-08-14 18:52:04','LW87','2026-03-13 18:00:00',1),(95,'1111','MY3',NULL,0,'2025-08-14 20:48:42','LT04','2025-09-14 18:00:00',1);
/*!40000 ALTER TABLE `producto_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `proveedor_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`proveedor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (5,'Nadro','234','nadro@gmail.com','Nadro'),(6,'Fanasa','9512','fanasa@gmail.com','Fanasa'),(7,'Marzam','2432','marzam@gmail.com','Marzam'),(8,'Levic','9512444','levic@gmail.com','Levic');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursal` (
  `sucursal_id` varchar(10) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `contraseña_sucursal` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`sucursal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursal`
--

LOCK TABLES `sucursal` WRITE;
/*!40000 ALTER TABLE `sucursal` DISABLE KEYS */;
INSERT INTO `sucursal` VALUES ('MY0','Almacen Central','San Jacinto Amilpas','2025-05-15 13:24:43',''),('MY1','Maya 01','San Jacinto','2025-03-26 23:09:04','maya01'),('MY2','Maya 02','Forestal','2025-03-26 23:10:53','maya02'),('MY3','Maya 03','Niños héroes','2025-03-27 17:13:36','maya03'),('MY4','Maya 4','Col. Oaxaca Atzompa','2025-07-10 15:54:11',NULL);
/*!40000 ALTER TABLE `sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_movimiento`
--

DROP TABLE IF EXISTS `tipo_movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_movimiento` (
  `tipo_movimiento_id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) DEFAULT NULL,
  `factor` enum('Entrada','Salida','Venta','Anulación de venta','Actualizacion manual del inventario') NOT NULL,
  PRIMARY KEY (`tipo_movimiento_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_movimiento`
--

LOCK TABLES `tipo_movimiento` WRITE;
/*!40000 ALTER TABLE `tipo_movimiento` DISABLE KEYS */;
INSERT INTO `tipo_movimiento` VALUES (4,'Entrada','Entrada'),(5,'Salida','Salida'),(6,'Anulación de venta','Anulación de venta'),(7,'Actualizacion manual del inventario','Actualizacion manual del inventario');
/*!40000 ALTER TABLE `tipo_movimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `usuario_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `rol` enum('administrador','trabajador') NOT NULL,
  `turno` varchar(50) DEFAULT NULL,
  `fecha_ingreso` datetime DEFAULT CURRENT_TIMESTAMP,
  `usuario` varchar(45) DEFAULT NULL,
  `clave_acceso` varchar(5) NOT NULL,
  `sucursal_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`usuario_id`),
  KEY `fk_sucursal_usuario_idx` (`sucursal_id`),
  CONSTRAINT `fk_sucursal_usuario` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`sucursal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (8,'María','Vásquez','951','mari@gmail.com','trabajador','Vespertino','2025-03-27 17:14:15','Carmen','123','MY1'),(9,'Lenin','Bravo','220','lenin@gmail.com','trabajador','Matutino','2025-03-27 23:02:47','Lenin','lenin','MY1'),(11,'Lenin','Bravo','220','lenin2222222@gmail.com','administrador','matutino','2025-04-12 15:00:44','Lenin2','123',NULL),(12,'Maris','Maris','341','maris@gmail.com','administrador','Vespertino','2025-05-01 08:06:21','Maris','123','MY2'),(18,'Renata','lopez','9514782036','ren@gmail.com','trabajador','Matutino','2025-08-03 21:24:10','renata','ren45','MY2'),(19,'Osvaldo','Vidal','95115','osvaldo@gmail.com','administrador','Matutino','2025-08-04 13:11:09','Admin','123',NULL),(22,'Carmen','Garcia','9514785201','carmen@gmail.com','administrador','','2025-08-04 18:38:54','carmen','car12',NULL),(23,'Osmar','Bravo','9547810614','osmar@gmail.com','administrador','','2025-08-04 18:42:48','osmar','osmar',NULL),(24,'Ignacio','Tirado','6173','nacho@gmail.com','trabajador','Vespertino','2025-08-14 19:08:12','nacho','123','MY3');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `venta_id` varchar(20) NOT NULL,
  `sucursal_id` varchar(10) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha_venta` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  `total_recibido` decimal(10,2) DEFAULT NULL,
  `numero_factura` varchar(50) DEFAULT NULL,
  `anulada` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`venta_id`),
  UNIQUE KEY `numero_factura` (`numero_factura`),
  KEY `sucursal_id` (`sucursal_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`sucursal_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES ('VMY1-1755194252652','MY1',8,'2025-08-14 11:57:32',125.50,150.00,'FAC-MY1-1755194252652-8',0),('VMY1-1755194266995','MY1',8,'2025-08-14 11:57:46',125.50,150.00,'FAC-MY1-1755194266995-8',0),('VMY1-1755194765631','MY1',8,'2025-08-14 12:06:05',125.50,150.00,'FAC-MY1-1755194765631-8',0),('VMY1-1755194833563','MY1',8,'2025-08-14 12:07:13',125.50,150.00,'FAC-MY1-1755194833563-8',0),('VMY1-1755195605743','MY1',8,'2025-08-14 12:20:05',125.50,150.00,'FAC-MY1-1755195605743-8',0),('VMY1-1755195613330','MY1',8,'2025-08-14 12:20:13',125.50,150.00,'FAC-MY1-1755195613330-8',0),('VMY1-1755196755271','MY1',8,'2025-08-14 12:39:15',125.50,150.00,'FAC-MY1-1755196755271-8',0),('VMY1-1755196798454','MY1',8,'2025-08-14 12:39:58',125.50,150.00,'FAC-MY1-1755196798454-8',0),('VMY1-1755199143873','MY1',8,'2025-08-14 13:19:03',125.50,150.00,'FAC-MY1-1755199143873-8',0),('VMY1-1755199643027','MY1',8,'2025-08-14 13:27:23',125.50,150.00,'FAC-MY1-1755199643027-8',0),('VMY1-1755200785436','MY1',8,'2025-08-14 13:46:25',125.50,150.00,'FAC-MY1-1755200785436-8',0),('VMY1-1755201517269','MY1',9,'2025-08-14 13:58:37',72.00,100.00,'FAC-MY1-1755201517269-9',0),('VMY1-1755206332257','MY1',9,'2025-08-14 15:18:52',66.05,100.00,'FAC-MY1-1755206332257-9',0),('VMY1-1755206353484','MY1',9,'2025-08-14 15:19:13',118.80,150.00,'FAC-MY1-1755206353484-9',0),('VMY1-1755206836498','MY1',9,'2025-08-14 15:27:16',45.00,50.00,'FAC-MY1-1755206836498-9',0),('VMY1-1755207056737','MY1',9,'2025-08-14 15:30:56',9.00,10.00,'FAC-MY1-1755207056737-9',0),('VMY1-1755207118784','MY1',9,'2025-08-14 15:31:58',9.00,12.00,'FAC-MY1-1755207118784-9',0),('VMY1-1755207254031','MY1',9,'2025-08-14 15:34:14',9.00,22.00,'FAC-MY1-1755207254031-9',0),('VMY1-1755207555179','MY1',9,'2025-08-14 15:39:15',9.00,11.00,'FAC-MY1-1755207555180-9',0),('VMY2-1755218474052','MY2',18,'2025-08-14 18:41:14',126.00,150.00,'FAC-MY2-1755218474052-18',0),('VMY2-1755218530042','MY2',18,'2025-08-14 18:42:10',252.00,300.00,'FAC-MY2-1755218530042-18',0),('VMY2-1755218913126','MY2',18,'2025-08-14 18:48:33',8.10,10.00,'FAC-MY2-1755218913126-18',0),('VMY3-1755220387046','MY3',24,'2025-08-14 19:13:07',8.10,10.00,'FAC-MY3-1755220387046-24',0),('VMY3-1755226122279','MY3',8,'2025-08-14 20:48:42',125.50,150.00,'FAC-MY3-1755226122279-8',0),('VMY3-1756693868682','MY3',8,'2025-08-31 20:31:08',100.15,150.00,'FAC-MY3-1756693868682-8',0),('VMY3-1756693970962','MY3',8,'2025-08-31 20:32:50',100.15,150.00,'FAC-MY3-1756693970962-8',0);
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-31 20:38:19
