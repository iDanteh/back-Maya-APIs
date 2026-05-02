-- ============================================================
--  LIMPIEZA DE DUPLICADOS EN producto_inventario
--  Conserva el registro con mayor existencias por grupo.
--  En empate de existencias, conserva el de mayor
--  producto_inventario_id (el más reciente).
--
--  Orden de ejecución:
--    1. PASO 1 — previsualiza qué se desactivará (solo SELECT)
--    2. PASO 2 — aplica la desactivación (UPDATE)
--    3. PASO 3 — verifica que no queden duplicados activos
-- ============================================================

USE maya;

-- ------------------------------------------------------------
-- PASO 1 (PREVISUALIZACIÓN — no modifica nada)
-- Muestra los registros que quedarán inactivos.
-- La lógica: para cada fila, busca si existe otra fila con
-- la misma clave (barras+sucursal+lote+fecha) que tenga
-- más existencias, o igual existencias pero mayor ID.
-- Si existe esa "mejor" fila, esta se desactiva.
-- ------------------------------------------------------------
SELECT
    pi.producto_inventario_id,
    pi.codigo_barras,
    pi.sucursal_id,
    pi.lote,
    DATE(pi.fecha_caducidad) AS fecha_caducidad,
    pi.existencias,
    pi.is_active
FROM producto_inventario pi
WHERE EXISTS (
    SELECT 1
    FROM producto_inventario mejor
    WHERE mejor.codigo_barras              = pi.codigo_barras
      AND mejor.sucursal_id               = pi.sucursal_id
      AND mejor.lote                      = pi.lote
      AND DATE(mejor.fecha_caducidad)     = DATE(pi.fecha_caducidad)
      AND mejor.producto_inventario_id   != pi.producto_inventario_id
      AND (
            mejor.existencias > pi.existencias
            OR (
                mejor.existencias              = pi.existencias
                AND mejor.producto_inventario_id > pi.producto_inventario_id
            )
      )
)
ORDER BY pi.codigo_barras, pi.sucursal_id, pi.lote, pi.existencias DESC;


-- ------------------------------------------------------------
-- PASO 2 (DESACTIVACIÓN — ejecutar solo tras revisar PASO 1)
-- Marca is_active = 0 en los duplicados a eliminar.
-- No borra ningún registro.
--
-- Nota: MySQL no permite referenciar la misma tabla en un
-- UPDATE con subquery directo, por eso se envuelve en una
-- tabla derivada (SELECT * FROM ...) AS t.
-- ------------------------------------------------------------
UPDATE producto_inventario pi
SET pi.is_active = 0
WHERE EXISTS (
    SELECT 1
    FROM (SELECT * FROM producto_inventario) mejor
    WHERE mejor.codigo_barras              = pi.codigo_barras
      AND mejor.sucursal_id               = pi.sucursal_id
      AND mejor.lote                      = pi.lote
      AND DATE(mejor.fecha_caducidad)     = DATE(pi.fecha_caducidad)
      AND mejor.producto_inventario_id   != pi.producto_inventario_id
      AND (
            mejor.existencias > pi.existencias
            OR (
                mejor.existencias              = pi.existencias
                AND mejor.producto_inventario_id > pi.producto_inventario_id
            )
      )
);


-- ------------------------------------------------------------
-- PASO 3 (VERIFICACIÓN — debe devolver 0 filas)
-- Confirma que ya no hay grupos con más de un registro activo.
-- ------------------------------------------------------------
SELECT
    codigo_barras,
    sucursal_id,
    lote,
    DATE(fecha_caducidad) AS fecha_caducidad,
    COUNT(*)              AS activos_en_grupo
FROM producto_inventario
WHERE is_active = 1
GROUP BY codigo_barras, sucursal_id, lote, DATE(fecha_caducidad)
HAVING COUNT(*) > 1;
