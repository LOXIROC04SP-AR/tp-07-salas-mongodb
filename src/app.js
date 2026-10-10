const path = require("node:path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const {
  identificarSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearRouterReservas } = require("./rutas/reservas");

function crearApp({ servicio, configuracion }) {
  const app = express();
  const controlador = crearControladorReservas(servicio);
  const raiz = path.join(__dirname, "..");

  app.set("view engine", "ejs");
  app.set("views", path.join(raiz, "views"));
  app.set("layout", "layouts/main");

  // Morgan va antes de static: también registra los archivos estáticos (CSS).
  app.use(morgan(configuracion.formatoRegistro));
  app.use(identificarSolicitud);
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(raiz, "public")));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Inicio" });
  });

  app.get("/estado", controlador.estado);

  app.use("/reservas", crearRouterReservas(controlador));

  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  return app;
}

module.exports = { crearApp };
