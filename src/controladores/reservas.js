const { salasPermitidas, turnosPermitidos } = require("../datos/semilla");

function crearControladorReservas(servicio) {
  return {
    estado(req, res) {
      res.json({
        servicio: "activo",
        reservas: servicio.contar(),
        solicitudId: res.locals.solicitudId,
      });
    },

    listar(req, res) {
      res.render("reservas/lista", {
        titulo: "Reservas",
        reservas: servicio.listar(),
      });
    },

    formulario(req, res) {
      res.render("reservas/nueva", {
        titulo: "Nueva reserva",
        errores: [],
        datos: {
          estudiante: "",
          email: "",
          sala: "",
          fecha: "",
          turno: "",
          personas: "",
        },
        salas: salasPermitidas,
        turnos: turnosPermitidos,
      });
    },

    detalle(req, res) {
      const id = Number(req.params.id);
      const reserva = servicio.buscarPorId(id);

      if (!reserva) {
        return res.status(404).render("no-encontrado", {
          titulo: "Reserva no encontrada",
          mensaje: `No existe una reserva con el identificador ${req.params.id}.`,
        });
      }

      res.render("reservas/detalle", {
        titulo: `Reserva ${reserva.id}`,
        reserva,
      });
    },

    crear(req, res) {
      servicio.crear(req.reservaValidada);
      res.redirect("/reservas");
    },
  };
}

module.exports = { crearControladorReservas };
