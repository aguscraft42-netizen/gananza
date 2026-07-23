# Retiros a Mercado Pago — Gananza V5.1

## Alcance actual

Gananza utiliza Mercado Pago como método principal de retiro para Argentina. En la beta, la transferencia se realiza manualmente desde una cuenta operativa y se confirma desde el panel administrativo.

El logo de Mercado Pago se muestra únicamente para que el usuario identifique el destino. Gananza no afirma una asociación comercial ni utiliza credenciales de Mercado Pago dentro de la aplicación.

## Flujo del usuario

1. Guarda alias o CVU, titular y DNI/CUIL/CUIT.
2. El destino se normaliza, se enmascara y se genera una huella SHA-256 para controles antifraude.
3. Un destino nuevo o modificado queda bajo una espera de seguridad de 24 horas.
4. El usuario solicita un retiro desde saldo confirmado.
5. La función transaccional mueve el importe de disponible a retenido.
6. Se guarda una copia inmutable y enmascarada del destino dentro del retiro.
7. Un revisor valida identidad, destino y riesgo.
8. Después de transferir, el revisor carga la referencia de la operación y el nombre del comprobante.
9. Recién entonces el retiro cambia a pagado y el ledger mueve retenido a retirado.

## Controles incorporados

- Un solo retiro activo por usuario.
- Retiro mínimo configurable actualmente fijado en ARS 5.000.
- Idempotencia para evitar solicitudes duplicadas.
- Cooldown por cambios de destino.
- Detección de un mismo alias/CVU utilizado por cuentas distintas.
- Registro de auditoría para toda transición administrativa.
- Referencia de transferencia obligatoria antes de marcar un retiro como pagado.
- Datos completos protegidos por RLS; la interfaz muestra valores enmascarados.
- Mercado Pago recomendado, con transferencia bancaria como alternativa.

## Lo que todavía no hace

- No envía transferencias automáticamente.
- No inicia sesión en Mercado Pago.
- No almacena contraseñas ni tokens de Mercado Pago.
- No valida en tiempo real que el alias/CVU exista.
- No sube todavía el archivo del comprobante a Supabase Storage; la base ya incluye los campos para vincularlo.

## Próxima implementación con Supabase

1. Ejecutar las migraciones.
2. Crear un bucket privado `withdrawal-receipts`.
3. Permitir carga de comprobantes solo a roles `reviewer` y `admin`.
4. Generar enlaces firmados para soporte y auditoría.
5. Probar usuarios separados, doble retiro y alias compartidos.
