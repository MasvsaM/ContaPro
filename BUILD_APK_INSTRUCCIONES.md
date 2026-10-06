# Instrucciones para generar APK (ContaPro)

El entorno actual no tiene Java ni Android SDK instalados. Aquí tienes los pasos para compilar el APK cuando tengas las herramientas.

## 1. Instalar JDK 17 (obligatorio)

Descargar Temurin JDK 17 LTS (gratis):
https://adoptium.net/es/temurin/releases/?version=17&os=windows&arch=x64

Instalar el `.msi`. Ruta típica:
```
C:\Program Files\Eclipse Adoptium\jdk-17.x.x
```

## 2. Instalar Android SDK

Recomendado: Android Studio
https://developer.android.com/studio

SDK por defecto:
```
%USERPROFILE%\AppData\Local\Android\Sdk
```

## 3. Configurar variables de entorno (PowerShell)

Abrir PowerShell como usuario y ajustar la versión exacta si cambia:

```powershell
# Java
$jdk = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;" + $env:Path

# Android SDK
$sdk = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:Path = "$sdk\platform-tools;$sdk\cmdline-tools\latest\bin;$sdk\build-tools\latest;" + $env:Path
```

Para hacerlas permanentes: Panel de Control > Sistema > Variables de entorno.

## 4. Verificar

```powershell
java -version
javac -version
```

Debe mostrar JDK 17.

## 5. Compilar APK

Desde la raíz del proyecto:

```powershell
cd "C:\Users\Reina\OneDrive\Documents\OpenCode\Proyectos\ContaPro_App_Movil_PWA"
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

## 6. APK generado

```
android\app\build\outputs\apk\debug\app-debug.apk
```

Copiar al móvil e instalar (permitir origen desconocido).

## Notas

- Proyecto web: `dist/` listo (PWA)
- Android ya sincronizado (`android/` existe con plataforma añadida)
- Package ID: `com.contapro.app`
- App name: `ContaPro`
