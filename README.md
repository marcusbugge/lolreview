# LoLReview

Anonym vurderingsplattform for League of Legends spillere.

## Tech Stack

- **Next.js 16** - React framework
- **Supabase** - Database og autentisering
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI komponenter (med violet-bloom tema)
- **Riot API** - Spillerdata

## Oppsett

### 1. Installer avhengigheter

```bash
pnpm install
```

### 2. Sett opp miljøvariabler

Opprett en `.env.local` fil med følgende:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key

# Riot API
RIOT_API_KEY=din_riot_api_key
```

### 3. Sett opp Supabase database

Kjør SQL-skriptet i `supabase-schema.sql` i Supabase SQL Editor for å opprette tabellen.

### 4. Start utviklingsserver

```bash
pnpm dev
```

## Funksjoner

- 🔍 Søk etter spillere med Riot ID (navn#tag)
- ⭐ Ranger spillere med 1-5 Poros
- 💬 Legg til valgfri kommentar
- 🔒 Alle vurderinger er anonyme
- 🌙 Mørkt tema med violet aksenter

## Riot API

For å bruke appen trenger du en Riot API-nøkkel. Du kan få en på [developer.riotgames.com](https://developer.riotgames.com).
