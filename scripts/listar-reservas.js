const {
  conectar,
  desconectar,
  describirError,
} = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

async function main() {
  try {
    await conectar();
    const reservas = await Reserva.find();

    console.log("Reservas en la base:");
    for (const r of reservas) {
      console.log(
        `- ${r._id.toString()} | ${r.estudiante} | ${r.sala} | ${r.fecha} | ${r.turno} | ${r.personas} pers.`,
      );
    }
    console.log(`Cantidad recuperada: ${reservas.length}`);
  } catch (error) {
    console.error("FALLÓ la consulta.");
    console.error(describirError(error));
    process.exitCode = 1;
  } finally {
    await desconectar();
  }
}

main();
