const { leerConfiguracion } = require("./config/entorno");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearApp } = require("./app");
const { reservasIniciales } = require("./datos/semilla");

let configuracion;

try {
  configuracion = leerConfiguracion();
} catch (error) {
  console.error(`Error de configuración: ${error.message}`);
  process.exit(1);
}

const datosIniciales = process.argv.includes("--vacio")
  ? []
  : reservasIniciales;
const servicio = crearServicioReservas(datosIniciales);
const app = crearApp({ servicio, configuracion });

app.listen(configuracion.puerto, () => {
  console.log(
    `Servidor escuchando en http://localhost:${configuracion.puerto} (${configuracion.entorno})`,
  );
});
