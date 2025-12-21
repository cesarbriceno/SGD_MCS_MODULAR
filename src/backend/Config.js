/**
 * @constant
 * @description Esta constante contiene el ID de la hoja de cálculo de Google. Este ID se extrae de la URL de la hoja.
 */
const SPREADSHEET_ID = "1TeWJDpxux2TydlLEryy5AgFF5j_aE9vv6jHlu120BO8";

/**
 * @constant
 * @description Este objeto define la configuración de la aplicación, detallando los nombres de las hojas y sus colores correspondientes.
 * @property {object} SHEETS - Objeto donde las claves son nombres lógicos y los valores son los nombres reales de las hojas.
 * @property {string} SHEETS.ESTUDIANTES - Nombre de la hoja de estudiantes.
 * @property {string} SHEETS.DOCENTES - Nombre de la hoja de docentes.
 * @property {string} SHEETS.TESIS - Nombre de la hoja de tesis.
 * @property {string} SHEETS.EVENTOS - Nombre de la hoja de eventos.
 * @property {string} SHEETS.INSTITUCIONES - Nombre de la hoja de instituciones.
 * @property {string} SHEETS.EXTERNOS - Nombre de la hoja de participantes externos.
 * @property {string} SHEETS.CONFIG - Nombre de la hoja de configuración.
 * @property {object} COLORS - Objeto con códigos de colores hexadecimales para cada módulo.
 */
const CONFIG = {
  SHEETS: {
    ESTUDIANTES: 'Estudiantes', DOCENTES: 'Docentes', TESIS: 'Tesis',
    EVENTOS: 'Eventos', INSTITUCIONES: 'Instituciones', EXTERNOS: 'ParticipantesExternos',
    CONFIG: 'Configuracion'
  },
  COLORS: {
    ESTUDIANTES: '#4285F4', DOCENTES: '#FF9800', TESIS: '#9C27B0',
    EVENTOS: '#E91E63', INSTITUCIONES: '#009688', EXTERNOS: '#8BC34A', CONFIG: '#607D8B'
  }
};

/**
 * @function
 * @description Función auxiliar para acceder a la hoja de cálculo de Google mediante su ID.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Objeto que representa la hoja de cálculo.
 */
function getDB() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}