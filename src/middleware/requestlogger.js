const logger = require('../config/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Ignorar archivos estáticos
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf'];
  const isStatic = staticExtensions.some(ext => req.url.endsWith(ext));
  
  if (isStatic) {
    return next();
  }

  // Capturar cuando la response termine
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      // Agregar info del usuario si está autenticado
      user: req.user ? {
        id: req.user.id,
        username: req.user.username,
        rol: req.user.rol
      } : undefined,
      ip: req.ip
    };

    // Solo loguear errores en consola, el resto solo en archivo
    if (res.statusCode >= 500) {
      logger.error(logData, 'Request failed');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Client error');
    } else {
      // Nivel debug para peticiones exitosas (solo aparece en archivo)
      logger.debug(logData, 'Request OK');
    }
  });

  next();
}

module.exports = requestLogger;