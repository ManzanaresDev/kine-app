# KinéPlan — Gestionnaire de Programmes d'Exercices

Application web pour kinésithérapeutes permettant de composer des programmes d'exercices par glisser-déposer, de paramétrer chaque exercice, et d'exporter le programme en PDF.

---

## Fonctionnalités

- **Bibliothèque d'exercices** — 30+ exercices classés par catégorie, filtrables et recherchables
- **CRUD exercices** — créer, éditer, supprimer des exercices depuis l'interface
- **Composition par glisser-déposer** — glisser un exercice depuis la bibliothèque vers le panneau programme
- **Paramétrage par exercice** — durée (secondes) OU répétitions + séries, selon l'exercice
- **Réorganisation** — réordonner les exercices du programme par drag & drop
- **Sauvegarde de programmes** — sauvegarder des programmes nommés en base de données
- **Export PDF** — programme imprimable à remettre ou imprimer
- **Interface responsive** — desktop et tablette

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router) + React |
| Styling | Tailwind CSS |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Export PDF | @react-pdf/renderer |
| Validation | Zod |
| Fetching | SWR |

---

## Structure du projet

```
kine-app/
├── prisma/
│   ├── schema.prisma          # Schéma BDD (Exercise + Program + ProgramExercise)
│   └── seed.ts                # Données initiales (30+ exercices)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Redirige vers /exercises
│   │   ├── exercises/
│   │   │   └── page.tsx       # Page principale : bibliothèque + programme
│   │   ├── programs/
│   │   │   ├── page.tsx       # Liste des programmes sauvegardés
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Détail / édition d'un programme
│   │   └── api/
│   │       ├── exercises/
│   │       │   ├── route.ts           # GET liste, POST création
│   │       │   └── [id]/
│   │       │       └── route.ts       # GET, PUT, DELETE exercice
│   │       └── programs/
│   │           ├── route.ts           # GET liste, POST création
│   │           └── [id]/
│   │               ├── route.ts       # GET, PUT, DELETE programme
│   │               └── pdf/
│   │                   └── route.ts   # GET export PDF
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Modal.tsx
│   │   ├── exercises/
│   │   │   ├── ExerciseLibrary.tsx    # Panneau gauche : liste + filtres + DnD source
│   │   │   ├── ExerciseCard.tsx       # Carte exercice draggable
│   │   │   ├── ExerciseFilters.tsx    # Filtres par catégorie + recherche
│   │   │   └── ExerciseForm.tsx       # Formulaire création/édition exercice
│   │   └── programs/
│   │       ├── ProgramBuilder.tsx     # Panneau droit : zone de drop + liste
│   │       ├── ProgramExerciseRow.tsx # Ligne exercice avec sets/reps/durée
│   │       └── ProgramPDF.tsx         # Template PDF
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Singleton client Prisma
│   │   └── utils.ts           # Helpers
│   │
│   ├── types/
│   │   └── index.ts           # Types TypeScript globaux
│   │
│   └── hooks/
│       ├── useExercises.ts    # Hook SWR exercices
│       └── useProgram.ts      # État local du programme en cours
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Installer les dépendances

```bash
git clone https://github.com/votre-repo/kine-app.git
cd kine-app
npm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env.local
```

Éditer `.env.local` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/kineplan"
```

### 3. Initialiser la base de données

```bash
createdb kineplan
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Lancer l'application

```bash
npm run dev
# → http://localhost:3000
```

---

## Modèle de données

```prisma
model Exercise {
  id              String           @id @default(cuid())
  name            String           @unique
  category        ExerciseCategory
  description     String?
  defaultSets     Int              @default(3)
  defaultReps     Int              @default(10)
  defaultDuration Int              @default(0)   // 0 = mode répétitions
  pathologies     String[]
  tags            String[]
}

model Program {
  id        String            @id @default(cuid())
  title     String
  notes     String?
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
  exercises ProgramExercise[]
}

model ProgramExercise {
  id         String  @id @default(cuid())
  programId  String
  exerciseId String
  sets       Int     @default(3)
  reps       Int?               // null si mode durée
  duration   Int?               // null si mode répétitions (en secondes)
  order      Int     @default(0)
}
```

### Catégories d'exercices

| Clé | Label |
|-----|-------|
| `mobility` | Mobilité |
| `strengthening` | Renforcement |
| `cardio` | Cardio |
| `balance` | Équilibre |
| `breathing` | Respiration |

---

## API Routes

### Exercices

```
GET    /api/exercises           Liste avec filtres (?category=&search=)
POST   /api/exercises           Créer un exercice
GET    /api/exercises/:id       Détail
PUT    /api/exercises/:id       Modifier
DELETE /api/exercises/:id       Supprimer
```

### Programmes

```
GET    /api/programs            Liste des programmes
POST   /api/programs            Créer un programme
GET    /api/programs/:id        Détail avec exercices
PUT    /api/programs/:id        Modifier
DELETE /api/programs/:id        Supprimer
GET    /api/programs/:id/pdf    Générer et télécharger le PDF
```

---

## Flux principal

```
Page /exercises
┌──────────────────────────┬────────────────────────────┐
│  Bibliothèque            │  Programme en cours         │
│                          │                             │
│  [Recherche]             │  Titre du programme         │
│  [Filtres catégorie]     │                             │
│                          │  ┌─ Exercice 1 ──────────┐ │
│  ┌─ ExerciceA ─┐         │  │ Séries: 3  Reps: 12   │ │
│  │  drag →     │ ──────► │  └───────────────────────┘ │
│  └─────────────┘         │                             │
│  ┌─ ExerciceB ─┐         │  ┌─ Exercice 2 ──────────┐ │
│  │  drag →     │         │  │ Séries: 2  Durée: 30s │ │
│  └─────────────┘         │  └───────────────────────┘ │
│                          │                             │
│                          │  [Sauvegarder] [PDF]        │
└──────────────────────────┴────────────────────────────┘
```

---

## Déploiement

### Vercel + Supabase

1. Créer un projet sur [Supabase](https://supabase.com) → copier `DATABASE_URL`
2. Connecter le repo sur [Vercel](https://vercel.com)
3. Ajouter `DATABASE_URL` dans les variables d'environnement Vercel
4. Exécuter `npx prisma migrate deploy` via Vercel CLI

### Docker

```bash
docker compose up -d
```

---

## Roadmap

- [ ] Auth multi-praticiens (NextAuth.js)
- [ ] Bibliothèque d'images/vidéos par exercice
- [ ] Mode hors-ligne (PWA)
- [ ] Application mobile (React Native)
- [ ] Envoi du programme par email

---

## Licence

MIT
