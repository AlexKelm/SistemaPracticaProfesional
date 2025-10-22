-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: proyecto
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `razon_social` varchar(200) NOT NULL,
  `cuit` varchar(20) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nombre_contacto` varchar(100) DEFAULT NULL,
  `apellido_contacto` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_cliente_cuit` (`cuit`),
  KEY `idx_cliente_razon_social` (`razon_social`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Empresa ABC S.A.','20-12345678-9','011-1234-5678','contacto@empresaabc.com','Juan','Pérez','2025-10-14 14:52:02',1),(2,'Comercial XYZ Ltda.','30-87654321-0','011-8765-4321','ventas@comercialxyz.com','María','González','2025-10-14 14:52:02',1),(3,'Servicios Técnicos SRL','27-11223344-5','011-1122-3344','info@serviciostecnicos.com','Carlos','Rodríguez','2025-10-14 14:52:02',1),(4,'empresa falsa 123','91248173423','423423423','empresa@gmail.com','Jose ','Perez','2025-10-21 10:51:38',1);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden_servicio`
--

DROP TABLE IF EXISTS `orden_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden_servicio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `prioridad` varchar(20) DEFAULT 'media',
  `fecha_creacion` date NOT NULL,
  `fecha_servicio` date DEFAULT NULL,
  `fecha_completado` timestamp NULL DEFAULT NULL,
  `tecnico_asignado` varchar(100) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_orden_cliente` (`cliente_id`),
  KEY `idx_orden_estado` (`estado`),
  KEY `idx_orden_fecha_servicio` (`fecha_servicio`),
  CONSTRAINT `orden_servicio_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_servicio`
--

LOCK TABLES `orden_servicio` WRITE;
/*!40000 ALTER TABLE `orden_servicio` DISABLE KEYS */;
INSERT INTO `orden_servicio` VALUES (13,1,'test','','Finalizada','Baja','2025-10-21','2025-10-29',NULL,NULL,0.00),(15,1,'test 417823407141234',NULL,'En Proceso','Baja','2025-10-21','2025-10-23',NULL,NULL,0.00),(16,2,'paso algo',NULL,'Pendiente','Alta','2025-10-21','2025-10-30',NULL,NULL,0.00),(17,1,'','a','Pendiente','Alta','2025-10-21','2025-10-21',NULL,NULL,0.00),(18,1,'algomas',NULL,'Pendiente','Alta','2025-10-21','2025-11-14',NULL,NULL,0.00),(19,4,'Arreglar algo',NULL,'En Proceso','Alta','2025-10-31','2025-10-28',NULL,NULL,0.00);
/*!40000 ALTER TABLE `orden_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tecnico`
--

DROP TABLE IF EXISTS `tecnico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tecnico` (
  `id_tecnico` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tecnico`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `idx_tecnico_usuario` (`usuario`),
  KEY `idx_tecnico_email` (`email`),
  KEY `idx_tecnico_activo` (`activo`),
  KEY `idx_tecnico_especialidad` (`especialidad`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tecnico`
--

LOCK TABLES `tecnico` WRITE;
/*!40000 ALTER TABLE `tecnico` DISABLE KEYS */;
INSERT INTO `tecnico` VALUES (1,'Carlitos','López','carlos.lopez','$2b$10$hash...','carlos.lopez@empresa.com','Electricidad','3764-123456','',0,'2025-10-21 04:07:33','2025-10-21 04:34:41'),(2,'María','González','maria.gonzalez','$2b$10$hash...','maria.gonzalez@empresa.com','Electrónica','3764-234567',NULL,1,'2025-10-21 04:07:33','2025-10-21 04:07:33'),(3,'Roberto','Martínez','roberto.martinez','$2b$10$hash...','roberto.martinez@empresa.com','Informática','3764-345678',NULL,1,'2025-10-21 04:07:33','2025-10-21 04:07:33'),(4,'Ana','Silva','ana.silva','$2b$10$hash...','ana.silva@empresa.com','Redes','3764-456789',NULL,1,'2025-10-21 04:07:33','2025-10-21 04:07:33'),(5,'alberto','Fernandez','alberfdez','1234','albferdz@gmail.com','hacer cosas','2312321341232','av falsa 123',1,'2025-10-21 04:33:30','2025-10-21 04:33:30');
/*!40000 ALTER TABLE `tecnico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `rol` enum('admin','tecnico','usuario') DEFAULT 'usuario',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `idx_usuario_username` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Juan','Pérez','admin','$2b$10$n/cLTtomIjOWFfN3aTm6Ke369gB/dYwdLxpthCRlnICUQpGVeLzWi','admin@localhost','admin',1,'2025-10-14 14:52:21');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-21 21:45:26
