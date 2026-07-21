import { Sequelize } from 'sequelize';

export const normalizeInventoryText = (value) => String(value ?? '').trim();

export const normalizeInventoryDate = (dateInput) => {
  if (!dateInput) return null;

  if (typeof dateInput === 'object' && typeof dateInput.val === 'string') {
    return dateInput.val.replace(/'/g, '').slice(0, 10);
  }

  const str = dateInput instanceof Date ? dateInput.toISOString() : String(dateInput);
  const dateOnly = str.slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : null;
};

export const normalizeInventoryProductData = (productData = {}) => ({
  ...productData,
  codigo_barras: normalizeInventoryText(productData.codigo_barras),
  lote: normalizeInventoryText(productData.lote),
  existencias: Number(productData.existencias || 0),
  fecha_caducidad: productData.fecha_caducidad,
});

export const inventoryLotKey = ({ sucursal_id, codigo_barras, lote, fecha_caducidad }) => {
  const normalizedBarcode = normalizeInventoryText(codigo_barras);
  const normalizedLot = normalizeInventoryText(lote);
  const normalizedDate = normalizeInventoryDate(fecha_caducidad);
  return `${String(sucursal_id || '')}||${normalizedBarcode}||${normalizedLot}||${normalizedDate || ''}`;
};

export const aggregateInventoryProducts = (products = []) => {
  const grouped = new Map();

  for (const product of products) {
    const normalizedProduct = normalizeInventoryProductData(product);
    const key = inventoryLotKey({
      sucursal_id: normalizedProduct.sucursal_id,
      codigo_barras: normalizedProduct.codigo_barras,
      lote: normalizedProduct.lote,
      fecha_caducidad: normalizedProduct.fecha_caducidad,
    });

    const current = grouped.get(key);
    if (current) {
      current.existencias = Number(current.existencias || 0) + Number(normalizedProduct.existencias || 0);
      continue;
    }

    grouped.set(key, {
      ...normalizedProduct,
      existencias: Number(normalizedProduct.existencias || 0),
    });
  }

  return Array.from(grouped.values());
};

export const buildInventoryLotWhere = (sucursal_id, productData = {}) => {
  const normalizedProduct = normalizeInventoryProductData(productData);
  const normalizedDate = normalizeInventoryDate(normalizedProduct.fecha_caducidad);

  return {
    sucursal_id,
    codigo_barras: normalizedProduct.codigo_barras,
    lote: normalizedProduct.lote,
    [Sequelize.Op.and]: [
      Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('fecha_caducidad')),
        '=',
        normalizedDate
      ),
    ],
  };
};

export const isDuplicateInventoryError = (error) => {
  if (!error) return false;

  return (
    error.name === 'SequelizeUniqueConstraintError' ||
    error.code === 'ER_DUP_ENTRY' ||
    error.code === '23505' ||
    /duplicate|duplicado/i.test(error.message || '')
  );
};
