# Plan de Acción - Actualizaciones Pendientes

## 🔴 URGENTE: Actualización de Seguridad

### Fecha: 27 de Febrero de 2026
### Estado: PENDIENTE DE APLICACIÓN

---

## 1. Actualizar fast-xml-parser

### Problema Actual:
```
Vulnerabilidades Críticas en fast-xml-parser v4.5.0:
- DoS through entity expansion in DOCTYPE
- Entity encoding bypass via regex injection  
- Stack overflow in XMLBuilder
```

### Solución:
```bash
cd scaffold/backend
npm install fast-xml-parser@latest
npm audit fix --force
```

### Archivos a Verificar Después:
- `src/backend/verifactu/validator.ts`
- `src/backend/aeat/validator.ts`
- Tests relacionados con parsing XML

### Cambios Potenciales en API:
La versión 5.x de fast-xml-parser puede tener cambios en la API. Revisar:
- Opciones de configuración del XMLParser
- Formato de resultado del parsing
- Métodos de validación

---

## 2. Actualizar Otras Dependencias

### Comando:
```bash
cd scaffold/backend
npm update
npm audit fix
```

### Verificar:
```bash
npm audit
npm test
npm run build
```

---

## 3. Actualizar Documentación de Seguridad

### Archivos a Actualizar:
- `SECURITY.md` - Actualizar versión de fast-xml-parser
- `ESTADO_PROYECTO.md` - Marcar vulnerabilidades como resueltas
- `README.md` - Actualizar versiones de dependencias

---

## 4. Testing Completo

### Verificar:
- [ ] Build exitoso (`npm run build`)
- [ ] Tests pasan (`npm test`)  
- [ ] API funciona correctamente
- [ ] Generación de XML sigue funcionando
- [ ] Parsing de respuestas funciona
- [ ] Hash calculation no se ve afectado

---

## 5. Commit y Documentación

### Crear Commit:
```bash
git add .
git commit -m "Security: Update fast-xml-parser to v5.4.1+ to fix critical vulnerabilities"
git push
```

### Actualizar:
- Changelog
- Notas de versión
- Documentación de deployment

---

## Tiempo Estimado: 30-60 minutos

## Prioridad: 🔴 CRÍTICA

## Responsable: Equipo de Desarrollo

---

## Notas Adicionales

### Si hay Problemas con la Actualización:

1. **Guardar trabajo actual**:
   ```bash
   git stash
   ```

2. **Probar en rama separada**:
   ```bash
   git checkout -b update-dependencies
   ```

3. **Si falla, considerar alternativas**:
   - Mantenerse en v4.5.0 y añadir controles de seguridad
   - Buscar parser alternativo
   - Implementar validación XSD con herramienta externa

### Recursos:
- fast-xml-parser docs: https://github.com/NaturalIntelligence/fast-xml-parser
- Migration guide v4 to v5: Ver repositorio GitHub
- Security advisories: GitHub Security tab

---

**IMPORTANTE**: No posponer esta actualización. Las vulnerabilidades son críticas.
