-- ============================================================
--  MIGRACIÓN APLICADA: producto_inventario
--  Fecha: 2026-04-17
--  Estado: COMPLETADA
--
--  Problema resuelto:
--  El índice anterior `uq_producto_inventario` incluía
--  `inventario_id` (nullable). MySQL permite múltiples NULL
--  en UNIQUE, por lo que el constraint no protegía nada cuando
--  inventario_id = NULL (caso de todos los registros actuales).
--
--  Solución aplicada:
--  Columna generada VIRTUAL + UNIQUE sobre ella. La columna
--  devuelve la clave compuesta cuando is_active=1 y NULL cuando
--  is_active=0, permitiendo que el historial inactivo coexista
--  sin violar el constraint.
-- ============================================================

-- PASO 1 — Limpiar duplicados activos
--   Ver: migration_dedup_producto_inventario.sql

-- PASO 2 — Columna generada + nuevo UNIQUE index
ALTER TABLE producto_inventario
    ADD COLUMN uq_llave_activo VARCHAR(300)
        GENERATED ALWAYS AS (
            IF(is_active = 1,
               CONCAT_WS('||', codigo_barras, sucursal_id, lote, fecha_caducidad),
               NULL)
        ) VIRTUAL,
    ADD UNIQUE INDEX uq_pi_barras_sucursal_lote_cad (uq_llave_activo);

-- PASO 3 — Índice regular sobre codigo_barras para soporte de FK
--   Necesario antes de soltar uq_producto_inventario, porque
--   MySQL usa ese índice para la FK codigo_barras → producto.
ALTER TABLE producto_inventario
    ADD INDEX idx_codigo_barras (codigo_barras);

-- PASO 4 — Eliminar índice anterior
ALTER TABLE producto_inventario
    DROP INDEX uq_producto_inventario;

-- Resultado esperado en SHOW INDEX:
--   PRIMARY                        → producto_inventario_id
--   uq_pi_barras_sucursal_lote_cad → uq_llave_activo (UNIQUE)
--   inventario_id                  → inventario_id
--   producto_inventario_ibfk_3_idx → sucursal_id
--   idx_codigo_barras              → codigo_barras
