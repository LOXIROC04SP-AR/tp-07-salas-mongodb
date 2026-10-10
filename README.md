# Trabajo práctico 07 - Persistencia inicial de reservas de salas

Reservas de salas de estudio (Node.js, Express, EJS) con un laboratorio de persistencia en MongoDB mediante Mongoose.

## 1. Punto de partida

- Punto de partida: copia funcional de mi TP 06 (`tp-06-salas-modular`), que quedó intacto. La copia se llama `tp-07-salas-mongodb` y no incluye `node_modules`, `.git` ni `.env`.
- El TP 06 funcionaba (matriz HTTP completa con resultados correctos), así que no hizo falta reparar nada.
- Se conservan sin cambios funcionales: `src/index.js`, `src/app.js`, rutas, controladores, servicio en memoria, middleware, vistas EJS, datos iniciales, CSS y `scripts/matriz.js`.
- Cambios de este TP: `src/configuracion.js` se movió a `src/config/entorno.js` (con el lector de `MONGODB_URI`) y se actualizó la importación en `src/index.js`; se agregaron `src/config/base-datos.js`, `src/modelos/reserva.js`, tres programas en `scripts/` y los scripts de calidad ampliados a `scripts`.

## 2. Versiones

- Node.js 24 (probado con v24.21.0; se usa `--env-file`, requiere 22.9 o superior)
- Express 5.2.1, EJS 6.0.1, Mongoose 9.11.1, ESLint 10.11.0, Prettier 3.9.9
- Base de datos: **MongoDB Atlas, clúster gratuito Free (M0)**, base propia `reservas_salas_u7`.

## 3. Pasos desde una descarga nueva

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Preparar el clúster en Atlas:
   - Crear un clúster **Free (M0)** (o reutilizar el de las clases; las bases de productos y caminatas no se tocan).
   - En _Database Access_: crear un usuario de base con permiso de lectura y escritura.
   - En _Network Access_: permitir la IP desde la que se trabaja.
   - En _Connect > Drivers > Node.js_: copiar la URI de conexión.
3. Copiar la plantilla y completarla con los datos reales:

   ```bash
   cp .env.example .env
   ```

   Reemplazar `USUARIO`, `CLAVE` y `HOST`, conservando el nombre de base `reservas_salas_u7` y las opciones `?retryWrites=true&w=majority`.
   `.env` está excluido de Git; `.env.example` se versiona.

## 4. Comandos y diagnóstico DNS

Desde la raíz del proyecto:

| Qué hace | Comando |
|---|---|
| Probar conexión | `node --env-file=.env scripts/comprobar-conexion.js` |
| Crear una reserva | `node --env-file=.env scripts/crear-reserva.js` |
| Listar reservas | `node --env-file=.env scripts/listar-reservas.js` |
| Formatear | `npm run format` |
| Calidad | `npm run check` |
| Sitio web | `npm start` (http://localhost:3000) |

Atajos equivalentes: `npm run conexion`, `npm run crear`, `npm run listar`. También siguen disponibles `npm run start:vacio`, `npm run start:local` y `npm run matriz`.

**DNS:** Atlas usa registros SRV/TXT (`mongodb+srv://`). En `src/config/base-datos.js` se ejecuta una sola vez, antes de conectar, `dns.setServers(["8.8.8.8", "1.1.1.1"])`. Esto cambia solo la resolución DNS de Node: no el sistema operativo, ni la autenticación, ni la lista de IPs de Atlas. Resolutores usados: 8.8.8.8 y 1.1.1.1. Si la red bloquea DNS públicos, se acuerda otro ajuste con el docente.

Ante un fallo, los programas muestran el nombre del error, el código (por ejemplo `ENOTFOUND` o `ECONNREFUSED`) y la operación de resolución (por ejemplo `querySrv`), sin publicar la URI ni las credenciales.

## 5. Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/config/entorno.js` | Configuración HTTP (`PORT`, `NODE_ENV`) y lector de `MONGODB_URI` |
| `src/config/base-datos.js` | DNS, conexión, desconexión y diagnóstico de errores |
| `src/modelos/reserva.js` | Esquema, modelo `Reserva` y colección `reservas` |
| `scripts/comprobar-conexion.js` | Prueba de conexión (no crea reservas) |
| `scripts/crear-reserva.js` | Crea una reserva válida por ejecución |
| `scripts/listar-reservas.js` | Lista todas las reservas y su cantidad |
| `src/index.js`, `src/app.js`, `src/rutas/`, `src/controladores/`, `src/servicios/`, `src/middleware/`, `src/datos/`, `views/`, `public/` | Sitio Express del TP 06, en memoria |

**Esquema, modelo y colección:** el _esquema_ describe los campos y reglas; el _modelo_ `Reserva` es el objeto que permite crear y consultar documentos con ese esquema; la _colección_ `reservas` es donde MongoDB guarda los documentos (se indica de forma explícita en `mongoose.model("Reserva", esquema, "reservas")`).

El `_id` es un ObjectId generado por Mongoose y se convierte a texto solo al mostrarlo. Un `_id` asignado a un objeto en memoria no demuestra una escritura: solo queda confirmada cuando `create` termina sin error, por eso el programa imprime el `_id` después de esperar el resultado.

## 6. Campos y reglas

| Campo | Tipo | Regla |
|---|---|---|
| estudiante | String | Obligatorio, `trim` |
| email | String | Obligatorio, `trim`, contiene `@` (`match: /@/`) |
| sala | String | Obligatorio: Sala Norte, Sala Sur o Sala Multimedia (`enum`) |
| fecha | String | Obligatorio y no vacío tras `trim` |
| turno | String | Obligatorio: Mañana, Tarde o Noche (`enum`) |
| personas | Number | Obligatorio, entero (`validate` con `Number.isInteger`), entre 1 y 6 (`min` y `max`) |

**Límites que todavía no se controlan:** validación completa de email, fechas imposibles o pasadas, solapamientos de sala y turno, cupos compartidos y reservas repetidas. No hay índice único ni regla de fecha futura. Por eso ejecutar dos veces `crear-reserva.js` genera dos documentos distintos con los mismos campos; es la conducta esperada y no se oculta borrando registros.

## 7. Pruebas

### Matriz de pruebas

Todas las pruebas se ejecutaron contra la base `reservas_salas_u7` de Atlas Free (M0). Las pruebas de validación se hicieron modificando temporalmente un solo campo del objeto `datos` de `scripts/crear-reserva.js` y restaurándolo al terminar. La cantidad de reservas se comprobó con `listar-reservas.js`: después de todas las pruebas inválidas siguió en **2**.

| Caso | Resultado esperado | Resultado observado | Cantidad |
|---|---|---|---|
| Conexión válida | Confirmación y proceso terminado | "Conexión confirmada con MongoDB (base: reservas_salas_u7). No se crearon reservas." | sin cambios |
| Fallo DNS, si ocurrió | Registrar código/operación y solución | No ocurrió: la conexión funcionó con los resolutores 8.8.8.8 y 1.1.1.1 | - |
| Variable vacía | Fallo de configuración; sin éxito | "FALLÓ la conexión... Falta la variable MONGODB_URI". Sin mensaje de éxito | sin cambios |
| Contraseña incorrecta temporal | Fallo de autenticación; sin documentos | `MongoServerError`, código 8000, "bad auth : authentication failed". Sin éxito. Luego se restauró la URI y la conexión volvió a confirmarse | sin cambios |
| Colección vacía | Cantidad 0, sin error | No probado: la base ya tenía reservas por el ensayo de persistencia y no se borraron datos. No se dispuso de otra base de laboratorio | - |
| Reserva válida | Se guarda y devuelve `_id` | "Reserva guardada. _id: 6aca849c180580d274cd021e" | 1 -> 2 |
| Consulta desde proceso nuevo | Recupera ese `_id` | El listado incluye `6aca849c180580d274cd021e` | 2 |
| Segunda consulta | No agrega registros | Cantidad recuperada: 2 | 2 -> 2 |
| Estudiante vacío | Rechazo | RECHAZADA: `Revisar "estudiante" (required)` | 2 -> 2 |
| Email sin @ | Rechazo | RECHAZADA: `Revisar "email" (regexp)` | 2 -> 2 |
| Sala no permitida ("Sala Este") | Rechazo | RECHAZADA: `Revisar "sala" (enum)` | 2 -> 2 |
| Turno no permitido ("Madrugada") | Rechazo | RECHAZADA: `Revisar "turno" (enum)` | 2 -> 2 |
| Fecha vacía | Rechazo | RECHAZADA: `Revisar "fecha" (required)` | 2 -> 2 |
| Personas 0 | Rechazo | RECHAZADA: `Revisar "personas" (min)` | 2 -> 2 |
| Personas 7 | Rechazo | RECHAZADA: `Revisar "personas" (max)` | 2 -> 2 |
| Personas 2.5 | Rechazo | RECHAZADA: `Revisar "personas"`: "debe ser un número entero" | 2 -> 2 |
| Personas "abc" | Rechazo de conversión | RECHAZADA: `Revisar "personas" (Number)`: "Cast to Number failed" | 2 -> 2 |

### Evidencia de persistencia entre procesos

Ensayo en la base `reservas_salas_u7`. Cada comando es un proceso de Node.js distinto (transcripción completa en `evidencia/transcripcion.txt`):

1. `node --env-file=.env scripts/listar-reservas.js` -> cantidad inicial: **1** (`6aca845888da765be84d3e46`, creada en una ejecución anterior)
2. `node --env-file=.env scripts/crear-reserva.js` -> `_id` devuelto: **6aca849c180580d274cd021e**
3. El programa termina; se inicia otro proceso de Node.js.
4. `node --env-file=.env scripts/listar-reservas.js` -> aparecen ambos `_id`, incluido `6aca849c180580d274cd021e`; cantidad **2** (creció en uno)
5. `node --env-file=.env scripts/listar-reservas.js` -> la cantidad sigue en **2** (sin otras escrituras)
6. Data Explorer de Atlas: base `reservas_salas_u7`, colección `reservas`, documento con `_id` `6aca849c180580d274cd021e` (captura en `evidencia/`).

Como se ejecutó dos veces la creación con los mismos datos, hay dos documentos casi iguales con `_id` distintos. Es la conducta esperada (no hay índice único) y no se ocultó borrando registros.

### Sitio web con `npm start`

Se ejecutó `npm start` y `npm run matriz` (el mismo script del TP 06) con resultado idéntico al del TP 06: inicio, `/estado` y listado responden 200; el formulario válido redirige (302) y crea en memoria (4 a 5 reservas); el inválido devuelve 400 y no crea; el CSS responde 200; una ruta inexistente y `/reservas/99` devuelven 404. También se comprobó que un `PORT` inválido sigue impidiendo el inicio con un mensaje claro. El sitio arranca sin `MONGODB_URI`.

### Calidad

`npm run format` y `npm run check` se ejecutan sobre `src` y `scripts`: sin diferencias de formato ni errores de ESLint. Las reglas de calidad no se modificaron para ocultar errores (solo se agregaron los globales `fetch` y `URLSearchParams`, que usa `scripts/matriz.js`).

## 8. Por qué el sitio sigue en memoria

Las rutas web usan el arreglo en memoria del TP 06 y los controladores son sincrónicos. Las reservas persistentes se crean y consultan solo desde los programas de terminal de `scripts/`, por eso las reservas del laboratorio no aparecen en las vistas. No se migró el servicio HTTP ni se pasaron los controladores a promesas: Mongoose trabaja con operaciones asíncronas y esa integración corresponde a la **unidad 8**, donde el sitio pasará a usar el modelo `Reserva`.

## 9. Seguridad

No se publican `.env`, credenciales ni datos personales. Todos los datos de prueba son ficticios. `node_modules` y `.env` están excluidos por `.gitignore`; se versiona `.env.example` con marcadores.
