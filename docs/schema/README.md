# Esquemas AEAT

Este directorio contiene esquemas XSD y ejemplos relacionados con el servicio de consulta de declaraciones presentadas de la Agencia Tributaria (AEAT).

Ficheros incluidos:
- Esquema: EsquemaConsultaDeclaraciones.xsd (origin: AEAT)
- Fixtures de ejemplo: tests/fixtures/aeat_response_valid.xml, tests/fixtures/aeat_response_error.xml

Notas:
- El XSD fue incorporado al repositorio para validación y referencia. Confirma si los XML de producción incluyen namespaces o prefijos; si es así actualizaremos el validador/fixtures.
- El validador TypeScript usa libxmljs2 para parseo y validación (documentado en src/backend/aeat/validator.ts). Añadir la dependencia en el proyecto si se va a ejecutar: `npm install libxmljs2`.
