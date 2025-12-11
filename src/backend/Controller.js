function doGet() {
  try {
    // Intenta cargar el archivo principal
    return HtmlService.createTemplateFromFile('src/frontend/index') // <--- OJO AQUÍ
        .evaluate()
        .setTitle('Sistema MCS')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (e) {
    // Si falla el index principal, muestra esto
    return ContentService.createTextOutput("CRITICAL ERROR: No se encuentra 'src/frontend/index'. Revisa el nombre del archivo principal.");
  }
}

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    // SI FALLA UN ARCHIVO INTERNO, IMPRIME EL ERROR EN ROJO EN LA PANTALLA
    return `<div style="background-color:#ffe6e6; border: 2px solid red; color: red; padding: 20px; margin: 20px; font-family: sans-serif; font-weight: bold; z-index:99999; position:relative;">
              ❌ ERROR DE CARGA:<br>
              No se pudo encontrar el archivo: "<strong>${filename}</strong>"<br><br>
              <em>Verifica que el nombre en tu código coincida exactamente con el nombre del archivo en el editor online de Apps Script.</em>
            </div>`;
  }
}