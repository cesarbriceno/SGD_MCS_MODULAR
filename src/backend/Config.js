// Agrega el ID de tu hoja de cálculo aquí (lo sacas de la URL del Excel)
const SPREADSHEET_ID = "1TeWJDpxux2TydlLEryy5AgFF5j_aE9vv6jHlu120BO8";

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

// Helper para abrir la hoja correcta (Reemplaza al getActiveSpreadsheet)
function getDB() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}