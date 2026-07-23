# Configuración de Gananza V5 con Supabase en Windows

## 1. Requisitos

- Node.js 22 o compatible.
- Docker Desktop funcionando con WSL2.
- Una terminal abierta en la carpeta del proyecto.

Comprobación:

```powershell
node -v
docker version
```

## 2. Instalar dependencias

```powershell
npm install
```

## 3. Iniciar Supabase local

```powershell
npx supabase start
```

La primera ejecución descarga imágenes de Docker. Al finalizar verás, entre otros datos:

- API URL.
- anon key.
- service_role key.
- Studio URL.
- Inbucket URL.

## 4. Crear `.env.local`

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Completá:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=PEGAR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=PEGAR_SERVICE_ROLE_KEY
GANANZA_ENABLE_DEV_TOOLS=false
GANANZA_DEV_CALLBACK_SECRET=
```

No subas `.env.local` a Git.

## 5. Recrear la base

```powershell
npx supabase db reset
```

Esto ejecuta las migraciones y carga `supabase/seed.sql`.

## 6. Ejecutar pruebas

```powershell
npx supabase test db
npm run typecheck
```

## 7. Levantar Gananza

```powershell
npm run dev
```

Abrí:

- Aplicación: `http://localhost:3000`
- Supabase Studio: `http://127.0.0.1:54323`
- Correos locales: `http://127.0.0.1:54324`
- Salud de la app: `http://localhost:3000/api/health`

## 8. Crear y verificar una cuenta

1. Entrá a `/acceso`.
2. Registrá un correo.
3. Abrí Inbucket.
4. Tocá el enlace de confirmación.
5. Completá el onboarding.

El trigger `on_auth_user_created` crea automáticamente:

- perfil;
- billetera;
- rol `user`.

## 9. Crear un método de retiro

Desde Perfil, agregá Mercado Pago o transferencia. La interfaz muestra el destino enmascarado; el dato pertenece únicamente al usuario por RLS.

## 10. Simular una conversión local

Activá temporalmente:

```env
GANANZA_ENABLE_DEV_TOOLS=true
GANANZA_DEV_CALLBACK_SECRET=un-secreto-local-largo
```

Reiniciá Next.js y ejecutá, reemplazando UUIDs:

```powershell
$body = @{
  providerSlug = "gananza-demo"
  transactionId = "dev-001"
  userId = "UUID_USUARIO"
  offerId = "a0000000-0000-4000-8000-000000000001"
  status = "pending"
  grossAmount = 7000
  userReward = 4200
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3000/api/dev/conversions `
  -Headers @{ "x-gananza-dev-secret" = "un-secreto-local-largo" } `
  -ContentType "application/json" `
  -Body $body
```

Repetí con la misma `transactionId` y `status = "confirmed"`. El primer evento suma saldo pendiente y el segundo lo traslada a disponible.

Desactivá las herramientas de desarrollo al terminar.

## 11. Habilitar administración

En Studio → SQL Editor:

```sql
insert into public.user_roles (user_id, role)
values ('UUID_USUARIO', 'admin')
on conflict do nothing;
```

## 12. Vincular un proyecto remoto

Cuando el entorno local funcione:

```powershell
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Después configurá en el panel remoto:

- Site URL.
- Redirect URLs.
- Confirmación de correo.
- Secretos del servidor en tu hosting.

No ejecutes `seed.sql` en producción sin revisar los proveedores ficticios y sus secretos.
