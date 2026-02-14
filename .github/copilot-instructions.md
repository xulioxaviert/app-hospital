<!-- Instrucciones concisas para agentes de IA que trabajen en este repositorio -->
# Copilot instructions — Proyecto `app-hospital`

Resumen rápido
- Repositorio pequeño: front-end estático principal en `index.html` (Tailwind CDN + configuración en línea).
- No hay `package.json` ni build NodeJS por defecto; hay tareas de VS Code para Maven (`verify`, `test`) disponibles en el workspace tasks.

Arquitectura y porqué
- Página estática única: `index.html` contiene la lógica de presentacion, configuración de Tailwind y estilos críticos.
- Tailwind se carga desde CDN y se configura vía el `<script id="tailwind-config">` inline — modificaciones a tokens de color/fuentes suelen hacerse allí.

Patrones y convenciones del proyecto (extraídos de `index.html`)
- Utility-first Tailwind: añadir clases utilitarias en el markup en lugar de CSS separado para la mayoría de cambios.
- Tokens globals: `primary`, `accent`, `neutral-light`, `neutral-muted`, `charcoal` definidos en el `tailwind.config` inline — reuse esos nombres.
- Componentes UI: utiliza `peer` / `peer-checked` para inputs estilizados y `sr-only` para accesibilidad.
- Formularios: el formulario de concierge usa `action="#"` y markup semántico; mantener atributos `name` en inputs cuando se agreguen.

Flujos de desarrollo y comandos útiles
- No asumir `npm`/`node` por defecto. Si introduces herramientas de Node (por Tailwind CLI, PostCSS, etc.), añade `package.json` y documenta en este archivo.
- Comandos disponibles en el workspace (VS Code tasks):
  - Build/verify: `mvn -B verify` (task `verify`)
  - Tests: `mvn -B test` (task `test`)

Reglas para ediciones de la UI
- Prefer cambios localizados en `index.html` para este repo pequeño. Si agregas múltiples componentes, crea una carpeta `assets/` o `src/` y documenta el nuevo flujo.
- Si necesitas extender Tailwind (nuevos tokens o plugins), actualiza el bloque `tailwind-config` inline o propone mover la configuración a un archivo separado (`tailwind.config.js`) y documenta el cambio.

Qué evitar
- No reemplazar el CDN de Tailwind por una configuración de build sin antes añadir `package.json` y documentar el nuevo flujo.
- Evitar renombrar tokens de color sin actualizar todas las referencias en `index.html`.

Ejemplos concretos desde el código
- Token ejemplo (usa estos nombres):
  ```js
  colors: { primary: '#2C3E30', accent: '#C5B499', 'neutral-light': '#FAF9F6' }
  ```
- Patrón `peer` para inputs (preservar `sr-only`):
  ```html
  <input class="peer sr-only" name="specialist" type="radio" />
  <div class="peer-checked:border-accent peer-checked:bg-neutral-muted/30">...</div>
  ```

Dónde mirar primero
- `index.html` — configuración de Tailwind, estructura principal y componentes.
- Si introduces tests o backend, documenta el nuevo layout de carpetas y comandos en este archivo.

Pide aclaraciones
- Si algo del flujo de build o integración continúa sin estar claro (por ejemplo, por qué hay tareas Maven en un sitio estático), pregunta al mantenedor antes de introducir cambios estructurales.

Plantillas de PR y commits
- Usar la plantilla de PR y el template de mensajes de commit para mantener consistencia. Archivos:
  - [/.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)
  - [/.github/commit_message_template.txt](.github/commit_message_template.txt)

-- Fin --