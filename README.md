# ContaPro — Presupuestos, Facturas y Ventas

Aplicación empresarial para pequeñas empresas y profesionales. Funciona como PWA con almacenamiento local (IndexedDB/SQLite vía Dexie) y completamente offline.

## Tecnologías utilizadas

- React + TypeScript
- Vite
- Dexie.js (IndexedDB)
- jsPDF + html2canvas
- Capacitor (Android)
- Vitest

## Funcionalidades implementadas

- Dashboard con métricas y resumen
- Clientes: CRUD, búsqueda, archivado, detalle con historial
- Presupuestos: numeración automática P-XXXX, líneas, descuentos, IVA, estados
- Conversión de presupuesto aceptado a factura
- Facturas: numeración automática F-XXXX, estados, registro de pagos
- Cálculos automáticos (neto, IVA 19%, totales) con redondeo consistente
- Generación de PDF profesional (A4) con datos de empresa
- Compartir PDF (Android Share Sheet) y enlaces para WhatsApp/correo
- Reportes con filtros (hoy/semana/mes/mes anterior/todo)
- Configuración de empresa (logo, datos, texto legal)
- Copia de seguridad y restauración JSON
- Modo claro/oscuro/sistema
- Funcionamiento 100% offline

## Requisitos

### Para desarrollo web
- Node.js 18+ (v24 probado)
- npm

### Para compilar APK Android
- JDK 17 (recomendado)
- Android SDK / Android Studio
- Variables: `JAVA_HOME`, `ANDROID_HOME`/`ANDROID_SDK_ROOT`

> Nota: En el entorno actual no se detectaron Java/Android SDK, por lo que el APK no fue generado.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrir http://localhost:5173

## Build web

```bash
npm run build
npm run preview
```

## Tests

```bash
npm run test
npm run typecheck
```

Resultado: 6 tests pasando.

## Ejecutar en Android (Capacitor)

```bash
npm run build
npx cap sync android
npx cap open android
```

En Android Studio: Build > Build Bundle(s)/APK(s) > Build APK(s). APK generado en `android/app/build/outputs/apk/`.

## Generar APK (línea de comandos)

Requiere Android SDK + Java configurados:

```bash
cd android
./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

Release (opcional):

```bash
cd android
./gradlew assembleRelease
```

## Instalación APK en Android

1. Transferir `app-debug.apk` al dispositivo
2. Permitir "Instalar apps de origen desconocido"
3. Instalar y abrir ContaPro

## Estructura del proyecto

```
src/
  App.tsx
  main.tsx
  components/
  screens/ (Dashboard, Clientes, Presupuestos, Facturas, Reportes, Mas)
  navigation/
  database/ (db.ts - Dexie)
  services/ (clientes, presupuestos, facturas)
  models/
  utils/ (calc.ts)
  pdf/ (pdf.ts)
  sharing/ (share.ts)
  reports/ (reports.ts)
  settings/
  types/ (index.ts)
  styles/ (index.css)
  tests/
android/ (proyecto Capacitor)
dist/ (build web)
icons/ (iconos)
```

## Backup/Restore

- Exportar: Más > Copia de seguridad > Exportar JSON
- Importar: Más > Copia de seguridad > Importar JSON (reemplaza datos)

## Importante (Chile/SII)

Los documentos PDF son comerciales. No reemplazan factura electrónica tributaria del SII. El proyecto está preparado para futura integración DTE/SII sin romper arquitectura.

## Solución de problemas

- **Java no encontrado**: Instalar JDK 17 (Adoptium/Temurin) y configurar `JAVA_HOME`
- **Android SDK no encontrado**: Instalar Android Studio o Command Line Tools; configurar `ANDROID_HOME`
- **Build falla**: `npm run typecheck` y `npm run test` para diagnosticar

## Versión

v1.0.0

## Licencia

Uso interno (para uso de papá). Listo para desplegar en Netlify como PWA estática.
