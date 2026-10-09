# Presupuestos Técnicos

Generador de presupuestos técnicos para armado y venta de computadores. Es una página HTML: rellenas los datos en el panel izquierdo, ves la hoja A4 en vivo a la derecha y la imprimes o guardas como PDF.

## Cómo usarlo

1. Abre `index.html` en Chrome, Edge o Firefox (doble clic basta; no necesita servidor ni instalación).
2. Completa **Tu empresa**: sube tu logo (arrastrar o clic), ajusta su tamaño y elige el color de marca.
   Estos datos se recuerdan para todos los presupuestos siguientes.
3. Completa **Cliente**, **Datos del presupuesto** y agrega componentes con los botones de *Agregar rápido*.
4. Pulsa **Imprimir / PDF** y elige *Guardar como PDF* como destino.
   En la ventana de impresión, desactiva "Encabezados y pies de página" para un resultado limpio.

## Qué incluye el presupuesto

- Logo y datos de la empresa (razón social, RUT, giro, dirección, contacto, web)
- Datos del cliente (razón social, RUT, contacto, email, teléfono, dirección)
- N° correlativo `COT-AAAA-0001`, fecha de emisión y fecha de validez calculada
- Proyecto / referencia del equipo
- Detalle por línea: categoría, marca y modelo, especificaciones, garantía, cantidad, precio unitario y descuento
- Ficha técnica del equipo generada automáticamente a partir de los componentes
- Subtotal, descuento global, IVA configurable (19 % por defecto) y total
- Total en palabras ("Son: … pesos.")
- Moneda CLP, USD o UF
- Condiciones comerciales, forma de pago, plazo de entrega y garantía
- Datos para transferencia bancaria
- Bloque de firma y aceptación del cliente

## Guardar y respaldar

- El borrador se guarda solo en el navegador (`localStorage`).
- **Guardar** archiva el presupuesto actual; **Mis presupuestos** permite abrir, duplicar o eliminar.
- **Exportar** descarga un `.json` con el presupuesto y el archivo completo; **Importar** lo restaura en otro equipo.

> Los datos viven en el navegador donde se crearon. Exporta un respaldo de vez en cuando.

## Publicarlo en línea (opcional)

Activa GitHub Pages en *Settings → Pages* apuntando a la rama con estos archivos y tendrás la herramienta en una URL propia.

## Archivos

| Archivo      | Contenido                                 |
|--------------|-------------------------------------------|
| `index.html` | Estructura del editor y la hoja           |
| `styles.css` | Diseño de pantalla e impresión A4         |
| `app.js`     | Estado, cálculos, render y almacenamiento |
