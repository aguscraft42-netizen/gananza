# Modelo de seguridad de Gananza V5

## Principio principal

El navegador puede solicitar operaciones, pero no puede decidir que una recompensa existe ni modificar un saldo. La fuente de verdad financiera es PostgreSQL.

## Capas

### Autenticación

Supabase Auth identifica al usuario. Next.js renueva cookies mediante `proxy.ts`, pero las páginas protegidas también consultan `auth.getUser()` en el servidor.

### Autorización

RLS compara `auth.uid()` con `user_id`. Los privilegios de columna impiden que el usuario cambie campos internos del perfil, aunque sea propietario de la fila.

Los permisos internos viven en `user_roles`, no en metadatos editables del usuario.

### Libro contable

`ledger_entries` es append-only. Cada movimiento contiene deltas independientes para:

- pendiente;
- disponible;
- retenido;
- retirado;
- deuda.

`wallets` es una proyección rápida actualizada dentro de la misma transacción. El ledger permite reconstruirla y auditarla.

### Retiros

El usuario no tiene permiso `INSERT` sobre `withdrawals`. Debe ejecutar `request_withdrawal`, que:

1. valida identidad y método propio;
2. bloquea la billetera con `FOR UPDATE`;
3. verifica el mínimo y el saldo;
4. crea la solicitud con idempotencia;
5. mueve saldo disponible a retenido;
6. registra evento y asiento.

Esto evita que dos retiros simultáneos gasten el mismo saldo.

### Conversiones

Solo `service_role` puede ejecutar `apply_provider_conversion`. La combinación proveedor + transacción externa es única.

Transiciones admitidas:

- nueva → pendiente;
- nueva → confirmada;
- pendiente → confirmada;
- pendiente → rechazada o revertida;
- confirmada → revertida;
- rechazada o revertida → confirmada tras revisión.

Una reversión que supera el saldo disponible crea deuda, en vez de producir un saldo disponible negativo.

### Webhooks

El endpoint genérico:

- lee el cuerpo sin modificar;
- obtiene el secreto desde el esquema `private` mediante RPC exclusiva de `service_role`;
- calcula HMAC SHA-256;
- compara con tiempo constante;
- registra el evento antes de procesarlo;
- utiliza identificador de evento y transacción para idempotencia.

Cada proveedor real requerirá adaptar encabezados, firma y mapeo de campos.

### Administración

Las funciones administrativas verifican roles `reviewer` o `admin`. Aprobar, rechazar o pagar un retiro genera:

- cambio de estado;
- movimiento financiero cuando corresponde;
- evento histórico;
- registro de auditoría.

### Secretos

- La clave `anon` puede estar en el navegador porque RLS limita su alcance.
- La clave `service_role` evita RLS y solo puede existir en el servidor.
- Los secretos de callbacks viven en `private.provider_credentials`.
- Ningún secreto debe escribirse en Git, capturas o archivos públicos.

## Antes de producción

- Verificar todas las políticas con dos usuarios distintos.
- Rotar secretos sembrados localmente.
- Agregar rate limiting y protección de bots.
- Registrar IP, dispositivo y país mediante una capa de servidor confiable.
- Configurar backups y alertas.
- Revisar retención de datos y legislación aplicable.
- Ejecutar conciliación independiente entre proveedor, conversiones, ledger y pagos.
