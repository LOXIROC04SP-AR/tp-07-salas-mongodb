const { performance } = require("node:perf_hooks");

let contadorSolicitudes = 0;

function identificarSolicitud(req, res, next) {
  contadorSolicitudes++;
  res.locals.solicitudId =
    "BIB-" + String(contadorSolicitudes).padStart(4, "0");
  next();
}

function medirDuracion(req, res, next) {
  const inicio = performance.now();

  res.on("finish", () => {
    const duracion = (performance.now() - inicio).toFixed(2);
    console.log(
      `[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duracion} ms`,
    );
  });

  next();
}

module.exports = { identificarSolicitud, medirDuracion };
