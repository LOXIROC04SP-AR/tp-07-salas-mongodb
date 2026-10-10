// Matriz HTTP manual.
// 1) En una terminal: npm start   2) En otra: npm run matriz
// Otro puerto: BASE_URL=http://localhost:4010 npm run matriz
const BASE = process.env.BASE_URL || "http://localhost:3000";

const valido = {
  estudiante: "Ana Prueba",
  email: "ana@mail.com",
  sala: "Sala Norte",
  fecha: "2026-10-10",
  turno: "Tarde",
  personas: "2",
};

async function pedir(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, redirect: "manual" };
  if (cuerpo) {
    opciones.headers = { "Content-Type": "application/x-www-form-urlencoded" };
    opciones.body = new URLSearchParams(cuerpo).toString();
  }
  return fetch(BASE + ruta, opciones);
}

async function cantidad() {
  const r = await pedir("GET", "/estado");
  return (await r.json()).reservas;
}

const titulo = (t) => (t.match(/<h1>(.*?)<\/h1>/) || [])[1] || "";
const alertas = (t) => `${(t.match(/<li>(?!<a)/g) || []).length} error(es)`;

async function caso(nombre, metodo, ruta, cuerpo, evidencia) {
  const res = await pedir(metodo, ruta, cuerpo);
  const texto = await res.text();
  const extra = evidencia ? evidencia(res, texto) : "";
  console.log(`| ${nombre} | ${res.status} | ${await cantidad()} | ${extra} |`);
}

(async () => {
  console.log("| Caso | Estado | Reservas | Evidencia |");
  console.log("|---|---|---|---|");
  await caso("GET /", "GET", "/", null, (r, t) => titulo(t));
  await caso("GET /estado", "GET", "/estado", null, (r, t) =>
    t.replace(/"solicitudId":"[^"]*"/, '"solicitudId":"<id>"'),
  );
  await caso(
    "GET /reservas",
    "GET",
    "/reservas",
    null,
    (r, t) => `${titulo(t)}; ${(t.match(/<article/g) || []).length} tarjetas`,
  );
  await caso(
    "GET /reservas/nueva",
    "GET",
    "/reservas/nueva",
    null,
    (r, t) => `${titulo(t)}; selects: ${(t.match(/<select/g) || []).length}`,
  );
  await caso("GET /reservas/1", "GET", "/reservas/1", null, (r, t) =>
    titulo(t),
  );
  await caso("GET /reservas/99", "GET", "/reservas/99", null, (r, t) =>
    titulo(t),
  );
  await caso("POST vacío", "POST", "/reservas", {}, (r, t) => alertas(t));
  await caso(
    "POST sala no permitida",
    "POST",
    "/reservas",
    { ...valido, sala: "Sala Falsa" },
    (r, t) => alertas(t),
  );
  await caso(
    "POST turno no permitido",
    "POST",
    "/reservas",
    { ...valido, turno: "Madrugada" },
    (r, t) => alertas(t),
  );
  await caso(
    "POST email sin @",
    "POST",
    "/reservas",
    { ...valido, email: "anamail.com" },
    (r, t) => alertas(t),
  );
  for (const p of ["0", "7", "1.5"]) {
    await caso(
      `POST personas=${p}`,
      "POST",
      "/reservas",
      { ...valido, personas: p },
      (r, t) => alertas(t),
    );
  }
  await caso(
    "POST válido",
    "POST",
    "/reservas",
    valido,
    (r) => `Location: ${r.headers.get("location")}`,
  );
  await caso("GET /reservas tras alta", "GET", "/reservas", null, (r, t) =>
    t.includes("Ana Prueba")
      ? "incluye la reserva nueva"
      : "NO incluye la reserva nueva",
  );
  await caso("GET /css/estilos.css", "GET", "/css/estilos.css", null, (r) =>
    r.headers.get("content-type"),
  );
  await caso("GET /url-inexistente", "GET", "/url-inexistente", null, (r, t) =>
    titulo(t),
  );
})().catch((e) => {
  console.error("No se pudo conectar:", e.message);
  process.exit(1);
});
