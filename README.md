# Gananza V5.1 — Supabase Ready + Mercado Pago

Gananza V5.1 conserva la experiencia visual de la V4, agrega la primera arquitectura real de backend y deja preparado el retiro manual a Mercado Pago para la beta argentina. Puede abrirse en **modo demo** sin claves o conectarse a un proyecto de **Supabase** mediante variables de entorno.

## Qué quedó implementado

- Supabase Auth con registro, inicio, verificación por correo, cierre y recuperación de contraseña.
- Sesiones SSR para Next.js 16 mediante `@supabase/ssr` y `proxy.ts`.
- Onboarding persistente por usuario.
- Catálogo real de tareas y sesiones de seguimiento.
- Webhooks con HMAC SHA-256, registro idempotente y callback genérico.
- Conversiones pendientes, confirmadas, rechazadas y revertidas.
- Libro contable inmutable con saldos pendiente, disponible, retenido, retirado y deuda.
- Solicitud de retiro transaccional para evitar doble gasto.
- Métodos de retiro protegidos por RLS.
- Tickets con primer mensaje creado en la misma transacción.
- Roles `user`, `support`, `reviewer` y `admin`.
- Panel administrativo con métricas y transiciones de retiro.
- Alertas antifraude y auditoría inmutable.
- Migraciones, seed, configuración local y pruebas pgTAP.
- Endpoint de salud en `/api/health`.
- Mercado Pago como método recomendado para Argentina, con logo identificatorio.
- Alias/CVU, titular y documento con validación, enmascaramiento y cooldown de seguridad.
- Detección antifraude de un mismo destino utilizado por cuentas distintas.
- Referencia de transferencia obligatoria y campos preparados para comprobante.

## Modo demo

No requiere instalar ni configurar Supabase para recorrer el producto visual.

- Abrí `demo.html`, o
- ejecutá `ABRIR_GANANZA.bat` en Windows.

La demo estática no usa dinero ni usuarios reales.

## Modo Next.js sin Supabase

```bash
npm install
npm run dev
```

Sin variables de Supabase, la aplicación usa automáticamente los datos ficticios de `lib/demo-data.ts`.

## Modo Supabase local

1. Copiá `.env.example` como `.env.local`.
2. Iniciá Docker Desktop.
3. Ejecutá:

```bash
npm install
npx supabase start
npx supabase db reset
```

4. Copiá la URL, la clave pública y la clave de servicio que muestra Supabase local:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

5. Iniciá la aplicación:

```bash
npm run dev
```

6. Abrí `http://localhost:3000/acceso` y creá una cuenta.

Los correos locales aparecen en Inbucket, normalmente en `http://127.0.0.1:54324`.

## Pruebas y tipos

```bash
npm run typecheck
npx supabase test db
npm run supabase:types
```

El último comando crea `lib/supabase/database.generated.ts` desde la base local. Conviene repetirlo después de cada cambio de esquema.

## Dar rol administrativo a una cuenta local

Después de registrar el usuario, obtené su UUID desde Supabase Studio y ejecutá:

```sql
insert into public.user_roles (user_id, role)
values ('UUID-DEL-USUARIO', 'admin')
on conflict do nothing;
```

Cerrá y volvé a abrir sesión para entrar a `/admin`.

## Estructura principal

```text
app/
  api/                       Route handlers seguros
  auth/                      Callback y acciones de autenticación
  dashboard/ tareas/ ...     Producto
components/                  Componentes visuales y formularios
lib/
  gananza/server-data.ts     Capa dual demo/Supabase
  supabase/                  Clientes browser, server, admin y Proxy
supabase/
  migrations/                Esquema y operaciones transaccionales
  tests/                     pgTAP
  seed.sql                   Catálogo local
```

## Seguridad importante

- `SUPABASE_SECRET_KEY` se usa únicamente en módulos y Route Handlers del servidor.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` se aceptan sólo como fallback temporal.
- Nunca debe llevar el prefijo `NEXT_PUBLIC_`.
- El navegador no puede insertar conversiones, editar billeteras ni crear asientos contables.
- Los retiros se crean mediante `request_withdrawal`, que bloquea la billetera y retiene el saldo en una transacción.
- Los callbacks repetidos usan identificadores únicos y no acreditan dos veces.
- Las tablas financieras y de auditoría son append-only desde la API.

## Qué falta para una beta real

- Crear o vincular tu proyecto Supabase.
- Revisar el esquema con Supabase local y ejecutar todas las pruebas.
- Definir textos legales y datos del responsable.
- Reemplazar proveedores ficticios por una red aprobada.
- Adaptar la firma y los campos del webhook al proveedor elegido.
- Incorporar controles reales de IP, dispositivo, VPN y conciliación.
- Ejecutar las transferencias de la beta manualmente y cargar referencia/comprobante desde el panel. La automatización de pagos queda para una etapa posterior.

Leé `docs/SUPABASE_SETUP_WINDOWS.md`, `docs/SECURITY_MODEL.md` y `docs/WEBHOOK_CONTRACT.md` antes de conectar servicios reales.


## Mercado Pago en la beta

El flujo previsto es manual y auditable: el usuario solicita el retiro, Gananza retiene el saldo, un revisor valida la cuenta, realiza la transferencia y registra la referencia. La aplicación no solicita credenciales de Mercado Pago ni automatiza la app externa.

Consultá `MERCADO_PAGO_WITHDRAWALS.md` y la migración `20260723030000_mercado_pago_withdrawals.sql`.

## Archivo `.env.local` incluido

Esta edición incluye un `.env.local` vacío y seguro. En Windows, ejecutá `EDITAR_ENV_LOCAL.bat`, pegá las credenciales de tu proyecto y cambiá `NEXT_PUBLIC_APP_MODE=demo` por `NEXT_PUBLIC_APP_MODE=supabase`. El archivo está ignorado por Git y no contiene claves reales.
