const { salasPermitidas, turnosPermitidos } = require("../datos/semilla");

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function validarReserva(req, res, next) {
  const cuerpo = req.body || {};

  const estudiante = String(cuerpo.estudiante || "").trim();
  const email = String(cuerpo.email || "").trim();
  const sala = String(cuerpo.sala || "").trim();
  const fecha = String(cuerpo.fecha || "").trim();
  const turno = String(cuerpo.turno || "").trim();
  const personasTexto = String(cuerpo.personas || "").trim();
  const personas = Number(personasTexto);

  const errores = [];

  if (!estudiante) {
    errores.push("El nombre del estudiante es obligatorio.");
  }

  if (!email) {
    errores.push("El email es obligatorio.");
  } else if (!email.includes("@")) {
    errores.push("El email debe contener el símbolo @.");
  }

  if (!sala) {
    errores.push("Debes elegir una sala.");
  } else if (!salasPermitidas.includes(sala)) {
    errores.push("La sala elegida no está permitida.");
  }

  if (!fecha) {
    errores.push("La fecha es obligatoria.");
  }

  if (!turno) {
    errores.push("Debes elegir un turno.");
  } else if (!turnosPermitidos.includes(turno)) {
    errores.push("El turno elegido no está permitido.");
  }

  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    errores.push(
      "La cantidad de personas debe ser un número entero entre 1 y 6.",
    );
  }

  if (errores.length > 0) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores,
      datos: { estudiante, email, sala, fecha, turno, personas: personasTexto },
      salas: salasPermitidas,
      turnos: turnosPermitidos,
    });
  }

  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  next();
}

module.exports = { prepararAreaReservas, validarReserva };
