# Estructura de Tests del Backend

Esta documentación describe la organización de los tests del backend de la plataforma Miamente.

## 📁 Estructura de Directorios

```
tests/
├── __init__.py
├── conftest.py              # Configuración global de pytest
├── fixtures/                # Datos de prueba y fixtures
│   ├── __init__.py
│   └── test_appointment.py
├── unit/                    # Tests unitarios
│   ├── __init__.py
│   ├── auth/                # Tests de autenticación
│   │   ├── __init__.py
│   │   └── test_auth_service.py
│   ├── professional/        # Tests de profesionales
│   │   ├── __init__.py
│   │   └── test_professional_service.py
│   ├── user/                # Tests de usuarios
│   │   ├── __init__.py
│   │   └── test_user_service.py
│   ├── appointment/         # Tests de citas
│   │   ├── __init__.py
│   │   └── test_appointment_service.py
│   ├── payment/             # Tests de pagos
│   │   └── __init__.py
│   ├── models/              # Tests de modelos de datos
│   │   ├── __init__.py
│   │   └── test_models.py
│   └── services/            # Tests de servicios generales
│       ├── __init__.py
│       ├── test_config.py
│       └── test_services.py
└── integration/             # Tests de integración
    ├── __init__.py
    ├── auth/                # Tests de endpoints de autenticación
    │   ├── __init__.py
    │   └── test_auth_endpoints.py
    ├── professional/        # Tests de endpoints de profesionales
    │   ├── __init__.py
    │   ├── test_professional_endpoints.py
    │   ├── test_professional_experience.py
    │   └── test_professional_profile.py
    ├── user/                # Tests de endpoints de usuarios
    │   ├── __init__.py
    │   └── test_user_endpoints.py
    ├── appointment/         # Tests de endpoints de citas
    │   ├── __init__.py
    │   └── test_appointment_endpoints.py
    └── payment/             # Tests de endpoints de pagos
        ├── __init__.py
        └── test_payment_endpoints.py
```

## 🧪 Tipos de Tests

### Tests Unitarios (`unit/`)

Los tests unitarios prueban componentes individuales de forma aislada:

- **Servicios**: Lógica de negocio de cada servicio
- **Modelos**: Validación y comportamiento de los modelos de datos
- **Configuración**: Configuraciones de la aplicación
- **Utilidades**: Funciones auxiliares y helpers

**Características:**

- No dependen de la base de datos real
- Usan mocks y stubs
- Ejecutan rápidamente
- Son determinísticos

### Tests de Integración (`integration/`)

Los tests de integración prueban la interacción entre componentes:

- **Endpoints**: APIs REST completas
- **Base de datos**: Operaciones CRUD reales
- **Autenticación**: Flujos completos de login/registro
- **Flujos de negocio**: Casos de uso completos

**Características:**

- Usan la base de datos de prueba
- Prueban flujos completos
- Verifican contratos entre componentes
- Son más lentos que los unitarios

## 🚀 Ejecución de Tests

### Ejecutar todos los tests

```bash
python -m pytest tests/ -v
```

### Ejecutar solo tests unitarios

```bash
python -m pytest tests/unit/ -v
```

### Ejecutar solo tests de integración

```bash
python -m pytest tests/integration/ -v
```

### Ejecutar tests por funcionalidad

```bash
# Tests de autenticación
python -m pytest tests/unit/auth/ tests/integration/auth/ -v

# Tests de profesionales
python -m pytest tests/unit/professional/ tests/integration/professional/ -v
```

### Ejecutar tests específicos

```bash
# Test específico
python -m pytest tests/unit/auth/test_auth_service.py::TestAuthService::test_authenticate_user -v

# Archivo específico
python -m pytest tests/integration/professional/test_professional_endpoints.py -v
```

## 📋 Convenciones

### Nomenclatura de archivos

- Tests unitarios: `test_[componente]_service.py`
- Tests de integración: `test_[componente]_endpoints.py`
- Tests de modelos: `test_models.py`
- Tests de configuración: `test_config.py`

### Nomenclatura de clases

- `Test[Componente]Service` para tests unitarios
- `Test[Componente]Endpoints` para tests de integración
- `Test[Modelo]Model` para tests de modelos

### Nomenclatura de métodos

- `test_[descripción_del_comportamiento]`
- Usar nombres descriptivos que expliquen qué se está probando
- Ejemplo: `test_authenticate_user_with_valid_credentials`

## 🔧 Configuración

### Fixtures globales (`conftest.py`)

- Configuración de la base de datos de prueba
- Clientes HTTP para tests de integración
- Datos de prueba comunes
- Configuración de autenticación

### Fixtures específicas (`fixtures/`)

- Modelos de datos de prueba
- Datos de ejemplo para diferentes escenarios
- Helpers para crear entidades de prueba

## ⚠️ Problemas Conocidos

Actualmente hay un problema de compatibilidad de tipos en la base de datos que afecta todos los tests:

- Error: `foreign key constraint "availability_held_by_fkey" cannot be implemented`
- Detalle: Las columnas `held_by` (UUID) y `id` (bigint) son de tipos incompatibles
- Este problema debe resolverse antes de que los tests puedan ejecutarse correctamente

## 📝 Mejores Prácticas

1. **Separación clara**: Mantener tests unitarios e integración separados
2. **Nombres descriptivos**: Usar nombres que expliquen claramente qué se está probando
3. **Datos de prueba**: Usar fixtures para datos consistentes
4. **Aislamiento**: Cada test debe ser independiente
5. **Cobertura**: Probar casos exitosos y de error
6. **Documentación**: Comentar tests complejos
7. **Mantenimiento**: Actualizar tests cuando cambie el código
