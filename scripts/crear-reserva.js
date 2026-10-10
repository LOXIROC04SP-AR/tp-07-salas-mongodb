const {
  conectar,
  desconectar,
  describirError,
} = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

// Datos ficticios. Para una prueba negativa: cambiar UN campo y restaurarlo.
const datos = {
  estudiante: "Ana Prueba",
  email: "ana.prueba@ejemplo.com",
  sala: "Sala Norte",
  fecha: "2026-11-02",
  turno: "Mañana",
  personas: 3,
};

async function main() {
  try {
    await conectar();
    const reserva = await Reserva.create(datos);
    console.log(`Reserva guardada. _id: ${reserva._id.toString()}`);
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("RECHAZADA: la reserva no es válida. No se guardó nada.");
      console.error(`Tipo de problema: ${error.name}`);
      for (const [campo, detalle] of Object.entries(error.errors)) {
        console.error(
          `- Revisar "${campo}" (${detalle.kind}): ${detalle.message}`,
        );
      }
    } else {
      console.error("FALLÓ la creación. No se confirmó nada.");
      console.error(describirError(error));
    }
    process.exitCode = 1;
  } finally {
    await desconectar();
  }
}

main();
