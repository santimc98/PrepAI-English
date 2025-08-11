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
