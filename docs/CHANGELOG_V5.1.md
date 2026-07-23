# Gananza V5.1

## Mercado Pago

- Mercado Pago pasa a ser el método recomendado para Argentina.
- Logo visible en perfil, onboarding, billetera, retiro y administración.
- Alta mediante alias o CVU, titular y documento.
- Validación de formatos en cliente y base de datos.
- Enmascaramiento automático del destino.
- Huella SHA-256 para detectar destinos compartidos sin mostrar el dato completo.
- Espera de seguridad de 24 horas al crear o modificar un destino.
- Un solo retiro activo por usuario.
- Snapshot inmutable del destino al solicitar el retiro.
- Referencia de transferencia obligatoria antes de marcar como pagado.
- Campos preparados para comprobante y fecha de envío.
- Panel administrativo actualizado para registrar el pago manual.

## Producto y experiencia

- Banner específico de Mercado Pago en Billetera.
- Flujo de retiro con timeline: solicitado, revisión y transferencia.
- Mercado Pago priorizado sobre transferencia bancaria.
- Avisos claros sobre revisión manual y ausencia de asociación comercial.
- Demo estática actualizada con el recorrido completo.

## Supabase

- Nueva migración `20260723030000_mercado_pago_withdrawals.sql`.
- Nueva suite pgTAP `004_mercado_pago.sql`.
- Tipos TypeScript actualizados.
