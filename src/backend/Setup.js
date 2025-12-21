/**
 * This function initializes the entire database structure by creating individual sheets for students, teachers, external participants, institutions, theses, events, and configuration. It retrieves the database instance and then calls specific functions to create and configure each sheet.
 */
function crearEstructuraCompleta() {
    const ss = getDB();
    crearHojaEstudiantes(ss);
    crearHojaDocentes(ss);
    crearHojaExternos(ss);
    crearHojaInstituciones(ss);
    crearHojaTesis(ss);
    crearHojaEventos(ss);
    crearHojaConfiguracion(ss);
}

/**
 * Configura una hoja dada estableciendo sus encabezados, aplicando estilos, redimensionando columnas y congelando la primera fila.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} s - Objeto de la hoja a configurar.
 * @param {string[]} h - Array de cadenas que representan los encabezados.
 * @param {string} c - Color de fondo para la fila de encabezado.
 */
function configurarHoja(s, h, c) {
    if (s.getLastRow() === 0) s.appendRow(h);
    else s.getRange(1, 1, 1, h.length).setValues([h]);
    s.getRange(1, 1, 1, h.length).setBackground(c).setFontColor('white').setFontWeight('bold');
    s.autoResizeColumns(1, h.length);
    s.setFrozenRows(1);
}

/**
 * Crea o actualiza la hoja de 'Estudiantes'. Define los encabezados específicos y llama a `configurarHoja`.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Objeto de la hoja de cálculo de Google.
 */
function crearHojaEstudiantes(ss) {
    const headers = ['ID_Estudiante', 'Tipo_Documento', 'Cedula', 'Lugar_Expedicion', 'Apellido1', 'Apellido2', 'Nombre1', 'Nombre2', 'Sexo', 'Email', 'Telefono', 'Direccion', 'Ciudad', 'Comentarios', 'Fecha_Ingreso', 'Cohorte_Ingreso', 'Estado', 'Fecha_Egreso', 'Cohorte_Egreso', 'Fecha_Retiro', 'Reingreso', 'Fecha_Reingreso', 'Situacion_Laboral_Actual', 'Empresa_Institucion', 'Cargo_Actual', 'Sector_Desempeno', 'Fecha_Registro', 'Ultima_Actualizacion'];
    const s = ss.getSheetByName(CONFIG.SHEETS.ESTUDIANTES) || ss.insertSheet(CONFIG.SHEETS.ESTUDIANTES);
    configurarHoja(s, headers, CONFIG.COLORS.ESTUDIANTES);
}

/**
 * Crea o actualiza la hoja de 'Docentes'.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Objeto de la hoja de cálculo.
 */
function crearHojaDocentes(ss) {
    const headers = ['ID_Docente', 'Tipo_Documento', 'Cedula', 'Lugar_Expedicion', 'Apellido1', 'Apellido2', 'Nombre1', 'Nombre2', 'Sexo', 'Email', 'Telefono', 'Comentarios', 'Tipo_Vinculacion', 'Activo', 'Fecha_Vinculacion', 'Fecha_Desvinculacion', 'Nivel_Formacion', 'Especialidad', 'Categoria', 'Link_CvLAC', 'Grupo_Investigacion', 'Linea_Investigacion_Principal', 'Fecha_Registro', 'Ultima_Actualizacion'];
    const s = ss.getSheetByName(CONFIG.SHEETS.DOCENTES) || ss.insertSheet(CONFIG.SHEETS.DOCENTES);
    configurarHoja(s, headers, CONFIG.COLORS.DOCENTES);
}

/**
 * Crea o actualiza la hoja de 'Externos'.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Objeto de la hoja de cálculo.
 */
function crearHojaExternos(ss) {
    const headers = ['ID_Externo', 'Tipo_Documento', 'Numero_Documento', 'Lugar_Expedicion', 'Apellido1', 'Apellido2', 'Nombre1', 'Nombre2', 'Sexo', 'Email', 'Telefono', 'Pais', 'Ciudad', 'Tipo_Origen', 'Organizacion', 'Cargo_Perfil', 'Fecha_Registro', 'Ultima_Actualizacion'];
    const s = ss.getSheetByName(CONFIG.SHEETS.EXTERNOS) || ss.insertSheet(CONFIG.SHEETS.EXTERNOS);
    configurarHoja(s, headers, CONFIG.COLORS.EXTERNOS);
}

/**
 * Crea o actualiza la hoja de 'Instituciones'.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Objeto de la hoja de cálculo.
 */
function crearHojaInstituciones(ss) {
    const headers = ['ID_Institucion', 'Nombre_Institucion', 'Sigla', 'Tipo', 'Pais', 'Ciudad', 'Contacto_Principal', 'Tipo_Convenio', 'Fecha_Firma_Convenio', 'Vigente', 'URL_Web', 'Activa', 'Fecha_Registro'];
    const s = ss.getSheetByName(CONFIG.SHEETS.INSTITUCIONES) || ss.insertSheet(CONFIG.SHEETS.INSTITUCIONES);
    configurarHoja(s, headers, CONFIG.COLORS.INSTITUCIONES);
}

/**
 * Crea o actualiza la hoja de 'Tesis'. Incluye detalles sobre estudiantes, asesores, codirectores y jurados.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Objeto de la hoja de cálculo.
 */
function crearHojaTesis(ss) {
    const headers = [
        'ID_Tesis', 'Titulo_Investigacion', 'Año', 'Estado_Tesis', 'Calificacion',
        'Modalidad', 'Linea_Investigacion_Tesis', 'Palabras_Clave', 'Resumen',
        'ID_Estudiante', 'Nombre_Estudiante', 'ID_Asesor', 'Nombre_Asesor',
        'Codirector', 'Nombre_Codirector', 'Jurado_1', 'Nombre_Jurado_1', 'Jurado_2', 'Nombre_Jurado_2',
        'Fecha_Inicio', 'Fecha_Defensa', 'Numero_Acta_Sustentacion', 'URL_Documento',
        'Fecha_Registro', 'Ultima_Actualizacion'
    ];
    const s = ss.getSheetByName(CONFIG.SHEETS.TESIS) || ss.insertSheet(CONFIG.SHEETS.TESIS);
    configurarHoja(s, headers, CONFIG.COLORS.TESIS);
}

/**
 * Crea o actualiza la hoja de 'Eventos'. Incluye detalles sobre participantes, tesis vinculadas e impacto académico.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Objeto de la hoja de cálculo.
 */
function crearHojaEventos(ss) {
    const headers = [
        'ID_Evento', 'Nombre_Evento', 'Tipo_Evento', 'Alcance', 'Modalidad', 'Lugar',
        'Fecha_Inicio', 'Fecha_Fin', 'Año', 'Tipo_Participacion',
        'IDs_Estudiantes_Asistentes', 'Nombres_Estudiantes_Asistentes', 'Rol_Estudiantes',
        'IDs_Docentes_Participantes', 'Nombres_Docentes_Participantes', 'Rol_Docentes',
        'IDs_Tesis_Vinculadas', 'Titulos_Tesis_Vinculadas',
        'IDs_Instituciones', 'Nombres_Instituciones', 'Rol_Instituciones',
        'IDs_Externos_Participantes', 'Nombres_Externos_Participantes', 'Rol_Externos',
        'Cantidad_Nacionales', 'Cantidad_Internacionales', 'Perfil_Externos',
        'Presupuesto', 'Fuente_Financiacion', 'Descripcion', 'Impacto_Academico', 'URL_Evidencias',
        'Fecha_Registro', 'Ultima_Actualizacion'
    ];
    const s = ss.getSheetByName(CONFIG.SHEETS.EVENTOS) || ss.insertSheet(CONFIG.SHEETS.EVENTOS);
    configurarHoja(s, headers, CONFIG.COLORS.EVENTOS);
}

/**
 * Crea o actualiza la hoja de 'Configuración'. Asegura que existan los contadores para la generación de IDs.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Objeto de la hoja de cálculo.
 */
function crearHojaConfiguracion(ss) {
    const s = ss.getSheetByName(CONFIG.SHEETS.CONFIG) || ss.insertSheet(CONFIG.SHEETS.CONFIG);
    if (s.getLastRow() === 0) {
        s.appendRow(['Parametro', 'Valor', 'Descripcion', 'Ultima_Actualizacion']);
        s.getRange("A1:D1").setBackground(CONFIG.COLORS.CONFIG).setFontColor("white").setFontWeight("bold");
    }
    const contadores = [['Siguiente_ID_Estudiante', '1'], ['Siguiente_ID_Docente', '1'], ['Siguiente_ID_Tesis', '1'], ['Siguiente_ID_Evento', '1'], ['Siguiente_ID_Institucion', '1'], ['Siguiente_ID_Externo', '1']];
    const existentes = s.getDataRange().getValues().map(r => r[0]);
    contadores.forEach(c => { if (!existentes.includes(c[0])) s.appendRow([c[0], c[1], 'Auto', new Date()]); });
}