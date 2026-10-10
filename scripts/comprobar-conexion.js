const {
  conectar,
  desconectar,
  describirError,
} = require("../src/config/base-datos");

async function main() {
  try {
    const conexion = await conectar();
    console.log(`Conexión confirmada con MongoDB (base: ${conexion.name}).`);
    console.log("No se crearon reservas.");
  } catch (error) {
    console.error("FALLÓ la conexión. No se confirmó nada.");
    console.error(describirError(error));
    process.exitCode = 1;
  } finally {
    await desconectar();
  }
}

main();
