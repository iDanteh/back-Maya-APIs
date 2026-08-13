-- ============================================================
--  MIGRACIÓN: transferencia_id en movimiento_inventario
--  Fecha: 2026-08-11
--  Estado: PENDIENTE DE APLICAR
--
--  Objetivo:
--  Permitir correlacionar las filas de Salida/Entrada que
--  pertenecen a la misma transferencia entre sucursales.
--  Sesión 1 del plan de trazabilidad (Opción A).
--
--  Diseño:
--  Columna nullable, SIN constraint de FK hacia `transferencia`.
--  Se trata como un correlation id de log de eventos, no como
--  una relación estricta: así esta migración no depende de que
--  la tabla `transferencia` ya exista, y no queda atada al orden
--  de despliegue del modelo Sequelize.
--
--  IMPORTANTE — orden de aplicación (evita romper producción):
--  Correr este script ANTES de desplegar el código con el
--  modelo Movimiento_Inventario actualizado. Sequelize construye
--  el SELECT listando explícitamente todas las columnas definidas
--  en el modelo; si el modelo se despliega antes de que la columna
--  exista en la BD, cualquier lectura de movimiento_inventario
--  (getEntradasBySucursal, getSalidasBySucursal, getMovimientos, etc.)
--  rompe con "Unknown column 'transferencia_id'".
--
--  La tabla `transferencia` nueva NO se crea acá: la crea
--  sequelize.sync({ force: false }) solo al reiniciar el server,
--  porque solo crea tablas que no existen (ver src/index.js:52-55).
-- ============================================================

ALTER TABLE movimiento_inventario
    ADD COLUMN transferencia_id CHAR(36) NULL,
    ADD INDEX idx_movimiento_transferencia_id (transferencia_id);

-- Verificación esperada:
--   SHOW COLUMNS FROM movimiento_inventario LIKE 'transferencia_id';
--   SHOW INDEX FROM movimiento_inventario WHERE Key_name = 'idx_movimiento_transferencia_id';
