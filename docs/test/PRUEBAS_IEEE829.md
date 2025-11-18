# Pruebas y Métricas — IEEE 829:1998 (SistemaPracticaProfesional)

Este único documento consolida los artefactos IEEE 829 necesarios: Plan de Pruebas, Diseño, Casos, Procedimientos, Log/Registro, Reporte de Incidentes, Resumen de Pruebas, Métricas y Matriz de Trazabilidad.

---

## 1) Plan de Pruebas (IEEE 829)
ID: PLAN_V1

- Alcance: Backend API (login, clientes, órdenes, técnicos, reclamos) y flujos UI críticos a futuro.
- Exclusiones: UI de reclamos por ahora; performance a gran escala; compatibilidad legacy.
- Enfoque: smoke API automatizado + ejecución manual guiada por procedimientos.
- Criterios Go/No-Go (release candidato): PASS-RATE ≥ 95%, 0 críticos abiertos, API-COV ≥ 60% (bootstrap).
- Ambiente: Node.js, MySQL, Chrome en Windows.
- Riesgos: cambios de DB, datos inconsistentes, baja automatización inicial.
- Cronograma: 2 días bootstrap (smoke), 3 días cobertura CRUD, 2 días consolidación.

---

## 2) Diseño de Pruebas (IEEE 829)
ID: DISENO_V1

- Funcionalidades: /login; /api/clientes (CRUD); /api/ordenes (CRUD, /agenda, /:id); /api/tecnicos (CRUD, /:id/ordenes, asignar-orden); /api/reclamos (CRUD).
- Técnicas: particiones de equivalencia, valores límite, contratos de API (status, esquema básico), negativos 400/404/500.
- Entradas/Salidas por feature: CRUD secuencial; negativos por ID inexistente y campos obligatorios.
- Dependencias: DB accesible; dataset semilla recomendado.

---

## 3) Métricas (definición, fórmula, umbrales)
- REQ-COV = requisitos cubiertos / requisitos totales; objetivo ≥ 85% (críticos ≥ 95%).
- API-COV = endpoints probados / endpoints montados; objetivo ≥ 80% (bootstrap ≥ 60%).
- UI-COV = flujos automatizados / flujos críticos; objetivo ≥ 70% inicial.
- CODE-COV (nyc): Líneas ≥ 70%, Ramas ≥ 60% (objetivo progresivo).
- PASS-RATE = OK / ejecutados ≥ 95% para release.
- BLOCK-RATE = bloqueados / planificados ≤ 5%.
- DEF-DENS = defectos / KLOC < 0.8.
- DRE = defectos corregidos pre / (pre+post) ≥ 90%.
- API-P95 (k6): GET ≤ 300 ms, mutaciones ≤ 500 ms.
- API-ERR ≤ 1%; VULN críticas = 0; A11Y ≥ 90.

Baseline del proyecto:
- Páginas: 8 | CSS: 10 | JS: 6
- Endpoints montados: 23 (clientes 5, órdenes 6, técnicos 7, reclamos 5).

---

### 3.1) Snapshot de métricas (última ejecución automática)
Fecha: 2025-11-07  
Build: local | NODE_ENV=test

- Suites: 7/7 PASSED (100%)  
- Tests: 59/59 PASSED (PASS-RATE = 100%)  
- API endpoints probados: 21/23 (API-COV = 91.30%)  
	- Clientes: 5/5 (POST, GET, GET/:id, PUT, DELETE)
	- Órdenes: 6/6 (POST, GET, GET/agenda, GET/:id, PUT, DELETE)
	- Técnicos: 5/7 (POST, GET, GET/:id, GET /:id/ordenes, POST /:id/asignar-orden)
	- Reclamos: 5/5 (POST, GET, GET/:id, PUT, DELETE)
	- Extra: /login cubierto en pruebas (no contado en los 23).

- Code coverage (jest --coverage):  
	- Líneas: 80.66%  
	- Statements: 80.50%  
	- Funciones: 92.45%  
	- Ramas: 75.62%

- Incidentes abiertos críticos: 0  
- Bloqueos de prueba: 0  


Notas de objetivo vs actual:  
- PASS-RATE cumple umbral de release (≥95%).  
- API-COV supera el objetivo (≥80%).  
- CODE-COV supera metas progresivas (Líneas ≥70%, Ramas ≥60%).

## 4) Casos de Prueba (especificación)
Formato: ID | Título | Objetivo | Precondiciones | Pasos | Datos | Esperado | Prioridad

### Login
- TC-LOGIN-001 | Login válido | Aceptar credenciales correctas | Usuario válido | POST /login | {username,password} | 200 + user | Alta
- TC-LOGIN-002 | Usuario inválido | Rechazar usuario inexistente | - | POST /login | {fakeUser,pass} | 401 | Alta
- TC-LOGIN-003 | Password incorrecta | Rechazar password errónea | Usuario existe | POST /login | {user,wrong} | 401 | Media

### Clientes (CRUD)
- TC-CLI-001 | Crear cliente | Crear registro | CUIT único | POST /api/clientes | {razon_social,cuit} | 200 | Alta
- TC-CLI-002 | Validación obligatorios | Rechazar faltantes | - | POST /api/clientes | {cuit} | 400 | Alta
- TC-CLI-003 | Listar | Obtener todos | - | GET /api/clientes | - | 200 array | Media
- TC-CLI-004 | Obtener por ID | Acceder registro | ID existente | GET /api/clientes/{id} | - | 200 objeto | Alta
- TC-CLI-005 | Obtener inexistente | Manejar 404 | - | GET /api/clientes/999999 | - | 404 | Media
- TC-CLI-006 | Actualizar | Modificar datos | ID existente | PUT /api/clientes/{id} | cambios | 200 | Alta
- TC-CLI-007 | Eliminar | Eliminar registro | ID existente | DELETE /api/clientes/{id} | - | 200 | Alta

### Órdenes (CRUD + Agenda)
- TC-ORD-001 | Crear orden | Crear | - | POST /api/ordenes | {descripcion,fecha_servicio} | 200 | Alta
- TC-ORD-002 | Listar | Obtener todas | - | GET /api/ordenes | - | 200 array | Media
- TC-ORD-003 | Obtener por ID | Acceder | ID existente | GET /api/ordenes/{id} | - | 200 | Alta
- TC-ORD-004 | Actualizar | Modificar | ID existente | PUT /api/ordenes/{id} | cambios | 200 | Alta
- TC-ORD-005 | Eliminar | Eliminar | ID existente | DELETE /api/ordenes/{id} | - | 200 | Alta
- TC-ORD-006 | Agenda | Filtrar con fecha | Hay órdenes con fecha | GET /api/ordenes/agenda | - | 200 array | Media

### Técnicos (CRUD + Asignación)
- TC-TEC-001 | Crear técnico | Crear | Campos mínimos | POST /api/tecnicos | {nombre,apellido,usuario,password} | 200 | Alta
- TC-TEC-002 | Validación | Campos obligatorios | - | POST /api/tecnicos | {nombre} | 400 | Alta
- TC-TEC-003 | Listar | Obtener | - | GET /api/tecnicos | - | 200 array | Media
- TC-TEC-004 | Obtener por ID | Acceder | ID existente | GET /api/tecnicos/{id} | - | 200 | Alta
- TC-TEC-005 | Actualizar | Modificar | ID existente | PUT /api/tecnicos/{id} | cambios | 200 | Alta
- TC-TEC-006 | Eliminar | Inactivar/eliminar | ID existente | DELETE /api/tecnicos/{id} | - | 200 | Alta
- TC-TEC-007 | Órdenes asignadas | Ver | Técnico con órdenes | GET /api/tecnicos/{id}/ordenes | - | 200 array | Media
- TC-TEC-008 | Asignar orden | Asociar | Existen IDs | POST /api/tecnicos/{id}/asignar-orden | {ordenId} | 200 | Alta

### Reclamos (CRUD)
- TC-REC-001 | Crear reclamo | Crear | cliente_id válido | POST /api/reclamos | {cliente_id,descripcion} | 200 | Alta
- TC-REC-002 | Validación | Rechazar sin cliente_id | - | POST /api/reclamos | {descripcion} | 400 | Alta
- TC-REC-003 | Listar reclamos | Obtener | - | GET /api/reclamos | - | 200 array | Media
- TC-REC-004 | Obtener por ID | Acceder | ID existente | GET /api/reclamos/{id} | - | 200 | Alta
- TC-REC-005 | Eliminar | Eliminar | ID existente | DELETE /api/reclamos/{id} | - | 200 | Media

---

## 5) Procedimientos (IEEE 829)
- PR-LOGIN-001: POST /login con usuario válido → 200 + user.
- PR-CLI-CRUD-001: POST /api/clientes válido → 200; luego GET y verificar presencia.
- PR-ORD-AGEN-001: Crear orden con fecha futura → GET /api/ordenes/agenda incluye la orden.
- PR-TEC-ASIG-001: POST /api/tecnicos/{id}/asignar-orden → 200; GET /api/tecnicos/{id}/ordenes contiene orden.
- PR-REC-CRUD-001: POST /api/reclamos válido → 200; GET /api/reclamos muestra registro.

---

## 6) Registro de Pruebas (Test Log)
Campos: Fecha | Build | Ambiente | Caso | Resultado (OK/FAIL/BLOCK) | Evidencia | Defecto ID | Duración (ms) | Comentarios

Ejemplos:
- 2025-11-07 | build-001 | local | TC-LOGIN-001 | OK | captura.png | - | 120 | Latencia normal.
- 2025-11-07 | build-001 | local | TC-ORD-006 | BLOCK | - | DEF-002 | 0 | 500 en /agenda.

Totales (día): Ejecutados, OK, FAIL, BLOCK, PASS-RATE, BLOCK-RATE.

---

## 7) Reporte de Incidente (TEMPLATE)
ID: DEF-XXX | Título | Severidad (Crítico/Alto/Medio/Bajo) | Prioridad
- Pasos para reproducir
- Resultado actual / esperado
- Evidencias (logs/payloads)
- Impacto
- Estado: Nuevo/En análisis/En corrección/Verificado/Cerrado

---

## 8) Resumen de Pruebas (IEEE 829)
- Período y builds cubiertos
- Coberturas: API-COV, CODE-COV, UI-COV
- Métricas: PASS-RATE, BLOCK-RATE, DEF-DENS, DRE, API-P95, VULN-COUNT
- Defectos por severidad, incidentes relevantes, riesgos remanentes
- Recomendación: Go / Conditional-Go / No-Go

---

## 9) Matriz de Trazabilidad (resumen)
| RequisitoID | Descripción | CasoPruebaID |
|-------------|-------------|--------------|
| RQ-LOGIN-001 | Login usuario válido | TC-LOGIN-001 |
| RQ-CLI-CRUD-001 | Crear cliente válido | TC-CLI-001 |
| RQ-ORD-AGEN-001 | Agenda de órdenes | TC-ORD-006 |
| RQ-TEC-ASIG-001 | Asignar técnico a orden | TC-TEC-008 |
| RQ-REC-CRUD-001 | Crear reclamo válido | TC-REC-001 |

---

## 10) Recolección de métricas
- Fuente primaria: Registro de Pruebas (este documento o CSV externo), reportes de test automatizados.
- Consolidación: completar en Resumen de Pruebas con objetivos/umbrales.

---

## Anexo A — Explicación simple de las pruebas

Este anexo resume, en términos sencillos, qué se está probando, cómo se prueban las cosas y con qué herramientas.

1) ¿Qué se prueba?
- La API del backend: rutas para clientes, órdenes, técnicos y reclamos. También el login.
- Se verifica que cada ruta responda (por ejemplo, 200 OK) y que devuelva datos en el formato esperado (arrays u objetos JSON).
- Se prueba tanto crear datos (POST) como leerlos (GET). Más adelante sumamos actualizar (PUT) y eliminar (DELETE), y casos negativos (errores 400/404/500).

2) ¿Cómo se prueban?
- De forma automática con una suite de “smoke tests” (pruebas rápidas) que se ejecuta con un solo comando.
- Los tests llaman a los endpoints como si fueran un cliente real, enviando y recibiendo JSON.
- Se usan datos simples y generados al vuelo (por ejemplo, CUIT único) para evitar choques con datos anteriores.

3) ¿Con qué herramientas?
- Jest: framework de pruebas en JavaScript.
- Supertest: permite hacer requests HTTP a la app sin levantar un servidor externo.
- MySQL/MariaDB: base de datos donde la API guarda y lee la información.

4) ¿Qué valida cada prueba (ejemplos)?
- Clientes
	- POST /api/clientes: crea un cliente nuevo (espera 200 y un mensaje de éxito).
	- GET /api/clientes: devuelve una lista (espera 200 y un array).
	- GET /api/clientes/:id: devuelve un cliente (si existe) o 404 si no.
- Órdenes
	- POST /api/ordenes: crea una orden; la suite agrega fecha de servicio para poder verla luego en la agenda.
	- GET /api/ordenes y GET /api/ordenes/agenda: obtienen todas y las próximas con fecha, respectivamente.
- Técnicos
	- POST /api/tecnicos: crea un técnico con los campos mínimos.
	- GET /api/tecnicos: lista los técnicos.
- Reclamos
	- POST /api/reclamos: crea un reclamo asociado a un cliente existente.
	- GET /api/reclamos: lista los reclamos.

5) ¿Qué sale del “reporte” de pruebas?
- PASS-RATE: porcentaje de tests que pasaron.
- API-COV: cuántos endpoints fueron ejercitados por los tests.
- Code coverage: cuánto del código fue ejecutado por los tests (líneas, funciones y ramas).

6) ¿Cómo corro las pruebas yo mismo?
- Abrí una terminal en la carpeta del proyecto y ejecutá:
	- npm test  → corre los tests.
	- npm run coverage  → corre tests y muestra cobertura de código.

7) ¿Qué sigue para mejorar?
- Completar los CRUD faltantes (PUT/DELETE) en las pruebas.
- Agregar casos negativos (faltan campos → 400, id inexistente → 404, errores controlados → 500) para cubrir más ramas.
- Usar un “seed” (datos iniciales) estable para que los resultados sean 100% reproducibles.

