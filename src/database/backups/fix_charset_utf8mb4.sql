-- ============================================================
-- Fix charset FK incompatible - usa MODIFY COLUMN (no CONVERT)
-- para evitar el error 1062 en el PRIMARY KEY de producto.
-- Ejecutar TODO el bloque de una sola vez en MySQL Workbench.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Solo cambia la columna codigo_barras, NO toca el resto de la tabla
ALTER TABLE producto MODIFY COLUMN codigo_barras VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;

ALTER TABLE detalle_venta MODIFY COLUMN codigo_barras VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;

ALTER TABLE producto_inventario MODIFY COLUMN codigo_barras VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;

-- ----------------------------------------------------------------
-- Tabla promocion: crearla si no existe, o ajustar columna si existe
-- ----------------------------------------------------------------
DROP PROCEDURE IF EXISTS _fix_promocion;
DELIMITER //
CREATE PROCEDURE _fix_promocion()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promocion'
    ) THEN
        CREATE TABLE `promocion` (
            `promocion_id`       INT          NOT NULL AUTO_INCREMENT,
            `codigo_barras`      VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
            `nombre`             VARCHAR(255) NOT NULL,
            `tipo`               ENUM('precio_multiple') NOT NULL DEFAULT 'precio_multiple',
            `cantidad_minima`    INT          NOT NULL,
            `precio_promocional` DECIMAL(10,2) NOT NULL,
            `dias_disponible`    JSON          DEFAULT NULL,
            `fecha_inicio`       DATE          DEFAULT NULL,
            `fecha_fin`          DATE          DEFAULT NULL,
            `activo`             TINYINT(1)   NOT NULL DEFAULT 1,
            PRIMARY KEY (`promocion_id`),
            KEY `idx_promo_codigo_barras` (`codigo_barras`),
            CONSTRAINT `promocion_ibfk_1`
                FOREIGN KEY (`codigo_barras`) REFERENCES `producto` (`codigo_barras`)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
        SELECT 'Tabla promocion CREADA' AS resultado;
    ELSE
        ALTER TABLE promocion
            MODIFY COLUMN codigo_barras VARCHAR(150)
            CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;
        SELECT 'Tabla promocion MODIFICADA (ya existía)' AS resultado;
    END IF;
END //
DELIMITER ;

CALL _fix_promocion();
DROP PROCEDURE IF EXISTS _fix_promocion;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificar resultado final
SELECT TABLE_NAME, TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('producto','producto_inventario','detalle_venta','promocion')
ORDER BY TABLE_NAME;
