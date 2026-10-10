function crearServicioReservas(datosIniciales = []) {
  const reservas = datosIniciales.map((reserva) => ({ ...reserva }));
  let siguienteId = reservas.length + 1;

  return {
    listar() {
      return reservas;
    },

    buscarPorId(id) {
      return reservas.find((reserva) => reserva.id === id);
    },

    contar() {
      return reservas.length;
    },

    crear(datos) {
      const nuevaReserva = { id: siguienteId, ...datos };
      siguienteId++;
      reservas.push(nuevaReserva);
      return nuevaReserva;
    },
  };
}

module.exports = { crearServicioReservas };
