# 🏗️ Arquitectura del Proyecto Miamente Platform

**Versión:** 2.0.0  
**Fecha:** 12 de Octubre de 2025  
**Confidencial:** Este documento contiene información técnica interna del proyecto

---

## 📖 Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Backend - FastAPI](#backend---fastapi)
4. [Frontend - Next.js](#frontend---nextjs)
5. [Base de Datos - PostgreSQL](#base-de-datos---postgresql)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Infraestructura y DevOps](#infraestructura-y-devops)
8. [Patrones de Diseño](#patrones-de-diseño)
9. [Seguridad](#seguridad)
10. [Escalabilidad](#escalabilidad)

---

## 🎯 Visión General

### Propósito del Sistema

Miamente Platform es una **plataforma de salud mental** que facilita la conexión entre pacientes y profesionales de la salud mental, proporcionando:

- Gestión de perfiles de usuarios y profesionales
- Búsqueda y filtrado de profesionales
- Sistema de roles y permisos
- Panel de administración completo
- Catálogos configurables sin código

### Principios Arquitectónicos

1. **Separación de Concerns:** Frontend/Backend completamente desacoplados
2. **RESTful API:** Comunicación mediante API REST estándar
3. **Single Source of Truth:** Base de datos como única fuente
4. **Tipo-Seguridad:** TypeScript en frontend, Pydantic en backend
5. **Test-Driven:** 383 tests automatizados

---

## 🏛️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                 │
│   (Navegadores Web: Chrome, Safari, Firefox, Edge)              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Server Components (RSC)                                 │   │
│  │  ├── Landing Page                                        │   │
│  │  ├── Auth Pages (Login/Register)                         │   │
│  │  └── Static Content                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Client Components                                       │   │
│  │  ├── Dashboards (User/Professional/Admin)               │   │
│  │  ├── Profile Management                                  │   │
│  │  ├── Search & Filters                                    │   │
│  │  └── Admin Panels                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  State Management                                        │   │
│  │  ├── React Context (Auth, Theme)                         │   │
│  │  ├── React Hooks (Custom)                                │   │
│  │  └── Local Storage (Tokens)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Client (Fetch API)                                  │   │
│  │  └── JWT Token Management                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (JSON)
                         │ JWT Authentication
┌────────────────────────┴────────────────────────────────────────┐
│                   BACKEND (FastAPI 0.115.6)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Layer (FastAPI)                                     │   │
│  │  ├── Routers (api.py)                                    │   │
│  │  ├── Endpoints (9 módulos)                               │   │
│  │  ├── Dependencies (Auth, DB)                             │   │
│  │  └── Middleware (CORS, Error Handling)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Business Logic Layer                                    │   │
│  │  ├── Services (9 servicios)                              │   │
│  │  │   ├── AccountService (gestión de cuentas)            │   │
│  │  │   ├── RoleService (gestión de roles)                 │   │
│  │  │   └── Catalog Services (especialidades, etc.)        │   │
│  │  └── Utils (auth, response helpers)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Data Layer                                              │   │
│  │  ├── Models (SQLAlchemy - 11 modelos)                   │   │
│  │  ├── Schemas (Pydantic - 40+ schemas)                   │   │
│  │  └── ORM (SQLAlchemy Session)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Core Layer                                              │   │
│  │  ├── Config (Settings)                                   │   │
│  │  ├── Database (Connection Pool)                          │   │
│  │  └── Security (JWT, Passwords)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ SQLAlchemy ORM
                         │ Connection Pool
┌────────────────────────┴────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL 16+)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Sistema de Cuentas Unificadas                           │   │
│  │  ├── roles (catálogo de roles)                           │   │
│  │  ├── accounts (autenticación unificada)                  │   │
│  │  ├── user_profiles (datos de usuarios)                   │   │
│  │  └── professional_profiles (datos de profesionales)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Catálogos del Sistema                                   │   │
│  │  ├── specialties (especialidades)                        │   │
│  │  ├── therapeutic_approaches (enfoques terapéuticos)      │   │
│  │  └── modalities (modalidades de atención)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Junction Tables (Relaciones Many-to-Many)               │   │
│  │  ├── professional_specialties                            │   │
│  │  ├── professional_therapeutic_approaches                 │   │
│  │  └── professional_modalities                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend - FastAPI

### Arquitectura en Capas

#### 1. API Layer (Endpoints)

**Ubicación:** `backend/app/api/v1/endpoints/`

**Responsabilidades:**
- Recibir requests HTTP
- Validar entrada con Pydantic
- Llamar a servicios
- Retornar respuestas HTTP

**Módulos:**
```python
accounts.py                               # Autenticación y cuentas (150 líneas)
auth.py                                   # Token refresh (35 líneas)
specialties.py                            # CRUD especialidades (147 líneas)
therapeutic_approaches.py                 # CRUD enfoques (133 líneas)
modalities.py                             # CRUD modalidades (106 líneas)
professional_specialties.py               # Relaciones (92 líneas)
professional_therapeutic_approaches.py    # Relaciones (99 líneas)
professional_modalities.py                # Relaciones (120 líneas)
files.py                                  # Subida de archivos (386 líneas)
```

**Patrón:**
```python
@router.post("/login", response_model=UnifiedAuthResponse)
async def unified_login(
    login_data: UnifiedLogin,        # Request schema (Pydantic)
    db: Session = Depends(get_db)    # Dependency injection
):
    service = AccountService(db)      # Instanciar servicio
    account = service.authenticate()  # Lógica en servicio
    return create_response(account)   # Response schema
```

#### 2. Business Logic Layer (Services)

**Ubicación:** `backend/app/services/`

**Responsabilidades:**
- Lógica de negocio
- Operaciones CRUD
- Validaciones complejas
- Transacciones

**Servicios principales:**
```python
AccountService              # 352 líneas, 77% coverage
RoleService                 # 80 líneas, 98% coverage
SpecialtyService            # ~200 líneas, 73% coverage
ModalityService             # ~150 líneas, 100% coverage
TherapeuticApproachService  # ~200 líneas, 74% coverage
# + Services de relaciones (3)
```

**Patrón:**
```python
class AccountService:
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate(self, email: str, password: str) -> Optional[Account]:
        # 1. Query de BD
        # 2. Validaciones
        # 3. Transformaciones
        # 4. Commit/Rollback
        return account
```

#### 3. Data Layer (Models & Schemas)

**Models (SQLAlchemy):**
- Representación de tablas de BD
- Relaciones entre entidades
- Métodos de instancia

**Schemas (Pydantic):**
- Validación de entrada
- Serialización de salida
- Documentación automática

**Separación clara:**
```python
# Model = BD
class Account(Base):
    id = Column(UUID, primary_key=True)
    email = Column(String, unique=True)
    # ...

# Schema = API
class AccountCreate(BaseModel):
    email: EmailStr
    password: str  # Validado min 8 chars
```

#### 4. Core Layer

**Config:**
- Settings centralizados
- Variables de entorno
- Configuración por ambiente

**Database:**
- Connection pool
- Session management
- Engine configuration

**Security:**
- JWT creation/verification
- Password hashing (bcrypt)
- Token utilities

---

## 🎨 Frontend - Next.js

### Arquitectura de App Router (Next.js 15)

```
apps/web/src/
├── app/                    # App Router (file-based routing)
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Home page
│   ├── login/             # Autenticación
│   ├── register/          # Registro
│   ├── dashboard/         # Dashboards
│   ├── profile/           # Perfiles
│   ├── professionals/     # Búsqueda
│   └── admin/             # Panel admin
│
├── components/             # Componentes reutilizables
│   ├── ui/                # Base components (shadcn/ui)
│   ├── admin/             # Componentes admin
│   ├── professional-info/ # Gestión profesional
│   └── header/            # Navegación
│
├── lib/                   # Lógica de negocio
│   ├── api.ts            # API Client (ApiClient class)
│   ├── types.ts          # TypeScript types
│   ├── auth.ts           # Auth utilities
│   └── profiles.ts       # Profile management
│
├── hooks/                 # React Hooks personalizados
│   ├── useAuth.ts        # Autenticación
│   ├── useUnifiedAuth.ts # Auth unificada
│   └── use*.ts           # 26 hooks custom
│
└── contexts/              # React Contexts
    └── AuthContext.tsx    # Auth global state
```

### Patrón de Componentes

**Server Components (por defecto):**
```typescript
// app/professionals/page.tsx
export default function ProfessionalsPage() {
  // Rendered on server
  // No hooks, no state
  // Good for SEO
}
```

**Client Components (con "use client"):**
```typescript
"use client";
export default function Dashboard() {
  const { account, role } = useUnifiedAuth();
  // Interactive, state, hooks
}
```

### State Management

**Estrategia:** React Context + Local Hooks

```typescript
// Global state (Auth)
<UnifiedAuthProvider>
  {children}
</UnifiedAuthProvider>

// Component state
const [data, setData] = useState();

// Server state
const { data } = useSWR() // o React Query (futuro)
```

---

## 🗄️ Base de Datos - PostgreSQL

### Modelo de Datos Unificado

#### Diseño Central: Sistema de Cuentas Unificadas

```sql
┌─────────────────────────┐
│  roles                  │
│  ─────────────────────  │
│  id (PK)                │◄─────┐
│  name (UNIQUE)          │      │
│  description            │      │
│  created_at             │      │
│  updated_at             │      │
└─────────────────────────┘      │
                                 │
                          role_id (FK)
                                 │
┌────────────────────────────────┴─────────────────────────┐
│  accounts (Autenticación Unificada)                      │
│  ───────────────────────────────────────────────         │
│  id (PK)                                                  │◄──┐
│  role_id (FK → roles.id)                                 │   │
│  email (UNIQUE NOT NULL)                                 │   │
│  hashed_password (NOT NULL)                              │   │
│  full_name (NOT NULL)                                    │   │
│  phone, phone_country_code, phone_number                 │   │
│  is_active (DEFAULT TRUE)                                │   │
│  is_verified (DEFAULT FALSE)                             │   │
│  profile_picture                                         │   │
│  last_login                                              │   │
│  created_at, updated_at                                  │   │
└──────────────────────────────────────────────────────────┘   │
         │                              │                        │
         │ account_id                   │ account_id             │
         │ (FK, PK)                     │ (FK, PK)               │
         ▼                              ▼                        │
┌─────────────────────┐      ┌─────────────────────────────┐     │
│  user_profiles      │      │  professional_profiles      │     │
│  ─────────────────  │      │  ───────────────────────    │     │
│  account_id (PK/FK) │      │  account_id (PK/FK)         │     │
│  date_of_birth      │      │  license_number             │     │
│  emergency_*        │      │  years_experience           │     │
└─────────────────────┘      │  rate_cents                 │     │
                             │  custom_rate_cents          │     │
                             │  currency                   │     │
                             │  short_description          │     │
                             │  academic_experience (JSON) │     │
                             │  work_experience (JSON)     │     │
                             │  certifications (JSON)      │     │
                             │  languages (ARRAY)          │     │
                             │  timezone                   │     │
                             │  working_hours (JSON)       │     │
                             │  emergency_*                │     │
                             └─────────────────────────────┘     │
                                                                 │
                                                    professional_id (FK)
                                                                 │
┌────────────────────────────────────────────────────────────────┘
│
│  JUNCTION TABLES (Many-to-Many Relationships)
│
├─ professional_specialties
│  ├── id (PK)
│  ├── professional_id (FK → accounts.id)
│  ├── specialty_id (FK → specialties.id)
│  └── UNIQUE(professional_id, specialty_id)
│
├─ professional_therapeutic_approaches
│  ├── id (PK)
│  ├── professional_id (FK → accounts.id)
│  ├── therapeutic_approach_id (FK → therapeutic_approaches.id)
│  └── UNIQUE(professional_id, therapeutic_approach_id)
│
└─ professional_modalities
   ├── id (PK)
   ├── professional_id (FK → accounts.id)
   ├── modality_id (FK → modalities.id)
   ├── virtual_price, presencial_price
   ├── offers_presencial, is_default, is_active
   └── UNIQUE(professional_id, modality_id)
```

### Normalización y Optimización

**Índices:**
```sql
-- Accounts
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_role_id ON accounts(role_id);
CREATE INDEX idx_accounts_is_active ON accounts(is_active);

-- Roles
CREATE INDEX idx_roles_name ON roles(name);

-- Specialties
CREATE INDEX idx_specialties_name ON specialties(name);
CREATE INDEX idx_specialties_is_active ON specialties(is_active);
```

**Constraints:**
```sql
-- Email único global
ALTER TABLE accounts ADD CONSTRAINT unique_email UNIQUE(email);

-- Cascade deletes
ALTER TABLE user_profiles 
  ADD CONSTRAINT fk_user_profile_account 
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

ALTER TABLE professional_profiles 
  ADD CONSTRAINT fk_professional_profile_account 
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
```

**Normalización:**
- ✅ Sin arrays redundantes (specialty_ids eliminado)
- ✅ Junction tables para relaciones many-to-many
- ✅ Campos JSON solo para datos estructurados complejos
- ✅ Emergency contact normalizado (3 campos)
- ✅ Phone normalizado (country_code + number)

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación Completo

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ email + password
       ▼
┌─────────────────────────┐
│ POST /accounts/login    │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AccountService.authenticate()           │
│ 1. Buscar account por email             │
│ 2. Verificar password (bcrypt)          │
│ 3. Actualizar last_login                │
│ 4. Cargar role                          │
└──────┬──────────────────────────────────┘
       │ Account object
       ▼
┌─────────────────────────────────────────┐
│ create_token_response()                 │
│ 1. Generar access_token (7 días)        │
│ 2. Generar refresh_token (30 días)      │
│ 3. Firmar con SECRET_KEY                │
└──────┬──────────────────────────────────┘
       │ Tokens
       ▼
┌─────────────────────────────────────────┐
│ get_account_with_profile()              │
│ 1. Cargar account con role              │
│ 2. Cargar profile específico            │
│    - UserProfile si role = user         │
│    - ProfessionalProfile si role = pro  │
└──────┬──────────────────────────────────┘
       │ Account + Profile
       ▼
┌─────────────────────────────────────────┐
│ UnifiedAuthResponse                     │
│ {                                       │
│   access_token: "jwt...",               │
│   refresh_token: "jwt...",              │
│   account: {...},                       │
│   role: "user",                         │
│   profile: {...}                        │
│ }                                       │
└──────┬──────────────────────────────────┘
       │ JSON Response
       ▼
┌─────────────────────────┐
│   Cliente               │
│   1. Guarda tokens      │
│   2. Guarda account     │
│   3. Guarda profile     │
│   4. Redirige dashboard │
└─────────────────────────┘
```

### JWT Tokens

**Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "account_id",
    "exp": 1234567890,
    "iat": 1234567890
  },
  "signature": "..."
}
```

**Configuración:**
- Algoritmo: HS256
- Access Token: 7 días (10,080 minutos)
- Refresh Token: 30 días (43,200 minutos)
- Secret: Mínimo 32 caracteres

**Verificación en cada request:**
```python
# utils/auth.py
def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    payload = verify_token(token)  # Verifica firma y expiración
    account_id = payload.get("sub")
    return account_id

# Uso en endpoints
@router.get("/me")
async def get_current_account(
    current_user_id: str = Depends(get_current_user_id)
):
    # current_user_id ya está validado
```

---

## 🔄 Flujo de Datos

### Ejemplo: Actualizar Perfil de Usuario

```
┌──────────────────────────────────────────────────────────┐
│ 1. FRONTEND: Form Submit                                 │
│    const accountUpdate = {                               │
│      full_name: "John Doe",                              │
│      phone_country_code: "+57",                          │
│      phone_number: "3001234567"                          │
│    };                                                    │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 2. API CLIENT: apiClient.updateAccount(id, data)        │
│    PATCH /api/v1/accounts/{id}                           │
│    Headers: { Authorization: "Bearer {token}" }          │
│    Body: accountUpdate                                   │
└────────────┬─────────────────────────────────────────────┘
             │ HTTP Request
             ▼
┌──────────────────────────────────────────────────────────┐
│ 3. BACKEND ENDPOINT: update_account_by_id()              │
│    - Valida JWT token                                    │
│    - Verifica permisos (own account o admin)             │
│    - Valida data con AccountUpdate schema                │
└────────────┬─────────────────────────────────────────────┘
             │ Validated Data
             ▼
┌──────────────────────────────────────────────────────────┐
│ 4. ACCOUNTSERVICE: update_account()                      │
│    - Busca account en BD                                 │
│    - Actualiza campos                                    │
│    - db.commit()                                         │
│    - db.refresh(account)                                 │
└────────────┬─────────────────────────────────────────────┘
             │ Updated Account
             ▼
┌──────────────────────────────────────────────────────────┐
│ 5. DATABASE: UPDATE query                                │
│    UPDATE accounts                                       │
│    SET full_name = 'John Doe',                           │
│        phone_country_code = '+57',                       │
│        phone_number = '3001234567',                      │
│        updated_at = NOW()                                │
│    WHERE id = 'uuid'                                     │
└────────────┬─────────────────────────────────────────────┘
             │ Success
             ▼
┌──────────────────────────────────────────────────────────┐
│ 6. RESPONSE: AccountWithProfile                          │
│    {                                                     │
│      account: { ...updated fields },                     │
│      role: "user",                                       │
│      profile: { ...user_profile }                        │
│    }                                                     │
└────────────┬─────────────────────────────────────────────┘
             │ JSON Response
             ▼
┌──────────────────────────────────────────────────────────┐
│ 7. FRONTEND: Update State                                │
│    setAccount(response.account);                         │
│    setProfile(response.profile);                         │
│    showSuccessMessage();                                 │
└──────────────────────────────────────────────────────────┘
```

---

## 🔒 Seguridad

### Capas de Seguridad

#### 1. Autenticación (Authentication)

**JWT Tokens:**
- Firmados con SECRET_KEY
- Expiración configurable
- Refresh token para renovación

**Password Security:**
- Hashing con bcrypt (12 rounds)
- Nunca almacenar en plain text
- Validación de fortaleza (min 8 chars)

#### 2. Autorización (Authorization)

**RBAC (Role-Based Access Control):**
```python
# Dependencias de FastAPI
get_current_user_id()        # Cualquier usuario autenticado
get_current_admin_user()     # Solo admin

# Uso
@router.delete("/{id}")
async def delete(
    id: str,
    _admin: Account = Depends(get_current_admin_user)  # Valida admin
):
    # Solo admins pueden ejecutar
```

**Permisos por endpoint:**
```
Público:
- POST /accounts/login
- POST /accounts/register/*

Autenticado:
- GET /accounts/me
- GET /accounts/{id} (own account)
- PATCH /accounts/{id} (own account)
- GET /specialties
- GET /modalities

Admin:
- GET /accounts/admin/all
- GET /accounts/{id} (any account)
- PATCH /accounts/{id} (any account)
- DELETE /accounts/{id}
- PATCH /accounts/{id}/status
- POST/PATCH/DELETE /specialties (admin endpoints)
```

#### 3. Validación de Entrada

**Backend (Pydantic):**
```python
class AccountCreate(BaseModel):
    email: EmailStr  # Valida formato email
    password: str
    
    @field_validator("password")
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Min 8 chars")
        return value
```

**Frontend (Zod):**
```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword);
```

#### 4. Protección de Datos

**SQL Injection:**
- SQLAlchemy ORM (no raw queries)
- Parámetros bindeados automáticamente

**XSS:**
- React auto-escaping
- No uso de dangerouslySetInnerHTML

**CSRF:**
- JWT en headers (no cookies)
- CORS restrictivo

**CORS:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Whitelist específica
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Patrones de Diseño

### Backend Patterns

#### 1. Repository Pattern (via Services)

```python
class AccountService:
    """Repository para Account entity"""
    
    def __init__(self, db: Session):
        self.db = db  # Dependency Injection
    
    def get_by_id(self, id: UUID) -> Optional[Account]:
        return self.db.query(Account).filter(Account.id == id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Account]:
        return self.db.query(Account).offset(skip).limit(limit).all()
```

#### 2. Dependency Injection

```python
# FastAPI maneja DI automáticamente
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Uso
@router.get("/")
def endpoint(db: Session = Depends(get_db)):
    # db es inyectado automáticamente
```

#### 3. Schema Pattern (DTO)

```python
# Input
class AccountCreate(BaseModel): ...

# Output
class AccountResponse(BaseModel): ...

# Update
class AccountUpdate(BaseModel): ...
```

### Frontend Patterns

#### 1. Container/Presentational

```typescript
// Container (lógica)
function DashboardContainer() {
  const { account, loading } = useUnifiedAuth();
  if (loading) return <Spinner />;
  return <DashboardView account={account} />;
}

// Presentational (UI)
function DashboardView({ account }: Props) {
  return <div>{account.full_name}</div>;
}
```

#### 2. Custom Hooks

```typescript
// Encapsula lógica reutilizable
function useProfessionals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetch = async () => {
    setLoading(true);
    const result = await apiClient.getAllAccountsAdmin();
    setData(result.items);
    setLoading(false);
  };
  
  return { data, loading, fetch };
}
```

#### 3. Compound Components

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

---

## 🚀 Infraestructura y DevOps

### CI/CD Pipeline

```
┌─────────────────┐
│  Git Push       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  GitHub Actions (CI)                    │
│  ├── Checkout code                      │
│  ├── Setup Python 3.13.7 + Node 22      │
│  ├── Install dependencies               │
│  ├── Linting                            │
│  │   ├── Backend: Pylint, Flake8, Black │
│  │   └── Frontend: ESLint, Prettier     │
│  ├── Tests                              │
│  │   ├── Backend: 383 unit + 14 int     │
│  │   └── Frontend: Vitest suite         │
│  └── Build verification                 │
└────────┬────────────────────────────────┘
         │
         ▼
    ┌────────────┐
    │  Branch?   │
    └─────┬──────┘
          │
    ┌─────┼──────────────────┐
    │     │                  │
    ▼     ▼                  ▼
 develop staging           main
    │     │                  │
    │     ▼                  ▼
    │  ┌──────────────┐  ┌──────────────┐
    │  │  Deploy to   │  │  Deploy to   │
    │  │  Railway     │  │  Railway     │
    │  │  Staging     │  │  Production  │
    │  └──────┬───────┘  └──────┬───────┘
    │         │                  │
    │         ▼                  ▼
    │  ┌──────────────┐  ┌──────────────┐
    │  │  E2E Tests   │  │ Smoke Tests  │
    │  │  (10-20 min) │  │  (2-3 min)   │
    │  └──────────────┘  └──────────────┘
    │
    └──► No deploy (solo CI)
```

### Ambientes

| Ambiente | Branch | URL | Propósito |
|----------|--------|-----|-----------|
| **Development** | feature/* | localhost | Desarrollo local |
| **CI** | develop | - | Integración continua |
| **Staging** | staging | staging.railway.app | Testing pre-producción |
| **Production** | main | miamente.com | Usuarios reales |

### Docker Configuration

```dockerfile
# Backend
FROM python:3.13.7-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 📈 Escalabilidad

### Estrategias de Escalamiento

#### Horizontal Scaling

**Backend:**
```
Load Balancer (Railway)
    ├── Backend Instance 1
    ├── Backend Instance 2
    └── Backend Instance 3
            │
            └── PostgreSQL (shared)
```

**Stateless design:**
- No session storage en servidor
- JWT tokens (no server-side sessions)
- Connection pool compartido

#### Vertical Scaling

**Database:**
- Índices optimizados
- Connection pooling
- Query optimization

**Caching Strategy (Futuro):**
```
Redis Cache
├── Roles (TTL: 1 día)
├── Catálogos (TTL: 1 hora)
└── Profile pictures (TTL: 1 día)
```

### Performance Optimizations

**Backend:**
- ✅ Eager loading con `joinedload()` (evita N+1)
- ✅ Paginación en todos los listados
- ✅ Índices en campos frecuentemente consultados
- ✅ Connection pooling (SQLAlchemy default)

**Frontend:**
- ✅ Next.js Image optimization
- ✅ Code splitting automático
- ✅ Static generation donde aplica
- 🚧 React Query para caching (futuro)
- 🚧 Service Worker para offline (futuro)

---

## 🧪 Testing Strategy

### Pirámide de Tests

```
           ┌──────────┐
           │   E2E    │  10 tests (UI + API)
           │ Playwright│
           └─────┬────┘
         ┌───────┴───────┐
         │  Integration  │  14 tests (API + DB real)
         │    Pytest     │
         └───────┬───────┘
     ┌───────────┴───────────┐
     │    Unit Tests         │  383 tests (Mocked)
     │  Backend: 383 tests   │
     │  Frontend: Suite      │
     └───────────────────────┘
```

**Estrategia:**
- **70% Unit tests:** Rápidos, aislados, muchos
- **20% Integration tests:** Con BD real, casos críticos
- **10% E2E tests:** Flujos completos usuario

### Coverage Goals

| Módulo | Target | Actual |
|--------|--------|--------|
| **Services** | 80% | 77-100% ✅ |
| **Endpoints** | 80% | 76-100% ✅ |
| **Models** | 90% | 93-100% ✅ |
| **Core** | 70% | 56-94% ⚠️ |
| **TOTAL** | 80% | 88% ✅ |

---

## 🔮 Consideraciones Futuras

### Mejoras Técnicas Planificadas

**Caching (Redis):**
```python
# Cache de roles (raramente cambian)
@cache(ttl=86400)  # 1 día
def get_all_roles():
    return db.query(Role).all()

# Cache de catálogos
@cache(ttl=3600)  # 1 hora
def get_specialties():
    return db.query(Specialty).filter(is_active=True).all()
```

**Background Jobs (Celery):**
```python
# Emails asíncronos
@celery.task
def send_welcome_email(account_id):
    # Envío de email sin bloquear request
    pass

# Generación de reportes
@celery.task
def generate_monthly_report():
    # Proceso largo en background
    pass
```

**WebSockets (para Mensajería):**
```python
# FastAPI WebSocket support
@app.websocket("/ws/chat/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: str):
    await websocket.accept()
    # Real-time messaging
```

---

## 📊 Monitoreo y Observabilidad

### Métricas Clave a Monitorear

**Performance:**
- Response time (p50, p95, p99)
- Requests per second
- Error rate
- Database query time

**Business:**
- Registros diarios (usuarios/profesionales)
- Logins diarios
- Búsquedas de profesionales
- Perfiles completados

**Infrastructure:**
- CPU usage
- Memory usage
- Database connections
- Disk usage

### Logging Strategy

**Levels:**
```python
DEBUG: Desarrollo
INFO: Eventos importantes (login, registro)
WARNING: Situaciones inesperadas
ERROR: Errores que requieren atención
CRITICAL: Sistema inoperable
```

**Structured Logging:**
```python
logger.info(
    "User login successful",
    extra={
        "account_id": account.id,
        "email": account.email,
        "role": account.role.name,
        "timestamp": datetime.utcnow()
    }
)
```

---

## 🎯 Decisiones Arquitectónicas

### ADR (Architecture Decision Records)

#### ADR-001: Sistema de Cuentas Unificadas

**Fecha:** 11 de Octubre de 2025

**Contexto:**
- Teníamos tablas separadas `users` y `professionals`
- 60% de código duplicado
- Difícil agregar nuevos roles

**Decisión:**
- Unificar en tabla `accounts` con `role_id`
- Perfiles específicos en tablas separadas

**Consecuencias:**
- ✅ Reducción de 38% de código
- ✅ Un solo endpoint de login
- ✅ Roles flexibles (catálogo)
- ⚠️ Migración de datos necesaria

#### ADR-002: snake_case en Frontend

**Fecha:** 12 de Octubre de 2025

**Contexto:**
- Backend usa snake_case (Python)
- Frontend tradicionalmente usa camelCase (JavaScript)
- Requería adaptadores para convertir

**Decisión:**
- Adoptar snake_case en tipos TypeScript para API
- camelCase solo para props de React

**Consecuencias:**
- ✅ Eliminación de 110 líneas de adaptadores
- ✅ Compatibilidad directa con backend
- ⚠️ Menos "JavaScripty" pero más consistente

#### ADR-003: Aliases para Compatibilidad

**Fecha:** 12 de Octubre de 2025

**Contexto:**
- Migración a sistema unificado
- Muchos componentes usando código legacy

**Decisión:**
- Mantener aliases (`useAuth = useUnifiedAuth`)
- Eliminar implementaciones duplicadas

**Consecuencias:**
- ✅ Cero breaking changes
- ✅ Migración gradual posible
- ✅ -840 líneas eliminadas
- ⚠️ Aliases deben eliminarse eventualmente

---

## 📚 Referencias Técnicas

### Stack Versions

**Backend:**
- Python: 3.13.7
- FastAPI: 0.115.6
- SQLAlchemy: 2.0+
- Pydantic: 2.0+
- PostgreSQL: 16+

**Frontend:**
- Node.js: 22
- Next.js: 15
- React: 19
- TypeScript: 5.7
- Tailwind CSS: 3.4

### External Services

**Required:**
- PostgreSQL (database)
- Railway (hosting) o similar PaaS

**Optional:**
- SendGrid (emails)
- Stripe/PayU (pagos - futuro)
- Redis (caching - futuro)
- S3/CloudFront (CDN - futuro)

---

## 🎓 Para Desarrolladores

### Agregar Nuevo Endpoint

1. **Crear endpoint** en `backend/app/api/v1/endpoints/new_endpoint.py`
2. **Crear schemas** en `backend/app/schemas/new_schema.py`
3. **Lógica en servicio** en `backend/app/services/new_service.py`
4. **Tests** en `backend/tests/unit/api/test_new_endpoint.py`
5. **Registrar router** en `backend/app/api/v1/api.py`
6. **Tipos frontend** en `apps/web/src/lib/types.ts`
7. **Método API** en `apps/web/src/lib/api.ts`

### Agregar Nueva Página

1. **Crear página** en `apps/web/src/app/new-page/page.tsx`
2. **Agregar navegación** en `components/header/navigation.tsx`
3. **Permisos** en `middleware.ts` (si aplica)
4. **Tests** en `apps/web/src/app/new-page/__tests__/`

---

**Documento confidencial - Solo para uso interno del equipo de desarrollo**

**Última actualización:** 12 de Octubre de 2025  
**Versión:** 2.0  
**Mantenido por:** Equipo de Desarrollo Miamente

