function formatearNombrePropio(t) { return !t ? "" : String(t).toLowerCase().replace(/(?:^|\s|['"({])+\S/g, m => m.toUpperCase()); }
function formatearEmail(e) { return !e ? "" : String(e).trim().toLowerCase(); }
function formatearTextoGeneral(t) { if(!t) return ""; let s=String(t).trim(); return s.charAt(0).toUpperCase()+s.slice(1); }

// Helper para obtener una hoja específica usando el ID configurado
function obtenerHoja(n) { 
  const ss = getDB(); 
  const s = ss.getSheetByName(n); 
  if(!s) throw new Error(`Hoja ${n} no existe.`); 
  return s; 
}

function getModuleHeaders(s) { 
  const lc = s.getLastColumn(); 
  if(lc===0) return []; 
  return s.getRange(1,1,1,lc).getValues()[0].map(h=>String(h).trim()).filter(h=>h.length>0); 
}