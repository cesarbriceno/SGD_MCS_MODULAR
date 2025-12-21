# Documentación del Sistema de Gestión MCS

Este documento proporciona una visión general de la arquitectura, los componentes y la lógica del Sistema de Gestión MCS, diseñado para funcionar sobre Google Apps Script y Google Sheets.

## Arquitectura del Proyecto

El proyecto sigue una estructura modular separando la lógica del backend (Google Apps Script) de la interfaz de usuario (HTML/JS/CSS).

### Proyecto: SGD-MCS-MODULAR
- **Tecnologías Core**: Google Apps Script, JavaScript (Frontend), HTML5, CSS3.
- **UI Libraries**: Bootstrap 5.3, Font Awesome 6.4.0, SweetAlert2.
- **Utilidades**: XLSX (SheetJS), jsPDF, jspdf-autotable.
- **Persistencia**: Google Sheets (interactuado vía `SpreadsheetApp`).

## Estructura de Archivos

### Backend (`src/backend/`)
- `Config.js`: Definición de constantes globales (ID de Spreadsheet, nombres de hojas, colores) y helper de conexión.
- `Controller.js`: Maneja el punto de entrada de la web app (`doGet`) y la inclusión de archivos HTML.
- `Database.js`: Operaciones CRUD (Crear, Leer, Actualizar, Borrar) y lógica de negocio para la persistencia.
- `Setup.js`: Inicialización de la base de datos (creación de hojas y configuración inicial).
- `Utils.js`: Funciones de utilidad para formateo, extracción de cabeceras y manejo de hojas.

### Frontend (`src/frontend/`)
- `index.html`: Punto de entrada de la UI y disparador de carga inicial de datos.
- `css/styles.html`: Estilos globales y tokens de diseño.
- `components/`:
  - `actions.html`: Barras de acción flotantes.
  - `modals.html`: Formularios modales para gestión de datos.
  - `nav.html`: Sistema de navegación por pestañas.
  - `tables.html`: Estructura de las tablas de datos.
- `js/`:
  - `utils.html`: Utilidades de validación, manejo de UI y comunicación con el backend.
  - `render.html`: Lógica de renderizado dinámico de tablas y vistas de detalle.
  - `forms.html`: Manejo de envíos de formularios, ediciones masivas y borrados.
  - `export.html`: Lógica de exportación a formatos Excel y PDF.

## Flujos de Trabajo Clave

### Carga de Datos
```mermaid
graph TD
    A[Inicio: index.html] --> B[cargarTodosLosDatos()]
    B --> C[Llamado a google.script.run]
    C --> D[Backend: obtenerDatosIniciales()]
    D --> E[Agregación de datos de todas las hojas]
    E --> F[Retorno a Frontend]
    F --> G[Población de datosGlobales]
    G --> H[renderizarTablaActual()]
```

### Gestión de Registros (Guardado)
```mermaid
graph TD
    A[Submit Formulario] --> B[validarFormulario()]
    B -- OK --> C[guardar[Modulo]()]
    C --> D[procesar(id, modulo, data)]
    D --> E[Backend: guardarDatos()]
    E --> F[Normalización y Persistencia en Sheet]
    F --> G[Retorno OK]
    G --> H[Callback: Notificación y Recarga]
```

## Guía de Desarrollo

- **Nomenclatura**: Las funciones siguen `camelCase`. Las claves de datos en Sheets usan `Snake_Case`.
- **Validación**: Implementada tanto en el frontend (visual) como en el backend (integridad).
- **Extensibilidad**: Para añadir un nuevo módulo, se debe definir en `Config.js` (Hojas) y crear el renderizador correspondiente en `render.html`.

---
*Documentación generada automáticamente el 2025-12-21*
