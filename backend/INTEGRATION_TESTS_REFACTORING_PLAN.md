# Plan de Refactoring de Tests de Integración

## Resumen Ejecutivo

**PROBLEMA CRÍTICO**: 9 de 14 archivos de tests de integración están usando mocks extensivamente, lo cual **defeats the purpose** de las pruebas de integración. Los tests deberían probar contra la base de datos real, no contra mocks.

## Archivos Problemáticos Identificados

### 🔴 CRÍTICOS (Requieren Refactoring Inmediato)

1. **`admin/test_admin_endpoints.py`** - 100% mockeado
2. **`professionals/test_professionals_endpoints.py`** - Mezcla mocks con DB real
3. **`users/test_users_endpoints.py`** - Usa mocks para servicios y DB
4. **`modalities/test_modalities_endpoints.py`** - Mockea DB y autenticación
5. **`specialties/test_specialties_endpoints.py`** - Mockea servicios y DB
6. **`therapeutic_approaches/test_therapeutic_approaches_endpoints.py`** - Mockea servicios y DB
7. **`professional_specialties/test_professional_specialties_endpoints.py`** - Mockea servicios y DB
8. **`professional_modalities/test_professional_modalities_endpoints.py`** - Mockea servicios y DB
9. **`professional_therapeutic_approaches/test_professional_therapeutic_approaches_endpoints.py`** - Mockea servicios y DB

### ✅ CORRECTOS (Mantener como están)

1. **`auth/test_auth_endpoints.py`** - Usa DB real correctamente
2. **`auth/test_auth_endpoints_extended.py`** - Usa DB real correctamente
3. **`models/test_models.py`** - Prueba modelos contra DB real
4. **`user/test_user_endpoints.py`** - Usa DB real correctamente
5. **`files/test_files_endpoints.py`** - Usa DB real correctamente

## Plan de Refactoring por Fases

### Fase 1: Preparación y Guidelines (1-2 días)

#### 1.1 Crear Guidelines de Testing

- [ ] Documentar cuándo usar mocks vs DB real
- [ ] Establecer patrones para tests de integración
- [ ] Crear templates para nuevos tests

#### 1.2 Configurar Herramientas de Detección

- [ ] Configurar pre-commit hooks para detectar mocks en integration tests
- [ ] Crear script de validación automática
- [ ] Configurar CI/CD para validar tests

### Fase 2: Refactoring de Archivos Críticos (3-5 días)

#### 2.1 Prioridad Alta - Admin Endpoints

- [ ] **Archivo**: `admin/test_admin_endpoints.py`
- [ ] **Problema**: 100% mockeado
- [ ] **Acción**: Refactorizar completamente para usar DB real
- [ ] **Estimación**: 1 día

#### 2.2 Prioridad Alta - Professional Endpoints

- [ ] **Archivo**: `professionals/test_professionals_endpoints.py`
- [ ] **Problema**: Mezcla mocks con DB real
- [ ] **Acción**: Eliminar mocks, usar solo DB real
- [ ] **Estimación**: 1 día

#### 2.3 Prioridad Media - User Endpoints

- [ ] **Archivo**: `users/test_users_endpoints.py`
- [ ] **Problema**: Mockea servicios y DB
- [ ] **Acción**: Refactorizar para usar DB real
- [ ] **Estimación**: 0.5 días

### Fase 3: Refactoring de Archivos de Referencia (2-3 días)

#### 3.1 Modalities y Specialties

- [ ] **Archivos**: `modalities/`, `specialties/`, `therapeutic_approaches/`
- [ ] **Problema**: Mockean servicios y DB
- [ ] **Acción**: Refactorizar para usar DB real
- [ ] **Estimación**: 1 día

#### 3.2 Professional Relations

- [ ] **Archivos**: `professional_specialties/`, `professional_modalities/`, `professional_therapeutic_approaches/`
- [ ] **Problema**: Mockean servicios y DB
- [ ] **Acción**: Refactorizar para usar DB real
- [ ] **Estimación**: 1 día

### Fase 4: Validación y Testing (1-2 días)

#### 4.1 Ejecutar Tests Refactorizados

- [ ] Verificar que todos los tests pasen con DB real
- [ ] Identificar y corregir problemas de integración
- [ ] Optimizar performance si es necesario

#### 4.2 Documentación Final

- [ ] Actualizar documentación de testing
- [ ] Crear ejemplos de tests correctos
- [ ] Documentar lecciones aprendidas

## Patrones de Refactoring

### Antes (❌ Incorrecto)

```python
# Mock de DB Session
@pytest.fixture
def mock_db(self):
    return Mock(spec=Session)

# Mock de Servicios
@patch("app.api.v1.endpoints.users.UserService")
def test_get_users_success(self, mock_service_class, ...):
    mock_user_service = Mock()
    mock_service_class.return_value = mock_user_service
```

### Después (✅ Correcto)

```python
# Usar DB real
def test_get_users_success(self, client: TestClient, db_session):
    # Crear datos de prueba reales
    user_data = {
        "email": "test@example.com",
        "password": "test-password-123",
        "full_name": "Test User",
    }

    # Registrar usuario real
    response = client.post("/api/v1/auth/register/user", json=user_data)
    assert response.status_code == 201

    # Probar endpoint con datos reales
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
```

## Checklist de Refactoring por Archivo

### Para cada archivo problemático:

- [ ] **Eliminar imports de mock**
  - [ ] Remover `from unittest.mock import Mock, patch`
  - [ ] Remover `@patch` decorators
  - [ ] Remover `Mock()` objects

- [ ] **Eliminar dependency overrides**
  - [ ] Remover `app.dependency_overrides[get_db]`
  - [ ] Remover `app.dependency_overrides[get_current_user_id]`
  - [ ] Remover `app.dependency_overrides[get_current_admin_user]`

- [ ] **Reemplazar con DB real**
  - [ ] Usar `db_session` fixture real
  - [ ] Crear datos de prueba reales
  - [ ] Usar autenticación real con tokens

- [ ] **Verificar tests**
  - [ ] Ejecutar tests individuales
  - [ ] Verificar que pasen con DB real
  - [ ] Corregir problemas de integración

## Riesgos y Mitigaciones

### Riesgo 1: Tests más lentos

- **Mitigación**: Optimizar fixtures y limpieza de datos
- **Mitigación**: Usar transacciones para rollback automático

### Riesgo 2: Tests más frágiles

- **Mitigación**: Usar datos de prueba consistentes
- **Mitigación**: Implementar cleanup robusto

### Riesgo 3: Dependencias entre tests

- **Mitigación**: Aislar tests con cleanup entre cada uno
- **Mitigación**: Usar identificadores únicos para datos de prueba

## Métricas de Éxito

- [ ] **0 archivos** con mocks en tests de integración
- [ ] **100% de tests** pasando con DB real
- [ ] **Tiempo de ejecución** < 5 minutos para todos los integration tests
- [ ] **Cobertura de código** mantenida o mejorada

## Cronograma Estimado

| Fase      | Duración      | Responsable | Entregables                        |
| --------- | ------------- | ----------- | ---------------------------------- |
| Fase 1    | 1-2 días      | Dev Team    | Guidelines, herramientas           |
| Fase 2    | 3-5 días      | Dev Team    | Tests críticos refactorizados      |
| Fase 3    | 2-3 días      | Dev Team    | Tests de referencia refactorizados |
| Fase 4    | 1-2 días      | Dev Team    | Validación y documentación         |
| **Total** | **7-12 días** |             | **Tests de integración reales**    |

## Próximos Pasos Inmediatos

1. **Crear branch específico** para cada archivo problemático
2. **Empezar con `admin/test_admin_endpoints.py`** (más crítico)
3. **Refactorizar uno por uno** para evitar conflictos
4. **Validar cada refactoring** antes de continuar
5. **Documentar problemas encontrados** para futuras referencias

## Conclusión

Este refactoring es **crítico** para la calidad del proyecto. Los tests de integración actuales no están cumpliendo su propósito y podrían estar ocultando problemas reales de integración. Es fundamental completar este refactoring para tener confianza en el sistema antes de producción.
