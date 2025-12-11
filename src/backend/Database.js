function obtenerDatosHoja(n) {
  const s = obtenerHoja(n); const d = s.getDataRange().getValues(); if(d.length<=1) return [];
  const h = d[0].map(x=>String(x).trim());
  return d.slice(1).map(r => {
    const o={}; h.forEach((k,i)=>{ let v=r[i]; if(v instanceof Date) v=Utilities.formatDate(v,Session.getScriptTimeZone(),"yyyy-MM-dd"); o[k]=(v===undefined?"":v); }); return o;
  }).filter(o=>o[h[0]] && String(o[h[0]]).trim()!=="");
}

function obtenerDatosIniciales() {
  return { success:true, data: {
      estudiantes: obtenerDatosHoja(CONFIG.SHEETS.ESTUDIANTES), docentes: obtenerDatosHoja(CONFIG.SHEETS.DOCENTES),
      tesis: obtenerDatosHoja(CONFIG.SHEETS.TESIS), eventos: obtenerDatosHoja(CONFIG.SHEETS.EVENTOS),
      instituciones: obtenerDatosHoja(CONFIG.SHEETS.INSTITUCIONES), externos: obtenerDatosHoja(CONFIG.SHEETS.EXTERNOS)
  }};
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

function guardarDatos(modulo, data) {
  try {
    let sheetKey; const mu = String(modulo).toUpperCase();
    if (mu.startsWith('ESTUDIANTE')) sheetKey = 'ESTUDIANTES'; else if (mu.startsWith('DOCENTE')) sheetKey = 'DOCENTES';
    else if (mu.startsWith('TESIS')) sheetKey = 'TESIS'; else if (mu.startsWith('EVENTO')) sheetKey = 'EVENTOS';
    else if (mu.startsWith('INSTITUCION')) sheetKey = 'INSTITUCIONES'; else if (mu.startsWith('EXTERNO')) sheetKey = 'EXTERNOS';
    
    const sheetName = CONFIG.SHEETS[sheetKey]; const sheet = obtenerHoja(sheetName);
    const headers = getModuleHeaders(sheet); const primaryKey = headers[0];

    if ((sheetKey === 'DOCENTES' || sheetKey === 'ESTUDIANTES') && data.Cedula && !/^\d+$/.test(data.Cedula)) return {success:false, message:"Cédula inválida"};
    
    ['Nombre1','Nombre2','Apellido1','Apellido2'].forEach(k=>{ if(data[k]) data[k]=formatearNombrePropio(data[k]); });
    ['Nombre_Evento','Titulo_Investigacion','Organizacion','Cargo_Perfil'].forEach(k=>{ if(data[k]) data[k]=formatearTextoGeneral(data[k]); });
    if(data.Email) data.Email = formatearEmail(data.Email);

    data = enriquecerDatosConNombres(sheetKey, data);

    const allData = sheet.getDataRange().getValues();
    const esUpdate = (data.ID && String(data.ID).trim()!=="");
    let fila = -1;

    if (esUpdate) {
        for(let i=1; i<allData.length; i++) { if(String(allData[i][0])===String(data.ID)) { fila=i+1; break; } }
        if(fila===-1) return {success:false, message:"ID no encontrado"};
    } else { data[primaryKey] = generarSiguienteId(sheetName); }

    const rowData = headers.map(h => {
        let val = data[h];
        if (h==='Fecha_Registro' && !esUpdate) return new Date();
        if (h==='Ultima_Actualizacion') return new Date();
        if (h==='Fecha_Registro' && esUpdate) return undefined;
        if (val === undefined && esUpdate) return undefined;
        if (val === undefined) return "";
        if (Array.isArray(val)) return val.join(',');
        return String(val);
    });

    if (esUpdate) {
        const currentRow = allData[fila-1];
        const finalRow = rowData.map((v, i) => v===undefined ? currentRow[i] : v);
        sheet.getRange(fila, 1, 1, headers.length).setValues([finalRow]);
        return {success:true, message:"Actualizado"};
    } else {
        sheet.appendRow(rowData);
        return {success:true, message:`Creado con ID: ${data[primaryKey]}`};
    }
  } catch (e) { Logger.log(e); return {success:false, message:e.message}; }
}

function generarSiguienteId(sheetName) {
    const cs = getDB().getSheetByName(CONFIG.SHEETS.CONFIG); // Usar getDB()
    const map = {};
    map[CONFIG.SHEETS.ESTUDIANTES] = ['EST', 'Siguiente_ID_Estudiante'];
    map[CONFIG.SHEETS.DOCENTES] = ['DOC', 'Siguiente_ID_Docente'];
    map[CONFIG.SHEETS.TESIS] = ['TES', 'Siguiente_ID_Tesis'];
    map[CONFIG.SHEETS.EVENTOS] = ['EVT', 'Siguiente_ID_Evento'];
    map[CONFIG.SHEETS.INSTITUCIONES] = ['INS', 'Siguiente_ID_Institucion'];
    map[CONFIG.SHEETS.EXTERNOS] = ['EXT', 'Siguiente_ID_Externo'];

    const conf = map[sheetName];
    if(!conf) return 'GEN-'+Date.now();
    
    const d = cs.getDataRange().getValues();
    let r = -1, n = 1;
    for(let i=1; i<d.length; i++) { if(d[i][0]===conf[1]) { r=i+1; n=parseInt(d[i][1]); break; } }
    
    if(r!==-1) { cs.getRange(r,2).setValue(n+1); return conf[0] + String(n).padStart(4,'0'); }
    return conf[0]+'0001';
}

function actualizarMasivo(mod, ids, data) { return guardarDatos(mod, {ID: ids[0], ...data}); }
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
        // Eliminar de abajo hacia arriba
        for(let i=d.length-1; i>=1; i--) { if(ids.includes(String(d[i][0]))) { s.deleteRow(i+1); count++; } }
        return {success:true, message:`${count} eliminados`};
    } catch(e) { return {success:false, message:e.message}; }
}