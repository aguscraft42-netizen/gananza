# Próximo paso — conectar Supabase

Gananza V5.1 ya cierra el flujo previo a la base real, incluido Mercado Pago.

1. Descomprimir el proyecto.
2. Ejecutar `npm install`.
3. Crear un proyecto de Supabase o levantar Supabase local.
4. Copiar `.env.example` a `.env.local`.
5. Ejecutar `npx supabase db reset` en local o `npx supabase db push` contra el proyecto vinculado.
6. Ejecutar `npm run supabase:test`.
7. Probar registro, método Mercado Pago, cooldown, saldo, retiro y pago administrativo.
8. Crear el bucket privado `withdrawal-receipts` antes de aceptar comprobantes reales.

Después de estas pruebas se integra el primer proveedor de tareas.
