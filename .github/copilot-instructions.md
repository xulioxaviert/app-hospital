<!-- Instrucciones concisas para agentes de IA que trabajen en este repositorio -->
# Copilot instructions — Proyecto `app-hospital`

## Resumen rápido
Sitio web estático modular con integración n8n y backend API. Front-end en Tailwind CDN + componentes HTML separados. Sistema de carga dinámica custom. Formulario de concierge con doble envío (API REST + webhook n8n).

## Arquitectura del sistema

### Componentes principales
```
index.html                    → Shell principal + configuración Tailwind + JS inline
components/*.html             → Fragmentos HTML (Header, Hero, Services, Concierge, etc.)
assets/n8n-flujo-*.json      → Workflows de n8n para automatización
.github/skills/              → Skills personalizados para agentes de IA (ej: n8n expertise)
.github/agents/              → Configuraciones de agentes especializados
```

### Sistema de carga de componentes (CRÍTICO)
`index.html` incluye un **tiny client-side component loader** custom (líneas ~211-224):
```javascript
document.querySelectorAll('[data-include]').forEach(el => {
  fetch(el.getAttribute('data-include'))
    .then(r => r.text())
    .then(html => { el.innerHTML = html; })
});
```
- **Uso:** `<div data-include="components/header.html"></div>`
- **Cuándo editar componentes:** Modifica archivos en `/components/` directamente
- **Cuándo editar layout:** Cambia orden de `data-include` en `index.html`
- **Inicialización:** Algunos componentes (ej: Concierge) disparan `initDatePicker()` tras carga

### Flujo de datos del formulario (líneas ~100-210 de index.html)
El formulario de concierge implementa **doble envío**:
1. **POST a API local:** `http://localhost:3001/api/appointments` (almacenamiento)
2. **POST a webhook n8n:** `http://localhost:5678/webhook-test/form-submit` (automatización)

**Estados UI:**
- Spinner overlay: `#spinner-overlay` (mostrar mientras envía)
- Modal éxito: `#modal-success` (confirmación al usuario)
- Modal error: creado dinámicamente si faltan campos requeridos
- Toast n8n: feedback visual de integración (esquina inferior derecha)

**Validación obligatoria:** `fullName` y `email` antes de enviar

## Tailwind y estilos

### Configuración inline (líneas ~17-36)
Tailwind se carga desde CDN y se configura en `<script id="tailwind-config">`:
```js
colors: {
  primary: '#2C3E30',        // Deep Forest Green
  accent: '#C5B499',         // Muted Gold/Beige
  'neutral-light': '#FAF9F6', // Alabaster
  'neutral-muted': '#E5E1DA', // Natural Stone
  charcoal: '#2A2A2A'
}
fontFamily: {
  display: ['Playfair Display', 'serif'],
  sans: ['Inter', 'sans-serif']
}
```
**Modificar tokens:** Editar este bloque y buscar referencias en todos los archivos HTML

### Patrones Tailwind comunes
- **Peer-checked pattern (radio/checkbox estilizados):**
  ```html
  <input class="peer sr-only" name="field" type="radio" />
  <div class="peer-checked:border-accent peer-checked:bg-neutral-muted/30">...</div>
  ```
- **Accesibilidad:** Usar `sr-only` para labels de screen readers
- **Material Symbols:** `<span class="material-symbols-outlined">icon_name</span>`
- **Typography:** Headings usan `font-display` (Playfair Display), body usa `font-sans` (Inter)

## Integración n8n

### Workflow ubicación
`assets/n8n-flujo-gmail-ollama-drive.json` — workflow de ejemplo para procesamiento de citas

### Webhook endpoint esperado
```javascript
POST http://localhost:5678/webhook-test/form-submit
Body: {
  nombre: string,
  email: string,
  fecha: string (YYYY-MM-DD),
  hora: string,
  servicio: string
}
```
**Respuesta esperada:** `{ message: "Workflow was started" }`

### Skills de n8n
Para contexto exhaustivo sobre n8n, el agente puede consultar `.github/skills/n8n/SKILL.md` — documento completo con arquitectura, nodos, expresiones, mejores prácticas y troubleshooting.

## JavaScript inline patterns

### Event delegation global
Todo el JS está en `index.html` (~78-294) usando event delegation en `document`:
```javascript
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('preferred-window-btn')) {
    // Handle preferred time window selection
  }
});
```

### Funciones globales declaradas
- `initDatePicker()` — Renderiza calendario custom (líneas ~229-294)
- `mostrarModalError(mensaje)` — Modal dinámico para errores de validación
- `mostrarToast(mensaje, esError)` — Toast de feedback visual

### Estado del formulario
- **Preferred window:** Input hidden `#preferred-window-input` actualizado vía `data-value` de botones
- **Date picker:** Input hidden `#selected-date` actualizado por calendario custom
- **Form reset:** Limpia inputs + restablece botones + reinicializa datepicker

## Comandos de desarrollo

### VS Code tasks disponibles
```bash
mvn -B verify    # task: verify (build/validation)
mvn -B test      # task: test
```
**Nota:** Maven tasks presentes pero uso no documentado para este proyecto estático. Preguntar al mantenedor antes de asumir pipeline CI/CD.

### Servidor local (recomendado)
```bash
# Python 3
python3 -m http.server 8000

# Node.js (si instalas http-server)
npx http-server -p 8000
```
**Razón:** El component loader usa `fetch()` que requiere servidor HTTP (no funciona con `file://`)

### Backend API local (esperado por el formulario)
```bash
# Endpoint requerido (implementación no incluida en repo)
POST http://localhost:3001/api/appointments
```

### n8n local
```bash
# Docker (recomendado)
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# npm global
npm install n8n -g && n8n start
```

## Reglas de edición

### ✅ HACER
- Modificar componentes en `/components/` individualmente para cambios modulares
- Preservar atributos `name` en inputs de formularios (usados por FormData)
- Mantener `sr-only` en labels para accesibilidad
- Usar tokens de color existentes (`primary`, `accent`, etc.)
- Validar campos obligatorios antes de enviar formularios
- Mantener feedback visual (spinners, modals, toasts) para UX

### ❌ EVITAR
- Reemplazar CDN de Tailwind sin agregar `package.json` y build process
- Modificar estructura de colores sin actualizar referencias globales
- Romper el pattern `peer`/`peer-checked` (crítico para radio buttons estilizados)
- Eliminar fallbacks en fetch (`.catch(error => {})` evita crashes)
- Hardcodear URLs de API/webhooks (considerar env vars si migras a build)

## Dónde mirar primero

### Para cambios de UI/contenido
1. `components/[nombre].html` — Componente específico
2. `index.html` (líneas 17-36) — Tokens de color/fuentes
3. `index.html` (líneas 78-294) — Lógica interactiva

### Para integración n8n
1. `assets/n8n-flujo-gmail-ollama-drive.json` — Workflow de referencia
2. `.github/skills/n8n/SKILL.md` — Documentación exhaustiva de n8n
3. `index.html` (líneas ~145-179) — Llamada a webhook

### Para arquitectura del proyecto
1. `.github/copilot-instructions.md` — Este archivo
2. `.github/skills/` — Skills disponibles para agentes
3. `.github/agents/` — Agentes especializados configurados

## Patrones de código específicos del proyecto

### Calendario custom (no librería externa)
```javascript
// initDatePicker() gestiona:
// - Renderizado de días del mes
// - Selección visual con classes Tailwind
// - Navegación prev/next month
// - ARIA labels para accesibilidad
// - Input hidden (#selected-date) con formato YYYY-MM-DD
```

### Fetch con doble envío
```javascript
// 1. Enviar a API (storage)
fetch('http://localhost:3001/api/appointments', {...})
  .then(() => {
    // 2. Disparar n8n (automation) solo si API tuvo éxito
    fetch('http://localhost:5678/webhook-test/form-submit', {...})
      .then(() => mostrarToast('Notificación enviada'))
  })
  .finally(() => {
    // 3. Mostrar modal éxito + reset form
    document.getElementById('modal-success').classList.remove('hidden');
  });
```

### Component loading con callback
```javascript
// Tras cargar componente, ejecutar inicialización específica
.finally(() => {
  if (path.includes('concierge') && el.querySelector('#datepicker')) {
    initDatePicker();  // Solo para Concierge
  }
});
```

## Preguntas para el mantenedor

Si vas a hacer cambios estructurales, clarifica primero:
1. **Maven tasks:** ¿Cuál es el propósito de `mvn verify/test` en un proyecto estático?
2. **Backend API:** ¿Hay un repositorio separado para `localhost:3001`? ¿Deployment target?
3. **n8n production:** ¿URL de webhook en producción? ¿Autenticación requerida?
4. **Build process futuro:** ¿Planes de migrar a Vite/Webpack?

## Plantillas de contribución

**Pull Requests:** [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)  
**Commits:** [.github/commit_message_template.txt](.github/commit_message_template.txt)

---
*Última actualización: 17 de febrero de 2026*