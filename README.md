# PrepAI-English
Aplicación para preparar exámenes de certificación de ingles de Cambridge con Inteligencia Artificial

## Entorno

1) Crea `.env` a partir de `.env.example` y rellena:
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

2) Instala dependencias y arranca en desarrollo:
```
npm i
npm run dev
```

## Comandos útiles
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Export web: `npm run build:web`

## CI (GitHub Actions)
El workflow `.github/workflows/ci.yml` ejecuta:
- Instalación (`npm ci`)
- Lint
- Typecheck
- Export web (`expo export`)

El build web usa placeholders de variables públicas. Para producción, define Secrets/Variables del repositorio con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Persistencia en Supabase

### 1. Configurar base de datos
1. Abrir Supabase → SQL Editor
2. Pegar contenido de `supabase/schema.sql` → Run
3. Verificar que se crearon las tablas: `profiles`, `exams`, `attempts`, `attempt_answers`
4. Nuevo: `profiles.default_level` (B1/B2/C1/C2). Si tu proyecto ya existía, vuelve a ejecutar `supabase/schema.sql` o añade manualmente la columna:
   ```sql
   alter table public.profiles add column if not exists default_level text check (default_level in ('B1','B2','C1','C2'));
   ```

### 2. Configurar autenticación
1. Authentication → URL Configuration
2. Añadir redirects:
   - `prepaienglish://auth/callback`
   - `exp://127.0.0.1:8081/--/auth/callback`
   - `exp://<IP_LAN>:8081/--/auth/callback`
   - `http://localhost:8081/auth/callback`

### 3. Configurar providers OAuth
1. Authentication → Providers
2. Google: configurar Client ID y Client Secret
3. Apple: configurar Services ID y Return URL

### 4. Desplegar Edge Function
1. Edge Functions → Create `generate-exam`
2. Pegar contenido de `supabase/functions/generate-exam/index.ts`
3. Deploy

### 5. Configurar variables locales
1. Crear `.env` desde `.env.example`
2. Rellenar:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   EXPO_PUBLIC_USE_SUPABASE=true
   ```

### 6. Probar
1. `npm i && npm run dev`
2. Login con Google
3. Ejecutar mock → verificar en Progress (nube)
4. Sin sesión/env → Progress usa intentos locales

## Onboarding de nivel

- Primera vez sin `pref:defaultExamLevel` → se abre `onboarding/level` para elegir B1/B2/C1/C2.
- Se guarda en AsyncStorage y, si hay sesión Supabase, también en `profiles.default_level`.
- En Ajustes puedes cambiarlo (abre onboarding en modo edición con confirmación).
- La generación de exámenes usa este nivel por defecto (fallback: B2).
