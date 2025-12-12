// ==========================================
// 1. LECTURA DE DATOS (Con corrección de Cohorte)
// ==========================================
function obtenerDatosHoja(n) {
  const s = obtenerHoja(n); 
  const d = s.getDataRange().getValues(); 
  if(d.length <= 1) return [];
  
  const h = d[0].map(x => String(x).trim());
  
  return d.slice(1).map(r => {
    const o = {}; 
    h.forEach((k, i) => { 
        let v = r[i]; 
        
        // MANTENER TU REGLA: Cohorte como texto, Fechas como YYYY-MM-DD
        if (k.toLowerCase().includes('cohorte')) {
             if (v instanceof Date) v = v.getFullYear() + "-" + (v.getMonth() + 1); 
             else v = String(v);
        }
        else if (v instanceof Date) {
             v = Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd"); 
        }
        
        o[k] = (v === undefined || v === null) ? "" : v; 
    }); 
    return o;
  }).filter(o => o[h[0]] && String(o[h[0]]).trim() !== "");
}

function obtenerDatosIniciales() {
  return { success:true, data: {
      estudiantes: obtenerDatosHoja(CONFIG.SHEETS.ESTUDIANTES), docentes: obtenerDatosHoja(CONFIG.SHEETS.DOCENTES),
      tesis: obtenerDatosHoja(CONFIG.SHEETS.TESIS), eventos: obtenerDatosHoja(CONFIG.SHEETS.EVENTOS),
      instituciones: obtenerDatosHoja(CONFIG.SHEETS.INSTITUCIONES), externos: obtenerDatosHoja(CONFIG.SHEETS.EXTERNOS)
  }};
}

// ==========================================
// 2. HELPERS DE TEXTO Y RELACIONES
// ==========================================
function formatearTextoCapital(texto) {
    if (!texto) return "";
    return String(texto).toLowerCase().replace(/(?:^|\s|['"({])+[a-z]/g, (l) => l.toUpperCase());
}

function enriquecerDatosConNombres(sheetKey, data) {
    const cache = {};
    function getMap(hoja, idKey, nameKeys) {
        if(!cache[hoja]) {
            const raw = obtenerDatosHoja(CONFIG.SHEETS[hoja]);
            cache[hoja] = {};
            raw.forEach(r => {
                let nombre = nameKeys.map(k => r[k]).join(' ').trim();
                if(nameKeys.length === 1) nombre = r[nameKeys[0]];
                cache[hoja][r[idKey]] = nombre;
            });
        } return cache[hoja];
    }
    function resolverNombres(idsStr, hoja, idKey, nameKeys) {
        if(!idsStr) return "";
        const mapa = getMap(hoja, idKey, nameKeys);
        return String(idsStr).split(',').map(id => mapa[id.trim()] || id).join(', ');
    }
    function resolverUnNombre(id, hoja, idKey, nameKeys) { if(!id) return ""; const mapa = getMap(hoja, idKey, nameKeys); return mapa[id] || id; }

    if (sheetKey === 'EVENTOS') {
        if(data['IDs_Estudiantes_Asistentes']) data['Nombres_Estudiantes_Asistentes'] = resolverNombres(data['IDs_Estudiantes_Asistentes'], 'ESTUDIANTES', 'ID_Estudiante', ['Nombre1','Apellido1']);
        if(data['IDs_Docentes_Participantes']) data['Nombres_Docentes_Participantes'] = resolverNombres(data['IDs_Docentes_Participantes'], 'DOCENTES', 'ID_Docente', ['Nombre1','Apellido1']);
        if(data['IDs_Externos_Participantes']) data['Nombres_Externos_Participantes'] = resolverNombres(data['IDs_Externos_Participantes'], 'EXTERNOS', 'ID_Externo', ['Nombre1','Apellido1']);
        if(data['IDs_Instituciones']) data['Nombres_Instituciones'] = resolverNombres(data['IDs_Instituciones'], 'INSTITUCIONES', 'ID_Institucion', ['Nombre_Institucion']);
        if(data['IDs_Tesis_Vinculadas']) data['Titulos_Tesis_Vinculadas'] = resolverNombres(data['IDs_Tesis_Vinculadas'], 'TESIS', 'ID_Tesis', ['Titulo_Investigacion']);
    }
    if (sheetKey === 'TESIS') {
        const mapDoc = getMap('DOCENTES', 'ID_Docente', ['Nombre1','Apellido1']);
        const getName = (id) => mapDoc[id] || id;
        if(data['Codirector']) data['Nombre_Codirector'] = getName(data['Codirector']);
        if(data['Jurado_1']) data['Nombre_Jurado_1'] = getName(data['Jurado_1']);
        if(data['Jurado_2']) data['Nombre_Jurado_2'] = getName(data['Jurado_2']);
        if(data['ID_Asesor']) data['Nombre_Asesor'] = getName(data['ID_Asesor']);
        if(data['ID_Estudiante']) data['Nombre_Estudiante'] = resolverUnNombre(data['ID_Estudiante'], 'ESTUDIANTES', 'ID_Estudiante', ['Nombre1','Apellido1']);
    }
    return data;
}

// ==========================================
// 3. GUARDAR DATOS (CON DOBLE VALIDACIÓN Y NORMALIZACIÓN TOTAL)
// ==========================================
function guardarDatos(modulo, data) {
  try {
    let sheetKey; const mu = String(modulo).toUpperCase();
    if (mu.startsWith('ESTUDIANTE')) sheetKey = 'ESTUDIANTES'; else if (mu.startsWith('DOCENTE')) sheetKey = 'DOCENTES';
    else if (mu.startsWith('TESIS')) sheetKey = 'TESIS'; else if (mu.startsWith('EVENTO')) sheetKey = 'EVENTOS';
    else if (mu.startsWith('INSTITUCION')) sheetKey = 'INSTITUCIONES'; else if (mu.startsWith('EXTERNO')) sheetKey = 'EXTERNOS';
    else throw new Error(`Módulo ${modulo} no reconocido.`);

    const sheetName = CONFIG.SHEETS[sheetKey]; const sheet = obtenerHoja(sheetName);
    const headers = getModuleHeaders(sheet); const primaryKey = headers[0];
    const allData = sheet.getDataRange().getValues();
    const esActualizacion = (data.ID && String(data.ID).trim() !== "");

    // --- A. NORMALIZACIÓN GLOBAL DE CAMPOS ---
    // Recorremos TODOS los campos que llegaron para limpiarlos
    Object.keys(data).forEach(key => {
        let val = data[key];
        if (typeof val === 'string' && val.trim() !== "") {
            // 1. Emails siempre en minúscula
            if (key.toLowerCase().includes('email') || key.toLowerCase().includes('correo')) {
                data[key] = val.toLowerCase().trim().replace(/\s/g, '');
            }
            // 2. URLs y IDs no se tocan
            else if (key.startsWith('URL') || key.startsWith('Link') || key.startsWith('ID') || key.includes('Cohorte')) {
                data[key] = val.trim();
            }
            // 3. Párrafos largos (Comentarios/Descripción) solo trim, no Capital para no dañar gramática
            else if (['Comentarios', 'Descripcion', 'Resumen', 'Perfil_Externos', 'Impacto_Academico'].includes(key)) {
                data[key] = val.trim();
            }
            // 4. TODO LO DEMÁS (Nombres, Ciudades, Cargos, etc.) -> Inicial Mayúscula
            else {
                data[key] = formatearTextoCapital(val);
            }
        }
    });

    // --- B. VALIDACIONES DE SEGURIDAD ---

    // 1. Cédula Numérica (Excepto Pasaporte)
    if ((sheetKey === 'DOCENTES' || sheetKey === 'ESTUDIANTES') && data.Cedula) {
         if((data.Tipo_Documento === 'CC' || data.Tipo_Documento === 'TI') && !/^\d+$/.test(data.Cedula)) {
             return {success:false, message:"⛔ Cédula debe ser numérica para CC/TI"};
         }
    }

    // 2. DETECCIÓN DE DUPLICADOS (DOCUMENTO Y EMAIL)
    // Definimos qué columnas no pueden repetirse
    const camposUnicos = [];
    if (sheetKey === 'ESTUDIANTES' || sheetKey === 'DOCENTES') {
        camposUnicos.push({col: 'Cedula', msg: 'La Cédula'});
        camposUnicos.push({col: 'Email', msg: 'El Email'});
    } else if (sheetKey === 'EXTERNOS') {
        camposUnicos.push({col: 'Numero_Documento', msg: 'El Documento'});
        camposUnicos.push({col: 'Email', msg: 'El Email'});
    } else if (sheetKey === 'INSTITUCIONES') {
        camposUnicos.push({col: 'Nombre_Institucion', msg: 'La Institución'});
    }

    // Verificación
    if (camposUnicos.length > 0) {
        for (let i = 1; i < allData.length; i++) {
            const idFila = String(allData[i][0]);
            if (esActualizacion && idFila === String(data.ID)) continue; // Saltarse a sí mismo

            for (const campo of camposUnicos) {
                const idx = headers.indexOf(campo.col);
                if (idx !== -1) {
                    const valorEnBD = String(allData[i][idx] || '').trim().toLowerCase();
                    const valorNuevo = String(data[campo.col] || '').trim().toLowerCase();
                    
                    if (valorNuevo && valorEnBD === valorNuevo) {
                        return { success: false, message: `⛔ Error: ${campo.msg} '${data[campo.col]}' ya existe en el sistema.` };
                    }
                }
            }
        }
    }

    data = enriquecerDatosConNombres(sheetKey, data);

    // --- C. GUARDADO ---
    let fila = -1;

    if (esActualizacion) {
        for(let i=1; i<allData.length; i++) { if(String(allData[i][0]).trim()===String(data.ID).trim()) { fila=i+1; break; } }
        if(fila===-1) return {success:false, message:"ID no encontrado para actualizar"};
    } else { 
        data[primaryKey] = generarSiguienteId(sheetName); 
    }

    const rowData = headers.map(h => {
        let val = data[h];
        if (h==='Fecha_Registro' && !esActualizacion) return new Date();
        if (h==='Ultima_Actualizacion') return new Date();
        if (h==='Fecha_Registro' && esActualizacion) return undefined;
        if (val === undefined && esActualizacion) return undefined;
        if (val === undefined) return "";
        if (Array.isArray(val)) return val.join(',');
        return String(val);
    });

    if (esActualizacion) {
        const currentRow = allData[fila-1];
        const finalRow = rowData.map((v, i) => v===undefined ? currentRow[i] : v);
        sheet.getRange(fila, 1, 1, headers.length).setValues([finalRow]);
        return {success:true, message:"✅ Registro actualizado correctamente."};
    } else {
        sheet.appendRow(rowData);
        return {success:true, message:`✅ Creado exitosamente con ID: ${data[primaryKey]}`};
    }
  } catch (e) { Logger.log(e); return {success:false, message:"Error Servidor: "+e.message}; }
}

function generarSiguienteId(sheetName) {
    const cs = getDB().getSheetByName(CONFIG.SHEETS.CONFIG);
    const map = {};
    map[CONFIG.SHEETS.ESTUDIANTES] = ['EST', 'Siguiente_ID_Estudiante'];
    map[CONFIG.SHEETS.DOCENTES] = ['DOC', 'Siguiente_ID_Docente'];
    map[CONFIG.SHEETS.TESIS] = ['TES', 'Siguiente_ID_Tesis'];
    map[CONFIG.SHEETS.EVENTOS] = ['EVT', 'Siguiente_ID_Evento'];
    map[CONFIG.SHEETS.INSTITUCIONES] = ['INS', 'Siguiente_ID_Institucion'];
    map[CONFIG.SHEETS.EXTERNOS] = ['EXT', 'Siguiente_ID_Externo'];

    const conf = map[sheetName];
    if(!conf) return 'GEN-'+Date.now();
    
    // Generación robusta: Buscar el máximo en la hoja real + 1
    const prefix = conf[0];
    const sheet = obtenerHoja(sheetName);
    const data = sheet.getDataRange().getValues();
    let maxId = 0;
    for (let i = 1; i < data.length; i++) {
        const celda = String(data[i][0]);
        if (celda.startsWith(prefix)) {
            const num = parseInt(celda.replace(prefix, ''), 10);
            if (!isNaN(num) && num > maxId) maxId = num;
        }
    }
    return prefix + String(maxId + 1).padStart(4, '0');
}

function actualizarMasivo(modulo, listaIds, datosAActualizar) {
  try {
     const mu = String(modulo).toUpperCase();
     let sheetKey;
     if (mu.startsWith('ESTUDIANTE')) sheetKey='ESTUDIANTES';
     else if (mu.startsWith('DOCENTE')) sheetKey='DOCENTES';
     else if (mu.startsWith('TESIS')) sheetKey='TESIS';
     else if (mu.startsWith('EVENTO')) sheetKey='EVENTOS';
     else if (mu.startsWith('INSTITUCION')) sheetKey='INSTITUCIONES';
     else if (mu.startsWith('EXTERNO')) sheetKey='EXTERNOS';
     
     const sheetName = CONFIG.SHEETS[sheetKey];
     const sheet = obtenerHoja(sheetName);
     const headers = getModuleHeaders(sheet);
     const data = sheet.getDataRange().getValues();
     
     const idsSet = new Set(listaIds.map(String));
     let actualizados = 0;

     for (let i = 1; i < data.length; i++) {
        const idFila = String(data[i][0]).trim();
        if (idsSet.has(idFila)) {
           let huboCambio = false;
           for (const [key, valor] of Object.entries(datosAActualizar)) {
              const colIndex = headers.indexOf(key);
              if (colIndex !== -1 && valor !== undefined && valor !== null) {
                 // Aplicar normalización también aquí
                 let valFinal = valor;
                 if (typeof valor === 'string') {
                     if(key.toLowerCase().includes('email')) valFinal = valor.toLowerCase().trim();
                     else if(!key.includes('Cohorte')) valFinal = formatearTextoCapital(valor);
                 }
                 
                 sheet.getRange(i + 1, colIndex + 1).setValue(valFinal);
                 huboCambio = true;
              }
           }
           if(huboCambio) {
               const idxUpdate = headers.indexOf('Ultima_Actualizacion');
               if(idxUpdate !== -1) sheet.getRange(i + 1, idxUpdate + 1).setValue(new Date());
               actualizados++;
           }
        }
     }
     return { success: true, message: `✅ Se actualizaron ${actualizados} registros.` };
  } catch (e) {
     return { success: false, message: "Error masivo: " + e.message };
  }
}

function eliminarMasivo(mod, ids) {
    try {
        const mu = String(mod).toUpperCase();
        let sheetKey; 
        if (mu.startsWith('ESTUDIANTE')) sheetKey='ESTUDIANTES'; else if (mu.startsWith('DOCENTE')) sheetKey='DOCENTES';
        else if (mu.startsWith('TESIS')) sheetKey='TESIS'; else if (mu.startsWith('EVENTO')) sheetKey='EVENTOS';
        else if (mu.startsWith('INSTITUCION')) sheetKey='INSTITUCIONES'; else if (mu.startsWith('EXTERNO')) sheetKey='EXTERNOS';
        
        const s = obtenerHoja(CONFIG.SHEETS[sheetKey]);
        const d = s.getDataRange().getValues();
        let count = 0;
        for(let i=d.length-1; i>=1; i--) { if(ids.includes(String(d[i][0]))) { s.deleteRow(i+1); count++; } }
        return {success:true, message:`${count} registros eliminados.`};
    } catch(e) { return {success:false, message:e.message}; }
}