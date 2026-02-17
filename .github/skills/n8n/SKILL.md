---
name: n8n
description: Especialista en n8n - automatización de workflows, nodos, integraciones, expresiones, APIs, triggers, transformaciones de datos, debugging, optimización y mejores prácticas para diseño, creación y mantenimiento de workflows complejos.
---

# Habilidad de n8n para Agentes de IA

## DESCRIPCIÓN GENERAL

n8n es una plataforma de automatización de workflows de código abierto que permite conectar servicios, APIs y bases de datos sin necesidad de escribir código complejo. Esta skill proporciona conocimiento exhaustivo para trabajar con n8n, incluyendo diseño de workflows, configuración de nodos, expresiones, manejo de errores, optimización y mejores prácticas.

**Casos de uso principales:**
- Automatización de procesos empresariales
- Integración de múltiples servicios y APIs
- Transformación y procesamiento de datos
- Workflows de AI/ML con LangChain
- Automatización de notificaciones y alertas
- Sincronización de datos entre sistemas
- Procesos ETL (Extract, Transform, Load)

---

## 1. ARQUITECTURA DE n8n

### Componentes Fundamentales

#### **Workflow**
Secuencia de pasos automatizados que conecta diferentes servicios y procesa datos. Cada workflow contiene:
- **Nodos (Nodes)**: Bloques funcionales que ejecutan acciones específicas
- **Conexiones (Connections)**: Enlaces que definen el flujo de datos entre nodos
- **Credenciales**: Sistema centralizado de autenticación
- **Settings**: Configuración del workflow (timeouts, error handling, tags)

#### **Tipos de Ejecución**
- **Manual**: Pruebas en el editor con datos simulados o pinned data
- **Partial**: Ejecución desde un nodo específico hacia adelante
- **Production**: Ejecución automática activada por triggers

#### **Sistema de Credenciales**
- Centralizado: compartir credenciales entre workflows y usuarios
- Encriptación automática de datos sensibles
- Soporte para OAuth2, API Keys, Basic Auth, JWT, y custom credentials
- Credential testing antes de guardar

---

## 2. NODOS FUNDAMENTALES

### A) CORE NODES - TRIGGERS

Los triggers inician la ejecución de un workflow.

**Manual Trigger**
```
Uso: Ejecución manual desde el editor
Caso: Testing y debugging
```

**Schedule Trigger**
```
Uso: Ejecución programada con expresiones cron
Ejemplos:
  - "0 9 * * 1-5" → Lunes a viernes a las 9:00 AM
  - "*/15 * * * *" → Cada 15 minutos
  - "0 0 1 * *" → Primer día de cada mes a medianoche
```

**Webhook**
```
Uso: Recibir datos HTTP (GET, POST, PUT, DELETE)
Configuración:
  - Webhook Path: /webhook-path (o auto-generated)
  - Authentication: None, Basic Auth, Header Auth
  - Response: Immediately, On Last Node, Using 'Respond to Webhook' Node
Caso: APIs públicas, integraciones en tiempo real
```

**Error Trigger**
```
Uso: Capturar errores de otros workflows
Configuración: Workflow Settings → Error Workflow
Datos recibidos:
{
  "execution": {
    "id": "231",
    "error": { "message": "...", "stack": "..." },
    "lastNodeExecuted": "Node Name"
  },
  "workflow": { "id": "1", "name": "..." }
}
```

### B) CORE NODES - FLOW LOGIC

**If Node**
```
Uso: Condicional simple (dos rutas: true/false)
Condiciones:
  - String: contains, equal, starts/ends with, regex, empty
  - Number: larger, smaller, equal
  - Boolean: is true/false
  - Date: after, before, between
  - Exists: is defined/undefined
Ejemplo:
  {{ $json.status === "active" }}
  {{ $json.amount > 1000 }}
```

**Switch Node**
```
Uso: Múltiples rutas condicionales (switch-case)
Modos:
  - Expression: Evaluar una expresión por ruta
  - Rules: Reglas condicionales por ruta
Fallback: Ejecutar si ninguna condición se cumple
```

**Merge Node**
```
Uso: Combinar datos de múltiples nodos
Modos:
  - Append: Concatenar todos los items
  - Keep Key Matches: Join por clave común
  - Merge By Index: Combinar por posición
  - Merge By Position: Similar a Merge By Index
  - Multiplex: Crear producto cartesiano
Caso común: Combinar resultados de llamadas API paralelas
```

**Split Out Node**
```
Uso: Dividir items en múltiples rutas para procesamiento paralelo
Configuración:
  - Output Count: Número de salidas
Distribución: Round-robin (1→output1, 2→output2, etc.)
```

**Loop Over Items Node**
```
Uso: Iteración con control de batches
Parámetros:
  - Batch Size: Cuántos items procesar por iteración
  - Pause Between Batches: Delay entre batches (ms)
Caso: Procesar grandes volúmenes sin sobrecargar APIs
```

### C) CORE NODES - DATA TRANSFORMATION

**Code Node**
```
Lenguajes: JavaScript (recomendado) o Python
Variables disponibles:
  - items: Array de items de entrada
  - $input.all(): Todos los items
  - $input.first(): Primer item
  - $input.item: Item actual con linking
Retornar:
  return items.map(item => ({
    json: {
      transformedField: item.json.originalField.toUpperCase()
    }
  }));
```

**Edit Fields (Set) Node**
```
Uso: Modificar, agregar o eliminar campos
Operaciones:
  - Set: Crear/actualizar campo
  - Remove: Eliminar campo
  - Include: Mantener solo campos especificados
  - Exclude: Excluir campos especificados
Ejemplo:
  Campo: fullName
  Valor: {{ $json.firstName + " " + $json.lastName }}
```

**Filter Node**
```
Uso: Filtrar items según condiciones
Similar a If, pero mantiene/elimina items en una sola ruta
Condiciones combinadas con AND/OR
```

**Aggregate Node**
```
Operaciones:
  - Sum: Sumar valores numéricos
  - Count: Contar items
  - Average: Promedio
  - Min/Max: Valores mínimo/máximo
  - Concatenate: Unir strings
  - Group: Agrupar por campo
Caso: Análisis de datos, reportes
```

**Sort Node**
```
Uso: Ordenar items
Configuración:
  - Sort Key: Campo por el cual ordenar
  - Type: Numeric, String, Date
  - Order: Ascending/Descending
```

### D) CORE NODES - UTILITIES

**HTTP Request Node**
```
Configuración esencial:
  - Method: GET, POST, PUT, DELETE, PATCH, HEAD
  - URL: {{ $json.apiUrl }} (puede usar expresiones)
  - Authentication: Predefined Credential, Generic, None
  - Headers: Content-Type, Authorization, custom headers
  - Query Parameters: URL parameters
  - Body: JSON, Form, XML, Raw
  - Options:
    - Batch Size: Requests por segundo
    - Timeout: Máximo tiempo de espera (ms)
    - Redirect: Follow redirects
    - Retry On Fail: Reintentos automáticos
    - Wait Between Retries: Backoff (ms)

Respuesta:
  - Response Format: JSON, String, File
  - Full Response: Incluir headers y status code
  
Ejemplo de llamada API:
  URL: https://api.example.com/users
  Headers: { "Authorization": "Bearer {{$json.token}}" }
  Body: { "name": "{{$json.name}}", "email": "{{$json.email}}" }
```

**Execute Workflow Node**
```
Uso: Llamar a otro workflow (sub-workflow pattern)
Configuración:
  - Source: By Database ID, By URL
  - Workflow ID: ID del workflow a ejecutar
  - Mode: Production (real execution) o Test (editor data)
Pasar datos: Los items de entrada se pasan al workflow llamado
Caso: Modularización, reutilización de lógica
```

**Wait Node**
```
Modos:
  - After Time Interval: Esperar X segundos/minutos/horas
  - After Date & Time: Esperar hasta fecha específica
  - On Webhook Call: Continuar cuando se llame a un webhook
  - After Form Submission: Esperar un formulario
Caso común: Rate limiting, esperar confirmaciones, delays
```

**Stop And Error Node**
```
Uso: Finalizar workflow con error o éxito
Configuración:
  - Error: Marcar ejecución como fallida
  - Message: Mensaje descriptivo del error
Caso: Validaciones, condiciones de negocio no cumplidas
```

---

## 3. INTEGRACIONES POPULARES (APP NODES)

### COMUNICACIÓN
- **Gmail**: Envío, lectura, búsqueda de emails con filtros avanzados
- **Slack**: Mensajes, channels, archivos, reactions, users
- **Discord**: Mensajes, embeds, webhooks, roles
- **Microsoft Teams**: Mensajes, channels, meetings
- **Telegram**: Bot API, mensajes, comandos, inline keyboards

### CRM Y VENTAS
- **Salesforce**: Leads, Opportunities, Accounts, Reports
- **HubSpot**: Contacts, Deals, Companies, Tickets
- **Pipedrive**: Deals, Persons, Organizations, Activities

### BASES DE DATOS
- **PostgreSQL**: Query, Insert, Update, Execute Query
- **MySQL**: Operaciones CRUD, stored procedures
- **MongoDB**: Find, Insert, Update, Aggregate pipelines
- **Redis**: Get, Set, Keys, Publish/Subscribe
- **Supabase**: Database + Storage + Auth

### CLOUD STORAGE
- **Google Drive**: Upload, Download, Search, Share
- **Dropbox**: Files, Folders, Sharing
- **AWS S3**: Upload, Download, List buckets
- **OneDrive**: Files management, sharing

### DESARROLLO
- **GitHub**: Repos, Issues, PRs, Releases, Actions
- **GitLab**: Projects, Issues, Merge Requests, CI/CD
- **Jira**: Issues, Projects, Boards, Transitions

### AI/ML
- **OpenAI**: GPT-4, DALL-E, Embeddings, Assistants
- **Anthropic**: Claude models, streaming
- **Google Gemini**: Multimodal AI
- **Pinecone**: Vector database para RAG
- **LangChain nodes**: Agents, Chains, Tools, Memory

---

## 4. SISTEMA DE EXPRESIONES

Las expresiones permiten acceder y manipular datos dinámicamente. Se escriben entre dobles llaves: `{{ expresión }}`

### Variables del Nodo Actual

```javascript
$json                    // Datos JSON del item actual
$json.fieldName          // Acceder a campo específico
$json['field-with-dash'] // Campos con caracteres especiales
$json.nested.field       // Campos anidados

$binary                  // Datos binarios del item actual
$binary.data.data        // Base64 del archivo
$binary.data.mimeType    // Tipo MIME
$binary.data.fileName    // Nombre del archivo

$input.first()           // Primer item de entrada
$input.last()            // Último item de entrada
$input.all()             // Array con todos los items de entrada
$input.item              // Item vinculado (item linking)

$itemIndex               // Índice del item actual (0-based)
```

### Variables de Otros Nodos

```javascript
// Acceder a datos de nodo específico
$('Nombre del Nodo').first()              // Primer item
$('Nombre del Nodo').last()               // Último item
$('Nombre del Nodo').all()                // Todos los items
$('Nombre del Nodo').item                 // Item vinculado
$('Nombre del Nodo').itemMatching(index)  // Matching por índice
$('Nombre del Nodo').params               // Parámetros del nodo

// Ejemplos:
$('HTTP Request').first().json.userId
$('Database Query').all()[0].json.name
$('Previous Node').itemMatching($itemIndex).json.id
```

### Metadata del Workflow

```javascript
// Información de ejecución
$execution.id            // ID único de ejecución
$execution.mode          // 'manual', 'trigger', 'webhook', 'test'
$execution.resumeUrl     // URL para resumir Wait nodes

// Información del workflow
$workflow.id             // ID del workflow
$workflow.name           // Nombre del workflow
$workflow.active         // true si está activo

// Información del nodo
$nodeVersion             // Versión del nodo actual
$runIndex                // Número de ejecución del nodo
$prevNode.name           // Nombre del nodo anterior
$prevNode.outputIndex    // Índice de salida del nodo anterior

// Variables y entorno
$vars.variableName       // Variables de entorno personalizadas
$env.ENV_VAR_NAME        // Variables del sistema
```

### Funciones de Fecha y Hora (Luxon)

```javascript
$now                     // Timestamp actual
$today                   // Timestamp de hoy a medianoche
$yesterday               // Timestamp de ayer a medianoche

// DateTime (Luxon)
{{ DateTime.now().toISO() }}                    // ISO 8601
{{ DateTime.now().toFormat('yyyy-MM-dd') }}     // Formato custom
{{ DateTime.fromISO($json.date).plus({days: 7}) }}  // Sumar días
{{ DateTime.now().minus({hours: 2}) }}          // Restar horas
{{ DateTime.fromMillis($json.timestamp) }}      // Desde timestamp
```

### Funciones de Arrays

```javascript
// Map, Filter, Reduce
{{ $json.items.map(item => item.name) }}
{{ $json.items.filter(item => item.price > 100) }}
{{ $json.items.reduce((sum, item) => sum + item.price, 0) }}

// Métodos útiles
{{ $json.array.length }}
{{ $json.array.join(', ') }}
{{ $json.array.slice(0, 10) }}
{{ $json.array.find(item => item.id === 123) }}
{{ $json.array.includes('value') }}
{{ $json.array.sort() }}
```

### Funciones de Strings

```javascript
{{ $json.text.toLowerCase() }}
{{ $json.text.toUpperCase() }}
{{ $json.text.trim() }}
{{ $json.text.replace('old', 'new') }}
{{ $json.text.split(',') }}
{{ $json.text.substring(0, 10) }}
{{ $json.text.includes('palabra') }}
{{ $json.text.startsWith('prefix') }}
{{ $json.text.length }}
```

### Funciones de Números

```javascript
{{ $json.value.toFixed(2) }}        // Decimales fijos
{{ Math.round($json.value) }}       // Redondeo
{{ Math.floor($json.value) }}       // Redondeo hacia abajo
{{ Math.ceil($json.value) }}        // Redondeo hacia arriba
{{ Math.random() }}                 // Random 0-1
{{ parseInt($json.string) }}        // String a número
{{ parseFloat($json.string) }}      // String a decimal
```

### JMESPath (Consultas JSON Avanzadas)

```javascript
// Función $jmespath() para querys complejos
{{ $jmespath($json, "users[?age > `18`].name") }}
{{ $jmespath($json, "products[*].price | max(@)") }}
{{ $jmespath($json, "items[?status == 'active'] | length(@)") }}
```

### Operadores y Condicionales

```javascript
// Operadores lógicos
{{ $json.age > 18 && $json.country === 'US' }}
{{ $json.status === 'active' || $json.status === 'pending' }}
{{ !$json.isDeleted }}

// Ternarios
{{ $json.type === 'premium' ? 100 : 50 }}
{{ $json.name ? $json.name : 'Unknown' }}

// Nullish coalescing
{{ $json.optionalField ?? 'default value' }}

// Optional chaining
{{ $json.user?.address?.city ?? 'No city' }}
```

---

## 5. ESTRUCTURA DE DATOS EN n8n

### Formato Estándar de Items

Cada nodo procesa un array de items. Cada item tiene una estructura estándar:

```json
[
  {
    "json": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "metadata": {
        "created": "2024-01-15",
        "tags": ["customer", "premium"]
      }
    },
    "binary": {
      "document": {
        "data": "base64EncodedString...",
        "mimeType": "application/pdf",
        "fileExtension": "pdf",
        "fileName": "invoice.pdf",
        "fileSize": "245678"
      }
    },
    "pairedItem": {
      "item": 0,
      "input": undefined
    }
  }
]
```

### Claves Principales

**`json`** (obligatorio desde v0.166.0)
- Contiene los datos estructurados del item
- Puede tener cualquier estructura: objects, arrays, primitives
- Acceso: `$json.fieldName`

**`binary`** (opcional)
- Contiene archivos binarios codificados en base64
- Puede tener múltiples archivos: `binary.file1`, `binary.file2`
- Acceso: `$binary.data.data`, `$binary.data.fileName`

**`pairedItem`** (automático)
- Sistema de trazabilidad entre items
- Mantiene el vínculo con items de nodos anteriores
- Utilizado por `$input.item` y `.itemMatching()`

### Transformación de Datos

**Agregar campos:**
```javascript
// Edit Fields (Set) Node
Campo: newField
Valor: {{ $json.existingField * 2 }}
```

**Remover campos:**
```javascript
// Edit Fields (Set) Node
Modo: Exclude
Campos: password, internalId
```

**Aplanar objetos anidados:**
```javascript
// Code Node
return items.map(item => ({
  json: {
    id: item.json.id,
    userName: item.json.user.name,
    userEmail: item.json.user.email,
    addressCity: item.json.user.address.city
  }
}));
```

**Combinar arrays:**
```javascript
// Code Node - Flatten array de objetos
return items[0].json.users.map(user => ({ json: user }));
```

---

## 6. MANEJO DE ERRORES

### Estrategia 1: Error Workflow

Crear un workflow dedicado para manejar errores globalmente.

**Configuración:**
1. Crear workflow con Error Trigger node
2. En workflow principal: Settings → Error Workflow → Seleccionar el workflow
3. El Error Trigger recibe automáticamente:

```json
{
  "execution": {
    "id": "231",
    "url": "https://n8n.example.com/execution/231",
    "retryOf": null,
    "error": {
      "message": "Connection timeout",
      "stack": "Error: Connection timeout\n  at..."
    },
    "lastNodeExecuted": "HTTP Request",
    "mode": "manual"
  },
  "workflow": {
    "id": "1",
    "name": "Data Sync Workflow"
  }
}
```

**Acciones comunes en Error Workflow:**
- Enviar notificación a Slack/Teams/Email
- Registrar en database para auditoría
- Crear ticket en Jira
- Retry inteligente basado en tipo de error

### Estrategia 2: Node-Level Error Handling

**Continue On Fail**
```
Settings del nodo → Continue On Fail: true
Efecto: Si el nodo falla, el workflow continúa
Uso: Nodos no críticos, operaciones opcionales
Acceso al error: $json.error contiene detalles del error
```

**Retry On Fail**
```
Settings del nodo → Retry On Fail: true
Max Tries: 3
Wait Between Retries: 1000 ms (incrementa exponencialmente)
Uso: APIs inestables, problemas de red temporal
```

### Estrategia 3: If + Error Pattern

```
[HTTP Request] 
    ↓
[If: $json.success === true]
    ↓ True → [Continue processing]
    ↓ False → [Stop And Error] → Error Workflow
```

### Estrategia 4: Try-Catch con Code Node

```javascript
// Code Node
try {
  const result = await fetch(url);
  return [{ json: { success: true, data: result } }];
} catch (error) {
  return [{ 
    json: { 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    } 
  }];
}
```

### Mejores Prácticas de Error Handling

1. **Siempre configurar Error Workflow** para workflows en producción
2. **Usar Continue On Fail** para operaciones no críticas (logging, analytics)
3. **Configurar Retry** para:
   - Llamadas HTTP a APIs externas
   - Operaciones de base de datos
   - Servicios cloud (S3, Drive, etc.)
4. **Incluir contexto en errores**:
   ```javascript
   throw new Error(`Failed processing user ${$json.userId}: ${error.message}`);
   ```
5. **Logging estructurado**: Enviar errores a servicio centralizado (Sentry, DataDog)

---

## 7. CONFIGURACIÓN Y VARIABLES DE ENTORNO

### Configuración de Deployment

```bash
# Autenticación básica
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=securePassword123

# URLs y networking
N8N_HOST=n8n.example.com
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.example.com
N8N_EDITOR_BASE_URL=https://n8n.example.com

# SSL/TLS
N8N_SSL_KEY=/path/to/ssl/key.pem
N8N_SSL_CERT=/path/to/ssl/cert.pem
```

### Base de Datos

```bash
# PostgreSQL (recomendado para producción)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=password
DB_POSTGRESDB_SCHEMA=public

# MySQL
DB_TYPE=mysqldb
DB_MYSQLDB_HOST=localhost
DB_MYSQLDB_PORT=3306
DB_MYSQLDB_DATABASE=n8n

# SQLite (solo desarrollo)
DB_TYPE=sqlite
DB_SQLITE_DATABASE=/home/user/.n8n/database.sqlite
```

### Gestión de Ejecuciones

```bash
# Modo de ejecución
EXECUTIONS_MODE=regular          # regular o queue
EXECUTIONS_PROCESS=main          # main o own

# Timeouts
EXECUTIONS_TIMEOUT=3600          # Timeout global (segundos)
EXECUTIONS_TIMEOUT_MAX=7200      # Timeout máximo permitido

# Almacenamiento de ejecuciones
EXECUTIONS_DATA_SAVE_ON_ERROR=all        # all, none
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all     # all, none
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Limpieza automática
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=336      # Horas (14 días)
EXECUTIONS_DATA_PRUNE_TIMEOUT=3600
```

### Queue Mode (Escalabilidad)

```bash
# Redis para queue
QUEUE_BULL_REDIS_HOST=localhost
QUEUE_BULL_REDIS_PORT=6379
QUEUE_BULL_REDIS_DB=0
QUEUE_BULL_REDIS_PASSWORD=redisPassword
QUEUE_BULL_REDIS_TIMEOUT_THRESHOLD=10000

# Concurrencia
N8N_CONCURRENCY_PRODUCTION_LIMIT=10
EXECUTIONS_PROCESS=own           # Ejecutar en procesos separados

# Workers
N8N_WORKERS=4                    # Número de workers
```

### Logging y Debugging

```bash
# Nivel de logging
N8N_LOG_LEVEL=info               # error, warn, info, verbose, debug
N8N_LOG_OUTPUT=console           # console, file
N8N_LOG_FILE_LOCATION=/logs/n8n.log

# Debugging
DEBUG=n8n:*                      # Habilitar logs debug
NODE_OPTIONS=--trace-warnings    # Warnings de Node.js
```

### Seguridad

```bash
# JWT para autenticación
N8N_JWT_SECRET=yourRandomSecretKey
JWT_SESSION_DURATION=168         # Horas (7 días)

# External Secrets
N8N_EXTERNAL_SECRETS_SOURCES=vault,awsSecretsManager
N8N_EXTERNAL_SECRETS_UPDATE_INTERVAL=300  # Segundos

# Rate limiting
N8N_ENDPOINT_WEBHOOK_RATE_LIMIT=120
N8N_ENDPOINT_WEBHOOK_RATE_LIMIT_WINDOW=60000
```

### Variables Personalizadas

Acceder en workflows con `$vars.variableName`:

```bash
N8N_USER_MANAGEMENT_DISABLED=false
N8N_CUSTOM_EXTENSIONS=/path/to/extensions
GENERIC_TIMEZONE=America/New_York
```

---

## 8. MEJORES PRÁCTICAS

### Diseño de Workflows

**1. Naming Conventions**
```
✅ BIEN: "Fetch User Data", "Transform Customer Info", "Send Slack Alert"
❌ MAL: "Node1", "HTTP", "Code"
```

**2. Modularización con Sub-workflows**
```
Workflow principal:
  → Execute Workflow: "Get Customer Data"
  → Execute Workflow: "Calculate Metrics"
  → Execute Workflow: "Send Report"

Beneficios:
- Reutilización de lógica
- Testing independiente
- Mantenimiento simplificado
```

**3. Sticky Notes para Documentación**
```
Agregar Sticky Notes para:
- Explicar secciones complejas
- Documentar configuraciones críticas
- Notas de debugging
- TODOs y mejoras futuras
```

**4. Uso de Tags**
```
Tags recomendados:
- production, staging, development
- finance, marketing, operations
- critical, high-priority
- v1, v2 (versioning)
```

**5. Testing Riguroso**
```
Antes de activar:
1. Probar con data pinning (datos fijos)
2. Probar con datos reales en modo manual
3. Verificar manejo de errores
4. Revisar execution history
5. Activar en horarios de bajo tráfico
```

### Optimización de Performance

**1. Batch Processing**
```javascript
// Loop Over Items con batches
Batch Size: 100
Pause Between Batches: 1000 ms

Caso: Procesar 10,000 registros sin timeout
```

**2. Pagination para APIs**
```
Patrón:
1. HTTP Request con offset/page parameter
2. Si hay más páginas → Loop back
3. Merge results

Variables:
- totalPages = Math.ceil(totalRecords / pageSize)
- currentPage incrementa en cada iteración
```

**3. Caching con Static Data**
```javascript
// Code Node - Guardar en workflow static data
const staticData = this.getWorkflowStaticData('global');
if (staticData.cache && Date.now() - staticData.cacheTime < 3600000) {
  return [{ json: staticData.cache }];
}
// Fetch fresh data
staticData.cache = freshData;
staticData.cacheTime = Date.now();
```

**4. Limitar Outputvon HTTP Requests**
```
HTTP Request settings:
- Response: JSON
- Pagination: Automatic pagination
- Batch Size: Controlar rate limiting
```

**5. Queue Mode para Alta Concurrencia**
```
Activar cuando:
- Más de 10 workflows simultáneos
- Workflows pesados con timeouts
- Necesidad de escalado horizontal
```

### Seguridad

**1. Nunca Hardcodear Credenciales**
```
❌ MAL: {{ "Bearer sk-abc123..." }}
✅ BIEN: Usar Credential System o $env.API_KEY
```

**2. Validación de Inputs en Webhooks**
```javascript
// Code Node - Validar antes de procesar
const requiredFields = ['email', 'name'];
const missing = requiredFields.filter(f => !$json[f]);
if (missing.length > 0) {
  throw new Error(`Missing fields: ${missing.join(', ')}`);
}
```

**3. Autenticación en Webhooks**
```
Webhook settings:
- Authentication: Header Auth
- Header Name: X-API-Key
- Header Value: {{ $env.WEBHOOK_SECRET }}
```

**4. Sanitización de Datos**
```javascript
// Code Node - Limpiar input antes de DB
const sanitize = (str) => str.replace(/[<>]/g, '');
return items.map(item => ({
  json: {
    name: sanitize(item.json.name),
    email: sanitize(item.json.email)
  }
}));
```

**5. Rate Limiting**
```
Implementar con Wait node y counters:
- Límite: 100 requests/minuto
- Wait: 600ms entre requests
- Monitorear con variables del workflow
```

### Debugging

**1. Data Pinning**
```
Uso: Pin data en nodos para testing sin ejecutar desde el inicio
Cómo: Ejecutar nodo → Right click → "Pin data"
Beneficio: Testing rápido de secciones específicas
```

**2. Execution History**
```
Ver en: Executions tab
Filtrar por:
- Status: Success, Error, Waiting
- Mode: manual, trigger, webhook
- Date range
Inspeccionar: Input/output de cada nodo
```

**3. Debug Helper Node (Community Node)**
```
npm install n8n-nodes-debug-helper
Funciones:
- Log a consola/archivo
- Breakpoints condicionales
- Inspect variables
```

**4. Logs Detallados**
```javascript
// Code Node - Logging estructurado
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  executionId: $execution.id,
  nodeData: $json,
  itemIndex: $itemIndex
}, null, 2));
```

**5. Error Notifications**
```
Error Workflow pattern:
1. Error Trigger
2. Format error message con contexto
3. Send to Slack/Email/PagerDuty
4. Log to database para analytics
```

---

## 9. PATRONES COMUNES DE WORKFLOWS

### Patrón 1: Webhook → Transform → API → Response

```
[Webhook]
    ↓
[Validate Input] (Code/If)
    ↓
[Transform Data] (Edit Fields/Code)
    ↓
[HTTP Request] (External API)
    ↓
[Format Response] (Edit Fields)
    ↓
[Respond to Webhook]
```

**Caso de uso:** API Gateway, webhooks públicos, integraciones síncronas

### Patrón 2: Schedule → Fetch → Filter → Store → Notify

```
[Schedule Trigger] (daily 9 AM)
    ↓
[HTTP Request/Database] (Fetch data)
    ↓
[Filter] (Solo nuevos registros)
    ↓
[Database Insert/Update]
    ↓
[If: items > 0]
    ↓ True
[Slack Message] (Notificación)
```

**Caso de uso:** ETL diario, sincronización de datos, reportes automatizados

### Patrón 3: RAG con AI (Retrieval Augmented Generation)

```
[Webhook/Manual Trigger]
    ↓
[Embeddings: OpenAI] (Convertir query a vector)
    ↓
[Vector Store: Pinecone] (Similarity search)
    ↓
[Aggregate] (Top 5 resultados relevantes)
    ↓
[OpenAI Chat] (Generar respuesta con contexto)
    ↓
[Respond to Webhook/Format Output]
```

**Caso de uso:** Chatbots con knowledge base, Q&A systems, soporte automatizado

### Patrón 4: Parallel Processing con Split-Merge

```
[HTTP Request] (Fetch 1000 items)
    ↓
[Split Out] (3 outputs)
    ↓ ↓ ↓
[Process A] [Process B] [Process C] (En paralelo)
    ↓ ↓ ↓
[Merge] (Append)
    ↓
[Final Processing]
```

**Caso de uso:** Procesamiento paralelo, reducir tiempo de ejecución

### Patrón 5: Sub-workflow Modular

```
Main Workflow:
[Trigger]
    ↓
[Execute Workflow: "Auth & Fetch Token"]
    ↓
[Execute Workflow: "Process Business Logic"]
    ↓
[Execute Workflow: "Send Notifications"]

Sub-workflow "Auth & Fetch Token":
[Manual Trigger/Execute Workflow Trigger]
    ↓
[HTTP Request: GET /token]
    ↓
[Set: Save token to static data]
    ↓
[Return token]
```

**Caso de uso:** Lógica reutilizable, workflows complejos, mantenimiento simplificado

### Patrón 6: Loop con Pagination

```
[Manual Trigger]
    ↓
[Set: page = 1, hasMore = true]
    ↓
[Loop Over Items] (while hasMore)
    ↓
[HTTP Request: GET /api/data?page={{$json.page}}]
    ↓
[If: response.length > 0]
    ↓ True: [Set: page++, continue]
    ↓ False: [Set: hasMore = false, break]
    ↓
[Merge: All pages]
```

**Caso de uso:** Fetch de grandes datasets con paginación, APIs limitadas

### Patrón 7: Error Recovery con Retry

```
[HTTP Request]
  Settings:
    - Retry On Fail: true
    - Max Tries: 3
    - Wait Between Retries: 2000ms
    ↓ Success
[Continue Processing]
    ↓ After 3 failures
[Error Trigger] → [Alert Team] + [Log to DB]
```

**Caso de uso:** APIs inestables, operaciones críticas con fallback

---

## 10. CARACTERÍSTICAS AVANZADAS

### AI Agent con LangChain

```
[AI Agent]
  Model: OpenAI GPT-4
  Tools:
    - HTTP Request Tool (para APIs)
    - Calculator Tool
    - Custom Code Tool
  Memory: Buffer Memory
  Prompt: "You are a customer support agent..."
```

**Sub-nodes necesarios:**
- **Chat Model**: OpenAI, Anthropic, Google AI
- **Memory**: Buffer, Window, Redis (mantener contexto)
- **Tools**: Actions disponibles para el agente
- **Output Parser**: Formatear respuesta

**Caso de uso:**
- Chatbots inteligentes
- Agentes con múltiples tools
- Conversaciones con contexto

### Vector Stores y RAG

**Flujo típico:**
1. **Document Loader** → Cargar documentos (PDF, HTML, Markdown)
2. **Text Splitter** → Dividir en chunks (500 tokens con overlap 50)
3. **Embeddings** → OpenAI/Cohere embeddings
4. **Vector Store** → Pinecone/Weaviate/Supabase
5. **Retrieval** → Similarity search
6. **LLM** → Generate answer con contexto

**Configuración de Vector Store:**
```
Pinecone Vector Store:
- API Key: (credential)
- Index Name: knowledge-base
- Namespace: customer-docs
- Top K: 5 (resultados relevantes)
```

### Static Data Persistence

```javascript
// Workflow Static Data (persiste entre ejecuciones)
const staticData = this.getWorkflowStaticData('global');

// Guardar
staticData.apiToken = token;
staticData.lastSync = Date.now();
staticData.counter = (staticData.counter || 0) + 1;

// Recuperar
const lastSync = staticData.lastSync;
```

**Casos de uso:**
- Cache temporal
- Tokens de autenticación
- Contadores y estados
- Flags de control

### Split In Batches (Deprecated → Loop Over Items)

```
Loop Over Items:
  Batch Size: 100
  Pause Between Batches: 1000 ms
```

**Beneficios:**
- Control de rate limiting
- Evitar timeouts
- Procesamiento gradual

### Function y Function Item Nodes

```javascript
// Function Node (procesa todos los items)
for (const item of items) {
  item.json.processed = true;
  item.json.timestamp = Date.now();
}
return items;

// Function Item Node (procesa item por item)
$input.item.json.status = 'processed';
return $input.item;
```

**Cuándo usar Function vs Code:**
- **Code** (nuevo, recomendado): Mejor DX, autocompletado, más flexible
- **Function** (legacy): Retrocompatibilidad

---

## 11. ERRORES COMUNES Y SOLUCIONES

### Expresiones

**Error:** `Cannot read property 'json' of undefined`
```javascript
❌ Problema: $json cuando el nodo anterior no ejecutó
✅ Solución: 
  - Verificar que el nodo anterior tenga output
  - Usar optional chaining: $json?.field
  - Usar defaults: {{ $json.field ?? 'default' }}
```

**Error:** `The expression is invalid`
```javascript
❌ Problema: Sintaxis incorrecta o variable inexistente
✅ Solución:
  - Verificar {{ }} correctamente cerradas
  - Usar comillas correctas: 'string' no 'string'
  - Escapar caracteres especiales
```

**Error:** `Expression extension missing`
```javascript
❌ Problema: Función no disponible en el contexto
✅ Solución:
  - Verificar que la función existe: DateTime, Math, etc.
  - Usar Code node para lógica compleja
```

### Conectividad

**Error:** `ECONNREFUSED` en HTTP Request
```
✅ Soluciones:
  1. Verificar URL correcta
  2. Verificar firewall/network
  3. Verificar que el servicio esté activo
  4. Agregar timeout mayor
  5. Verificar authentication headers
```

**Error:** `SSL certificate problem`
```
✅ Soluciones:
  1. HTTP Request → Options → Ignore SSL Issues: true
  2. Verificar certificado del servidor
  3. Usar HTTPS en lugar de HTTP
```

**Error:** `429 Too Many Requests`
```
✅ Soluciones:
  1. Configurar Batch Size en HTTP Request
  2. Agregar Wait node entre requests
  3. Usar Loop Over Items con pauses
  4. Implementar exponential backoff en Retry
```

### Performance

**Error:** `JavaScript heap out of memory`
```
✅ Soluciones:
  1. Procesar en batches con Loop Over Items
  2. Aumentar memoria: NODE_OPTIONS=--max-old-space-size=4096
  3. Activar Queue Mode
  4. Reducir tamaño de items (eliminar campos innecesarios)
  5. Usar "Keep Only Set Fields" en Edit Fields
```

**Error:** `Execution timeout after X seconds`
```
✅ Soluciones:
  1. Aumentar EXECUTIONS_TIMEOUT
  2. Optimizar workflow (reduce API calls)
  3. Dividir en sub-workflows
  4. Activar Queue Mode
```

### Credentials

**Error:** `Credentials not found`
```
✅ Soluciones:
  1. Recrear la credencial
  2. Verificar permisos de sharing
  3. Verificar que la credencial esté asignada al nodo
  4. En workflows importados, reconectar credenciales
```

**Error:** `OAuth2 refresh token expired`
```
✅ Soluciones:
  1. Reconectar la credencial (reauth)
  2. Verificar configuración de OAuth app
  3. Verificar que los scopes sean correctos
```

### Webhooks

**Error:** `Cannot find workflow`
```
✅ Soluciones:
  1. Activar el workflow
  2. Verificar que el path sea correcto
  3. Verificar WEBHOOK_URL en configuración
  4. Revisar que el webhook node esté configurado
```

**Error:** `Workflow is not currently waiting for execution`
```
✅ Soluciones:
  1. Para Wait nodes: Verificar que el workflow esté esperando
  2. Usar $execution.resumeUrl correcto
  3. Verificar que el workflow no haya timeout
```

---

## 12. FORMATO JSON DE WORKFLOWS

### Estructura Completa

```json
{
  "name": "Example Workflow",
  "nodes": [
    {
      "parameters": {
        "url": "https://api.example.com/users",
        "method": "GET",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpBasicAuth",
        "options": {
          "timeout": 10000
        }
      },
      "id": "abc123-def456",
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [460, 300],
      "credentials": {
        "httpBasicAuth": {
          "id": "1",
          "name": "My API Credentials"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.status}}",
              "operation": "equals",
              "value2": "active"
            }
          ]
        }
      },
      "id": "ghi789-jkl012",
      "name": "If",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300]
    }
  ],
  "connections": {
    "HTTP Request": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Process Active Users",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Process Inactive Users",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "HTTP Request": [
      {
        "json": {
          "userId": 123,
          "name": "Test User",
          "status": "active"
        }
      }
    ]
  },
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": "5"
  },
  "staticData": {
    "lastSync": 1234567890,
    "apiToken": "cached-token"
  },
  "tags": [
    {
      "id": "1",
      "name": "production"
    }
  ],
  "triggerCount": 1,
  "active": true,
  "id": "10",
  "versionId": "xyz789"
}
```

### Importación/Exportación

**Exportar:**
```bash
# CLI
n8n export:workflow --id=5 --output=workflow.json
n8n export:workflow --all --output=./workflows/

# UI: Workflow menu (···) → Download
```

**Importar:**
```bash
# CLI
n8n import:workflow --input=workflow.json

# UI: Import from File/URL
```

**Copy-Paste entre workflows:**
```
1. Seleccionar nodos
2. Ctrl/Cmd + C
3. Ir a otro workflow
4. Ctrl/Cmd + V
Nota: Las credenciales no se copian, deben reconectarse
```

---

## 13. RECURSOS Y REFERENCIAS

### Documentación Oficial
- **Docs:** https://docs.n8n.io
- **Node Reference:** https://docs.n8n.io/integrations/builtin/
- **Expression Reference:** https://docs.n8n.io/code/expressions/
- **API Reference:** https://docs.n8n.io/api/

### Comunidad y Soporte
- **Community Forum:** https://community.n8n.io
- **GitHub:** https://github.com/n8n-io/n8n
- **Discord:** https://discord.gg/n8n
- **Templates/Workflows:** https://n8n.io/workflows

### Cursos y Tutoriales
- **n8n Level 1:** https://docs.n8n.io/courses/level-one/
- **n8n Level 2:** https://docs.n8n.io/courses/level-two/
- **YouTube Channel:** https://youtube.com/@n8n-io

### Community Nodes
- **npm:** Buscar "n8n-nodes-*"
- **n8n Community Nodes:** https://www.npmjs.com/search?q=n8n-nodes-

### Instalación
```bash
# npm
npm install n8n -g
n8n start

# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Docker Compose con PostgreSQL
# Ver: https://github.com/n8n-io/n8n/tree/master/docker/compose
```

---

## CONCLUSIÓN

Esta skill proporciona conocimiento exhaustivo sobre n8n para que los agentes de IA puedan:
- Diseñar workflows eficientes y escalables
- Configurar nodos y expresiones correctamente
- Implementar manejo de errores robusto
- Optimizar performance y recursos
- Seguir mejores prácticas de la industria
- Debuggear y solucionar problemas comunes
- Integrar servicios y APIs de manera segura
- Crear soluciones de automatización complejas

**Recordar:**
- Documentar workflows con nombres descriptivos y sticky notes
- Siempre configurar error handling
- Probar exhaustivamente antes de activar
- Usar modularización para workflows complejos
- Seguir principios de seguridad
- Monitorear execution history en producción