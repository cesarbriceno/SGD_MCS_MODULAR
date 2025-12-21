/**
 * Esta función toma una cadena como entrada y la formatea a formato Título. Convierte toda la cadena a minúsculas y luego capitaliza la primera letra de cada palabra, respetando varios delimitadores.
 *
 * @param {string} t - La cadena de entrada a formatear.
 * @returns {string} La cadena formateada. Devuelve vacío si la entrada es nula.
 */
function formatearNombrePropio(t) {
  return !t ? "" : String(t).toLowerCase().replace(/(?:^|\s|['"({])+\S/g, m => m.toUpperCase());
}

/**
 * Esta función toma una cadena como entrada y la formatea como una dirección de correo electrónico (minúsculas y sin espacios laterales).
 *
 * @param {string} e - El correo de entrada.
 * @returns {string} El correo formateado.
 */
function formatearEmail(e) {
  return !e ? "" : String(e).trim().toLowerCase();
}

/**
 * Formatea un texto de manera general: quita espacios y pone en mayúscula solo la primera letra de toda la cadena.
 *
 * @param {string} t - Cadena de entrada.
 * @returns {string} Texto formateado.
 */
function formatearTextoGeneral(t) {
  if (!t) return "";
  let s = String(t).trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Función auxiliar para obtener una hoja específica de Google por su nombre. Lanza un error si la hoja no existe.
 *
 * @param {string} n - El nombre de la hoja a recuperar.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} El objeto de la hoja de Google.
 * @throws {Error} Si la hoja no existe.
 */
function obtenerHoja(n) {
  const ss = getDB();
  const s = ss.getSheetByName(n);
  if (!s) throw new Error(`Hoja ${n} no existe.`);
  return s;
}

/**
 * Recupera los encabezados de la primera fila de una hoja dada. Limpia espacios y filtra encabezados vacíos.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} s - El objeto de la hoja de Google.
 * @returns {string[]} Lista de encabezados.
 */
function getModuleHeaders(s) {
  const lc = s.getLastColumn();
  if (lc === 0) return [];
  return s.getRange(1, 1, 1, lc).getValues()[0].map(h => String(h).trim()).filter(h => h.length > 0);
}