# Fase 2 implementada — Gananza V5

## Completado en código

- [x] Modo demo y modo Supabase automáticos.
- [x] Auth SSR y renovación de sesión.
- [x] Registro, ingreso, verificación y recuperación.
- [x] Perfil, onboarding y roles.
- [x] Migraciones versionadas.
- [x] RLS e índices de propiedad.
- [x] Catálogo y seguimiento de tareas.
- [x] Procesamiento idempotente de conversiones.
- [x] Ledger append-only.
- [x] Billetera con cinco saldos.
- [x] Retiro transaccional.
- [x] Métodos de pago propios.
- [x] Soporte transaccional.
- [x] Panel administrativo por rol.
- [x] Webhook HMAC genérico.
- [x] Simulador local protegido.
- [x] Seed y pruebas pgTAP.
- [x] Documentación de Windows y seguridad.

## Pendiente de ejecución por el propietario

- [ ] Instalar dependencias en una máquina con acceso al registro npm.
- [ ] Iniciar Docker Desktop y Supabase local.
- [ ] Ejecutar `db reset` y pgTAP.
- [ ] Crear un proyecto remoto.
- [ ] Configurar claves y URLs.
- [ ] Probar con dos usuarios y un administrador.
- [ ] Obtener aprobación de un proveedor de tareas.
- [ ] Adaptar su callback.
- [ ] Integrar pagos reales.

## Condición para pasar a Fase 3

La Fase 2 se considera validada cuando:

1. todas las migraciones aplican desde una base vacía;
2. todas las pruebas pgTAP pasan;
3. dos usuarios no pueden leer datos entre sí;
4. un callback repetido acredita una sola vez;
5. dos retiros simultáneos no superan el disponible;
6. una reversión conserva el historial;
7. el panel administrativo exige rol.
