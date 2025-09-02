module.exports = {
    generateRandomSale: (context, ee, next) => {
      const randomUserId = Math.floor(Math.random() * 100) + 1;  // ID entre 1-100
      const randomBarcode = `COD-${Math.random().toString(36).substr(2, 8)}`;
      
      context.vars.usuario_id = randomUserId;
      context.vars.detalles[0].codigo_barras = randomBarcode;
      
      return next();
    }
  };