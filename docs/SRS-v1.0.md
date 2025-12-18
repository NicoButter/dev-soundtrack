# Dev Soundtrack - Especificación de Requerimientos de Software (SRS)
## Versión 1.0

---

### Información del Documento

| Campo | Valor |
|-------|-------|
| **Proyecto** | Dev Soundtrack - VS Code Extension |
| **Versión del Documento** | 1.0 |
| **Fecha** | 18 de diciembre de 2025 |
| **Estado** | Aprobado |
| **Autores** | Equipo Dev Soundtrack |

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requerimientos funcionales y no funcionales para la extensión Dev Soundtrack de Visual Studio Code. El objetivo es proporcionar música de fondo y efectos de sonido durante sesiones de programación para mejorar la experiencia del desarrollador.

### 1.2 Alcance
Dev Soundtrack es una extensión de Visual Studio Code que:
- Reproduce música de fondo generada proceduralmente basada en diferentes "moods"
- Dispara efectos de sonido en respuesta a acciones del desarrollador
- Proporciona controles de reproducción y volumen
- Es altamente configurable a través de la configuración de VS Code

### 1.3 Definiciones, Acrónimos y Abreviaciones

| Término | Definición |
|---------|-----------|
| **VS Code** | Visual Studio Code - Editor de código de Microsoft |
| **Webview** | Panel embebido en VS Code que renderiza HTML/CSS/JS |
| **Mood** | Género o estilo musical (Epic, Lo-Fi, etc.) |
| **SFX** | Sound Effects - Efectos de sonido |
| **Web Audio API** | API del navegador para generar y manipular audio |

### 1.4 Referencias
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
Dev Soundtrack es una extensión standalone para VS Code que no depende de servicios externos. Utiliza Web Audio API para generar audio directamente en el navegador sin necesidad de archivos de audio externos en la versión inicial.

### 2.2 Funciones del Producto

#### Función Principal 1: Reproducción de Música de Fondo
- Generación procedural de música basada en escalas y tempos
- 6 moods diferentes: Epic, Lo-Fi, Synthwave, 8-Bit, Ambient, Metal
- Control de reproducción (play, pause, stop, next, previous)
- Sistema de "tracks" simulados

#### Función Principal 2: Efectos de Sonido Contextuales
- Sonidos automáticos en eventos de desarrollo:
  - Guardar archivo (Ctrl+S)
  - Build exitoso/fallido
  - Git commit
  - Abrir archivo (opcional)
  - Undo (opcional)

#### Función Principal 3: Panel de Control
- Interfaz visual en Webview
- Selector de mood
- Controles de volumen independientes
- Botones para efectos manuales
- Display de información de track

### 2.3 Características de Usuarios
**Desarrolladores de Software** que:
- Trabajan largas sesiones de código
- Disfrutan de música mientras programan
- Quieren feedback auditivo de sus acciones
- Buscan personalizar su entorno de desarrollo

### 2.4 Restricciones
- Debe ejecutarse dentro del entorno de VS Code
- No puede usar APIs nativas del sistema operativo directamente
- Limitado a las capacidades de Web Audio API
- Debe ser compatible con VS Code 1.85.0+

### 2.5 Suposiciones y Dependencias
- El usuario tiene VS Code instalado (versión 1.85.0 o superior)
- El sistema tiene capacidad de reproducción de audio
- Node.js disponible para desarrollo
- TypeScript 5.3+ para compilación

---

## 3. Requerimientos Específicos

### 3.1 Requerimientos Funcionales

#### RF-001: Reproducción de Música
**Prioridad:** Alta  
**Descripción:** El sistema debe reproducir música de fondo generada proceduralmente.

**Criterios de Aceptación:**
- La música debe generarse usando Web Audio API
- Debe haber al menos 5 moods diferentes
- La música debe ser continua sin cortes audibles
- Debe respetar el volumen configurado (0-100)

#### RF-002: Sistema de Moods
**Prioridad:** Alta  
**Descripción:** El sistema debe soportar diferentes estilos musicales.

**Moods requeridos:**
1. Epic - Frecuencia base 220Hz, tempo 120 BPM
2. Lo-Fi - Frecuencia base 330Hz, tempo 80 BPM
3. Synthwave - Frecuencia base 440Hz, tempo 100 BPM
4. 8-Bit - Frecuencia base 262Hz, tempo 140 BPM
5. Ambient - Frecuencia base 220Hz, tempo 60 BPM
6. Metal - Frecuencia base 110Hz, tempo 160 BPM

#### RF-003: Efectos de Sonido en Save
**Prioridad:** Alta  
**Descripción:** Al guardar un archivo (Ctrl+S), debe reproducirse un sonido.

**Criterios de Aceptación:**
- Detecta evento `onDidSaveTextDocument`
- Reproduce efecto "save" (checkpoint sound)
- Duración: < 1 segundo
- Configurable vía `devSoundtrack.soundEffects.onSave`

#### RF-004: Efectos en Build
**Prioridad:** Media  
**Descripción:** Reproducir sonidos según resultado de build.

**Criterios de Aceptación:**
- Detecta `onDidEndTaskProcess`
- Build exitoso (exit code 0) → fanfare
- Build fallido (exit code ≠ 0) → error sound
- Configurable vía settings

#### RF-005: Panel de Control
**Prioridad:** Alta  
**Descripción:** Interfaz gráfica para controlar la reproducción.

**Criterios de Aceptación:**
- Webview panel accesible vía comando
- Botones: Play, Pause, Stop, Next, Previous, Mute
- Sliders de volumen para música y efectos
- Selector de mood (grid de 6 opciones)
- Grid de efectos manuales (6 efectos)

#### RF-006: Comandos de VS Code
**Prioridad:** Alta  
**Descripción:** Comandos registrados en la paleta de comandos.

**Comandos requeridos:**
- `devSoundtrack.openPanel` - Abrir panel
- `devSoundtrack.play` - Reproducir música
- `devSoundtrack.pause` - Pausar música
- `devSoundtrack.stop` - Detener música
- `devSoundtrack.toggleMute` - Mutear/Desmutear
- `devSoundtrack.setMood` - Cambiar mood
- `devSoundtrack.nextTrack` - Siguiente track
- `devSoundtrack.previousTrack` - Track anterior

#### RF-007: Configuración
**Prioridad:** Alta  
**Descripción:** Settings persistentes en VS Code.

**Settings requeridas:**
```json
{
  "devSoundtrack.enabled": boolean (default: true),
  "devSoundtrack.musicVolume": number 0-100 (default: 50),
  "devSoundtrack.effectsVolume": number 0-100 (default: 70),
  "devSoundtrack.currentMood": string (default: "epic"),
  "devSoundtrack.playOnStartup": boolean (default: false),
  "devSoundtrack.soundEffects.onSave": boolean (default: true),
  "devSoundtrack.soundEffects.onBuildSuccess": boolean (default: true),
  "devSoundtrack.soundEffects.onBuildError": boolean (default: true),
  "devSoundtrack.soundEffects.onGitCommit": boolean (default: true),
  "devSoundtrack.soundEffects.onUndo": boolean (default: false),
  "devSoundtrack.soundEffects.onFileOpen": boolean (default: false),
  "devSoundtrack.customSoundsPath": string (default: "")
}
```

#### RF-008: Atajos de Teclado
**Prioridad:** Media  
**Descripción:** Shortcuts para acciones comunes.

**Keybindings:**
- `Ctrl+Alt+M` (Cmd+Alt+M en Mac) - Abrir panel
- `Ctrl+Alt+P` - Play/Pause
- `Ctrl+Alt+0` - Mute/Unmute
- `Ctrl+Alt+→` - Next track
- `Ctrl+Alt+←` - Previous track

#### RF-009: Detección de Git Commit
**Prioridad:** Baja  
**Descripción:** Reproducir sonido al hacer commit.

**Criterios de Aceptación:**
- Integración con extensión Git de VS Code
- Detecta cambios en HEAD commit
- Reproduce efecto "achievement"
- Configurable

#### RF-010: Efectos de Sonido Disponibles
**Prioridad:** Alta  
**Descripción:** Biblioteca de efectos de sonido.

**Efectos requeridos:**
1. **drumroll** - Redoble de tambores
2. **fanfare** - Fanfarria de victoria
3. **powerup** - Sonido de power-up
4. **achievement** - Logro desbloqueado
5. **explosion** - Explosión
6. **magic** - Efecto mágico
7. **save** - Checkpoint guardado
8. **error** - Sonido de error
9. **success** - Sonido de éxito
10. **undo** - Retroceso
11. **commit** - Git commit
12. **open** - Abrir archivo

---

### 3.2 Requerimientos No Funcionales

#### RNF-001: Rendimiento
- La extensión no debe aumentar el tiempo de inicio de VS Code en más de 500ms
- La reproducción de audio debe tener latencia < 50ms
- El uso de memoria no debe exceder 50MB en estado activo
- CPU usage < 5% durante reproducción normal

#### RNF-002: Usabilidad
- La interfaz debe seguir las guías de diseño de VS Code
- Los controles deben ser intuitivos sin necesidad de documentación
- Los efectos de sonido no deben ser molestos (duración < 2 segundos)
- Debe haber manera rápida de silenciar (1 tecla)

#### RNF-003: Compatibilidad
- Compatible con VS Code 1.85.0 y superiores
- Funciona en Windows, macOS y Linux
- Compatible con temas claros y oscuros de VS Code
- No conflictúa con otras extensiones de audio

#### RNF-004: Confiabilidad
- La extensión no debe crashear VS Code
- Los errores de audio deben manejarse gracefully
- Si Web Audio API no está disponible, debe fallar silenciosamente
- Los settings deben persistir correctamente

#### RNF-005: Mantenibilidad
- Código TypeScript con tipos estrictos
- Arquitectura modular (separación de concerns)
- Comentarios en funciones complejas
- Tests unitarios para funcionalidad crítica

#### RNF-006: Seguridad
- No debe ejecutar código arbitrario
- CSP (Content Security Policy) estricto en webviews
- No debe acceder a archivos fuera del workspace sin permiso
- No envía datos a servidores externos

#### RNF-007: Documentación
- README completo con instalación y uso
- CHANGELOG con historial de versiones
- Comentarios JSDoc en funciones públicas
- Ejemplos de configuración

---

## 4. Arquitectura del Sistema

### 4.1 Componentes Principales

```
┌─────────────────────────────────────────┐
│         VS Code Extension Host          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      extension.ts                │  │
│  │  - Activation                    │  │
│  │  - Command Registration          │  │
│  │  - Lifecycle Management          │  │
│  └──────────────────────────────────┘  │
│               │                         │
│      ┌────────┴─────────┐              │
│      ▼                  ▼              │
│  ┌────────────┐  ┌──────────────────┐  │
│  │  Command   │  │  Sound Effects   │  │
│  │Interceptor │  │    Manager       │  │
│  │            │  │                  │  │
│  │ - onSave   │  │ - playEffect()   │  │
│  │ - onBuild  │  │ - webview setup  │  │
│  │ - onCommit │  │ - Web Audio API  │  │
│  └────────────┘  └──────────────────┘  │
│                         │               │
│                         ▼               │
│                  ┌─────────────┐        │
│                  │ AudioPanel  │        │
│                  │             │        │
│                  │ - Webview   │        │
│                  │ - Controls  │        │
│                  │ - Music Gen │        │
│                  └─────────────┘        │
└─────────────────────────────────────────┘
```

### 4.2 Flujo de Datos

1. **Inicio:**
   - VS Code activa la extensión
   - Se registran comandos y event listeners
   - Se cargan configuraciones

2. **Usuario abre panel:**
   - Comando → AudioPanel.createOrShow()
   - Se crea Webview con HTML
   - Se inicializa estado desde settings

3. **Usuario presiona Play:**
   - Webview envía mensaje a extension
   - Extension actualiza contexto
   - Webview inicia generación de audio

4. **Usuario guarda archivo:**
   - CommandInterceptor detecta evento
   - Verifica configuración
   - SoundEffectsManager reproduce efecto

---

## 5. Especificación de Interfaces

### 5.1 Interfaz de Usuario

#### Panel Principal (Webview)
- **Dimensiones:** Flexible, min 400x600px
- **Secciones:**
  1. Header con título y descripción
  2. Player controls (5 botones + display)
  3. Progress bar
  4. Volume sliders (2)
  5. Mood selector (grid 3x2)
  6. Effects grid (3x2)
  7. Footer con hints

### 5.2 API Interna

#### SoundEffectsManager
```typescript
class SoundEffectsManager {
  constructor(context: ExtensionContext);
  playEffect(effectName: string): void;
  dispose(): void;
}
```

#### AudioPanel
```typescript
class AudioPanel {
  static createOrShow(extensionUri: Uri): void;
  static postMessage(message: object): void;
}
```

#### CommandInterceptor
```typescript
class CommandInterceptor {
  constructor(context: ExtensionContext, soundEffects: SoundEffectsManager);
  initialize(): void;
  dispose(): void;
}
```

---

## 6. Casos de Uso

### CU-001: Reproducir Música de Fondo
**Actor:** Desarrollador  
**Precondiciones:** Extensión instalada y activada  
**Flujo Principal:**
1. Usuario presiona `Ctrl+Alt+M`
2. Se abre el panel de control
3. Usuario selecciona mood "Epic"
4. Usuario presiona botón Play
5. Comienza la reproducción de música

**Postcondiciones:** Música reproduce continuamente

### CU-002: Guardar Archivo con Sonido
**Actor:** Desarrollador  
**Precondiciones:** 
- Extensión activa
- `soundEffects.onSave` = true
**Flujo Principal:**
1. Usuario edita archivo
2. Usuario presiona `Ctrl+S`
3. Se escucha sonido de checkpoint
4. Archivo se guarda normalmente

**Postcondiciones:** Usuario recibe feedback auditivo

### CU-003: Cambiar Volumen
**Actor:** Desarrollador  
**Precondiciones:** Panel abierto  
**Flujo Principal:**
1. Usuario mueve slider de volumen de música
2. Volumen cambia en tiempo real
3. Setting se guarda automáticamente

**Postcondiciones:** Nueva configuración persistida

---

## 7. Plan de Testing

### 7.1 Tests Unitarios
- [ ] Generación de tonos con Web Audio API
- [ ] Cálculo de frecuencias por escala
- [ ] Conversión de volumen (0-100 → 0.0-1.0)
- [ ] Detección de eventos de guardado

### 7.2 Tests de Integración
- [ ] Comandos registrados correctamente
- [ ] Webview se comunica con extension
- [ ] Settings se leen y escriben
- [ ] Event listeners funcionan

### 7.3 Tests de Usuario
- [ ] Panel se abre correctamente
- [ ] Música suena sin glitches
- [ ] Efectos se disparan en eventos correctos
- [ ] Shortcuts funcionan en todas las plataformas

### 7.4 Tests de Rendimiento
- [ ] Memoria < 50MB
- [ ] CPU < 5%
- [ ] Latencia de audio < 50ms
- [ ] Inicio rápido

---

## 8. Criterios de Aceptación del Proyecto

✅ **El proyecto se considera completo cuando:**

1. Todas las funciones RF-001 a RF-010 están implementadas
2. Los tests pasan con 80%+ de cobertura
3. La extensión compila sin errores ni warnings
4. Funciona en Windows, macOS y Linux
5. README está completo con screenshots
6. CHANGELOG documenta la versión 0.0.1
7. Puede empaquetarse como .vsix exitosamente
8. No hay issues críticos abiertos

---

## 9. Roadmap Futuro

### Versión 0.1.0 (Q1 2026)
- Soporte para archivos de audio reales (MP3, WAV)
- Custom sound packs
- Más eventos detectables

### Versión 0.2.0 (Q2 2026)
- Integración con Spotify/YouTube Music
- AI para adaptar música a intensidad de código
- Estadísticas de uso

### Versión 1.0.0 (Q3 2026)
- Feature complete
- Extensión verificada en Marketplace
- Comunidad de sound packs

---

## 10. Apéndices

### A. Frecuencias Musicales
- C4 (Do central): 261.63 Hz
- A4 (La de afinación): 440.00 Hz
- C5: 523.25 Hz

### B. Escalas Musicales
- **Mayor:** 0, 2, 4, 5, 7, 9, 11
- **Menor:** 0, 2, 3, 5, 7, 8, 10
- **Pentatónica:** 0, 2, 4, 7, 9

### C. Referencias de Tempo
- Largo: 40-60 BPM
- Adagio: 60-80 BPM
- Moderato: 80-120 BPM
- Allegro: 120-168 BPM
- Presto: 168-200 BPM

---

**Fin del Documento**
