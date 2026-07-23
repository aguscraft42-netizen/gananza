# Informe de validación — Gananza V5.1

Fecha: 23 de julio de 2026.

## Verificaciones completadas en este entorno

- 46 archivos TypeScript/TSX analizados sin errores sintácticos.
- Comprobación semántica interna de TypeScript con módulos externos simulados: aprobada.
- `demo.js` validado con `node --check`.
- `demo.html` parseado correctamente: 68 identificadores y ningún ID duplicado.
- `package.json`, `tsconfig.json` y `supabase/config.toml` parseados correctamente.
- Recorrido de Mercado Pago probado en Chromium, tanto en escritorio como en móvil:
  - billetera y banner de Mercado Pago;
  - selección del destino;
  - ingreso del importe;
  - revisión de titular y destino;
  - confirmación y estado “En revisión”;
  - visualización del método en Perfil;
  - acceso al panel administrativo.
- Durante las pruebas interactivas no se registraron errores JavaScript de página.
- Vista móvil revisada visualmente a 390 × 844 px.
- Tres migraciones versionadas presentes, incluida la ampliación específica para Mercado Pago.
- Cuatro suites pgTAP presentes, incluida `004_mercado_pago.sql`.
- Revisión estática de RLS, funciones transaccionales, índice de retiro activo, triggers de validación y flujo administrativo.
- Revisión de secretos: no se incluyeron claves privadas reales.

## Controles incorporados en V5.1

- Alias o CVU normalizado, enmascarado y resumido mediante SHA-256.
- Titular y DNI/CUIL/CUIT requeridos para Mercado Pago.
- Espera de 24 horas luego de modificar un destino de retiro.
- Un único retiro activo por usuario.
- Detección de varias cuentas que intentan usar el mismo destino.
- Snapshot del destino en cada retiro para preservar la auditoría.
- Referencia de transferencia obligatoria antes de marcar un retiro como pagado.
- Campos de comprobante y fecha efectiva del pago.
- Libro contable y auditoría sin eliminación del historial.

## Verificaciones pendientes en la computadora del propietario

No se pudieron ejecutar en este contenedor porque la instalación de dependencias agotó el tiempo de conexión y no hay una instancia PostgreSQL/Supabase local disponible:

1. `npm install`
2. `npm run typecheck`
3. `npm run build`
4. `npx supabase start`
5. `npx supabase db reset`
6. `npx supabase test db`

Las pruebas pgTAP están incluidas, pero el resultado definitivo depende de aplicar las migraciones sobre una base Supabase/PostgreSQL vacía.

## Criterios de aceptación al conectar Supabase

- Las tres migraciones aplican desde una base vacía.
- Las cuatro suites pgTAP terminan correctamente.
- Dos usuarios no pueden leer datos entre sí.
- Una conversión repetida no acredita dos veces.
- Dos retiros simultáneos no gastan el mismo saldo.
- Un usuario no puede falsificar el destino enmascarado.
- El cambio de alias o CVU activa la espera de 24 horas.
- No puede existir más de un retiro activo por usuario.
- Un retiro no puede marcarse como pagado sin referencia de transferencia.
- Un usuario común no puede entrar al panel administrativo.
- Un rol `support` ve operaciones, pero no aprueba ni paga retiros.
