# Gananza V5

## Backend y seguridad

- Se incorporó Supabase Auth SSR para Next.js 16.
- Se creó Proxy para renovar cookies y proteger rutas.
- Se agregaron dos migraciones completas con RLS, índices y roles.
- Se implementó ledger append-only y billetera transaccional.
- Se agregó deuda por reversiones que superen el saldo disponible.
- Se implementaron retiros idempotentes y bloqueo contra doble gasto.
- Se agregaron tickets, dispositivos, fraude y auditoría.
- Se añadió webhook HMAC genérico y simulador local protegido.

## Producto

- El panel toma perfil, saldos, tareas y movimientos desde Supabase cuando está configurado.
- El catálogo inicia sesiones reales mediante RPC.
- Perfil permite guardar métodos de retiro.
- Billetera solicita retiros reales al backend.
- Soporte crea tickets persistentes.
- Administración muestra métricas y puede revisar retiros según rol.
- Sin variables de entorno, todas las pantallas continúan funcionando en modo demo.
