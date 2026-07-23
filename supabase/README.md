# Supabase de Gananza V5

Esta carpeta ya no contiene un borrador: incluye migraciones versionadas, catálogo local, configuración y pruebas pgTAP.

## Contenido

- `migrations/20260723020000_initial_schema.sql`: tablas, roles, RLS, índices y triggers.
- `migrations/20260723021000_secure_operations.sql`: RPC transaccionales y procesamiento de conversiones.
- `seed.sql`: proveedores y ocho tareas ficticias para desarrollo local.
- `tests/`: controles de esquema, permisos e invariantes.
- `config.toml`: entorno local de Supabase.

## Comandos

```bash
npm install
npx supabase start
npx supabase db reset
npx supabase test db
npm run supabase:types
```

No uses los secretos de `seed.sql` en producción. Antes de integrar una red real, reemplazalos y adaptá la verificación de firma del webhook a su documentación oficial.
