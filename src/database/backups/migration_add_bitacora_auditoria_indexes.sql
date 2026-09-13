-- ============================================================
--  MIGRACIÓN: índice compuesto en bitacora_auditoria
--  Fecha: 2026-09-09
--  Estado: PENDIENTE DE APLICAR
--
--  Objetivo:
--  bitacora_auditoria ya existe en producción sin ningún índice
--  propio de auditoría (solo la PK). BitacoraAuditoria.Repository.js
--  (findAll) siempre filtra por entidad/accion/resultado/fecha y
--  ordena por fecha DESC — sin índice, esa consulta va a degradar
--  a medida que la tabla crece.
--
--  Diseño:
--  Índice compuesto (entidad, fecha): entidad es el filtro principal
--  de las vistas de historial (HistorialAuditoria.jsx / HistorialBitacora.jsx),
--  y fecha cubre tanto el rango fecha_inicio/fecha_fin como el ORDER BY.
--
--  IMPORTANTE — orden de aplicación:
--  Igual que migration_add_transferencia_id_movimiento.sql, correr este
--  script contra la base real. sequelize.sync({force:false}) (arranque
--  normal, ver src/index.js) NO crea índices en tablas que ya existen,
--  solo agrega la definición al modelo para instalaciones nuevas —
--  así que sin este script el índice nunca se crea en producción.
--  No rompe nada si se corre tarde (a diferencia de transferencia_id,
--  acá no hay columna nueva ni SELECT que pueda fallar), solo hace que
--  las consultas de historial sigan lentas hasta que se aplique.
-- ============================================================

ALTER TABLE bitacora_auditoria
    ADD INDEX idx_bitacora_entidad_fecha (entidad, fecha);

-- Verificación esperada:
--   SHOW INDEX FROM bitacora_auditoria WHERE Key_name = 'idx_bitacora_entidad_fecha';
