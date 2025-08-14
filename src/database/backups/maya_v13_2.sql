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
  `dia_descuento` enum('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO') DEFAULT NULL,
  PRIMARY KEY (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (5,'Sin receta','Solidos',10,NULL),(6,'Con receta','Solidos',15,NULL),(7,'Bebidas','Bebidas en gral',10,NULL);
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
  PRIMARY KEY (`detalle_venta_id`),
  KEY `venta_id` (`venta_id`),
  KEY `codigo_barras` (`codigo_barras`),
  KEY `detalle_venta_ibfk_3_idx` (`usuario_id`),
  KEY `detalle_venta_ibfk_4_idx` (`sucursal_id`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`venta_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`codigo_barras`) REFERENCES `producto` (`codigo_barras`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_venta_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_venta_ibfk_4` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`sucursal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
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
  CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`producto_inventario_id`) REFERENCES `producto_inventario` (`producto_inventario_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `movimiento_inventario_ibfk_2` FOREIGN KEY (`tipo_movimiento_id`) REFERENCES `tipo_movimiento` (`tipo_movimiento_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1265 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
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
  PRIMARY KEY (`producto_inventario_id`),
  UNIQUE KEY `uq_producto_inventario` (`codigo_barras`,`inventario_id`,`lote`),
  KEY `inventario_id` (`inventario_id`),
  KEY `producto_inventario_ibfk_3_idx` (`sucursal_id`),
  CONSTRAINT `producto_inventario_ibfk_1` FOREIGN KEY (`codigo_barras`) REFERENCES `producto` (`codigo_barras`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `producto_inventario_ibfk_2` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`inventario_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `producto_inventario_ibfk_3` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`sucursal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_inventario`
--

LOCK TABLES `producto_inventario` WRITE;
/*!40000 ALTER TABLE `producto_inventario` DISABLE KEYS */;
INSERT INTO `producto_inventario` VALUES (20,'1111','MY1',5,3970,'2025-07-15 21:42:43','LOTE-2023-006','2025-12-30 18:00:00'),(21,'1112','MY1',5,2943,'2025-08-14 11:11:49','LOTE-2023-006','2025-12-30 18:00:00'),(22,'1111','MY2',6,18,'2025-08-05 16:45:43','LOTE-2023-006','2024-12-31 00:00:00'),(23,'1112','MY2',6,18,'2025-08-06 16:27:04','LOTE-2023-007','2024-12-31 00:00:00'),(24,'1111','MY2',6,18,'2025-08-05 16:28:39','LOTE-2023-007','2024-12-31 00:00:00'),(25,'1111','MY1',5,20,'2025-07-14 19:00:13','LOTE-2023-007','2026-12-30 18:00:00'),(35,'1123','MY1',5,12,'2025-07-14 19:00:13','LOTE-2023-007','2026-12-30 18:00:00'),(44,'1124','MY1',NULL,22,'2025-08-06 21:15:49','LT89','2025-07-08 00:00:00'),(46,'1123','MY1',NULL,40,'2025-07-11 15:47:36','LT50','2025-12-12 00:00:00'),(47,'1123','MY1',NULL,49,'2025-07-27 14:32:24','LT88','2025-12-18 00:00:00'),(52,'1122','MY0',NULL,10,'2025-05-17 13:27:10','LT0','2025-05-16 18:00:00'),(53,'1111','MY0',NULL,10,'2025-05-20 14:00:38','LT0','2031-03-11 18:00:00'),(54,'1122','MY0',NULL,40,'2025-05-17 13:27:10','LT1','2222-12-11 18:00:00'),(55,'1124','MY0',NULL,10,'2025-05-20 14:00:38','LT0','3200-12-19 18:00:00'),(56,'000001','MY1',NULL,9,'2025-07-10 16:44:23','12345','2026-12-29 18:00:00'),(57,'252500','MY1',NULL,9,'2025-06-03 16:05:36','LT45','2025-08-24 18:00:00'),(58,'1122','MY3',NULL,25,'2025-06-21 22:22:02','LT1','2222-12-11 18:00:00'),(59,'1111','MY3',NULL,163,'2025-08-06 16:21:31','LT0','2031-03-11 18:00:00'),(61,'1122','MY1',NULL,50,'2025-07-27 14:32:25','LT0','2025-09-16 18:00:00'),(62,'1122','MY2',NULL,1,'2025-08-05 16:33:40','LT0','2025-08-09 18:00:00'),(63,'1111','MY1',NULL,25,'2025-07-10 16:19:45','LT0','2031-03-11 18:00:00'),(64,'1122','MY1',NULL,17,'2025-08-06 21:15:12','LT1','2222-12-11 18:00:00'),(65,'780016','MY0',NULL,15,'2025-07-10 16:04:17','1234','2027-03-29 18:00:00'),(66,'780016','MY4',NULL,6,'2025-07-10 16:04:43','LT02','2027-03-29 18:00:00'),(67,'780016','MY1',NULL,10,'2025-07-13 13:06:33','1234','2027-03-29 18:00:00'),(68,'780016','MY2',NULL,10,'2025-07-13 13:06:33','1234','2027-03-29 18:00:00'),(69,'780016','MY3',NULL,15,'2025-07-13 13:06:33','1234','2027-03-29 18:00:00'),(70,'1124','MY1',NULL,10,'2025-07-15 10:54:56','LT0','3200-12-19 18:00:00'),(71,'1124','MY2',NULL,13,'2025-08-05 16:45:43','LT0','3200-12-19 18:00:00'),(72,'1124','MY3',NULL,15,'2025-07-15 10:54:56','LT0','3200-12-19 18:00:00'),(73,'1111','MY4',NULL,16,'2025-07-27 11:27:42','LT0','2031-03-11 18:00:00'),(74,'1125','MY0',NULL,8,'2025-07-27 14:17:23','LT005','2025-02-11 18:00:00'),(75,'1125','MY4',NULL,25,'2025-07-27 14:23:47','LT005','2025-02-11 18:00:00'),(76,'1125','MY1',NULL,5,'2025-07-27 14:49:34','LT005','2025-02-11 18:00:00'),(77,'1125','MY3',NULL,7,'2025-08-03 17:28:32','LT005','2025-02-11 18:00:00'),(78,'1125','MY2',NULL,5,'2025-08-03 17:41:24','LT005','2025-02-11 18:00:00'),(79,'1122','MY4',NULL,10,'2025-08-03 17:44:02','LT1','2222-12-11 18:00:00'),(80,'1124','MY4',NULL,5,'2025-08-05 16:12:36','LT0','3200-12-19 18:00:00'),(81,'1111','MY0',NULL,50,'2025-08-05 16:18:19','LT04','2025-09-14 18:00:00'),(82,'1111','MY2',NULL,5,'2025-08-06 15:29:58','LT0','2031-03-11 18:00:00'),(83,'75981023','MY1',NULL,49,'2025-08-06 23:07:39','LH08','2025-12-09 18:00:00'),(84,'1122','MY4',NULL,12,'2025-08-06 20:37:28','LT11','2025-12-11 18:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (8,'María','Vásquez','951','mari@gmail.com','trabajador','Vespertino','2025-03-27 17:14:15','Carmen','123','MY1'),(9,'Lenin','Bravo','220','lenin@gmail.com','trabajador','Matutino','2025-03-27 23:02:47','Lenin','lenin','MY1'),(11,'Lenin','Bravo','220','lenin2222222@gmail.com','administrador','matutino','2025-04-12 15:00:44','Lenin2','123',NULL),(12,'Maris','Maris','341','maris@gmail.com','administrador','Vespertino','2025-05-01 08:06:21','Maris','123','MY2'),(18,'Renata','lopez','9514782036','ren@gmail.com','trabajador','Matutino','2025-08-03 21:24:10','renata','ren45','MY2'),(19,'Osvaldo','Vidal','95115','osvaldo@gmail.com','administrador','Matutino','2025-08-04 13:11:09','Admin','123',NULL),(22,'Carmen','Garcia','9514785201','carmen@gmail.com','administrador','','2025-08-04 18:38:54','carmen','car12',NULL),(23,'Osmar','Bravo','9547810614','osmar@gmail.com','administrador','','2025-08-04 18:42:48','osmar','osmar',NULL);
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

-- Dump completed on 2025-08-14 11:36:44
