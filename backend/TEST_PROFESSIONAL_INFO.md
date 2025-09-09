# 🧪 Profesional de Prueba Creado

## 📋 Información del Profesional de Prueba

### Credenciales de Acceso:

- **Email:** `test.professional@miamente.com`
- **Contraseña:** `test123`
- **ID:** `1855af6f-5937-4128-9ff4-48d6eb2bba04`

### Información Personal:

- **Nombre:** Dr. María González
- **Teléfono:** +57 300 123 4567
- **Especialidad:** Psicología Clínica
- **Licencia:** PSI-12345
- **Años de Experiencia:** 8
- **Tarifa:** $800.00 COP por hora

### Biografía:

Psicóloga clínica con más de 8 años de experiencia en terapia cognitivo-conductual. Especializada en ansiedad, depresión y trastornos del estado de ánimo. Trabajo con adolescentes y adultos.

### Experiencia Académica:

1. **Psicología** - Universidad Nacional de Colombia (2010-2015)
2. **Especialización en Terapia Cognitivo-Conductual** - Universidad de los Andes (2016-2017)

### Experiencia Laboral:

1. **Psicóloga Clínica** - Hospital San Rafael (2018-2022)
2. **Psicóloga Independiente** - Consultorio Privado (2023-Presente)

### Certificaciones:

- Certificación en TCC - Universidad de los Andes
- Certificación en Terapia de Pareja - Instituto de Terapia Familiar
- Certificación en Mindfulness - Centro de Meditación

### Idiomas:

- Español (Nativo)
- Inglés (Avanzado)
- Portugués (Intermedio)

### Enfoques Terapéuticos:

- Terapia Cognitivo-Conductual
- Mindfulness
- Terapia de Aceptación y Compromiso
- Terapia de Pareja

## 🚀 Cómo Usar

1. **Iniciar el Backend:**

   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```

2. **Iniciar el Frontend:**

   ```bash
   cd apps/web
   nvm use v22
   npm run dev
   ```

3. **Acceder a la Aplicación:**
   - Ir a `http://localhost:3000`
   - Hacer login con las credenciales del profesional
   - Navegar a `/professionals` para ver la lista
   - Hacer clic en el perfil del Dr. María González
   - Ver el botón "Editar Perfil" (solo visible cuando estás loggeado como este profesional)

## ✅ Estado de la Implementación

- ✅ Profesional creado en la base de datos
- ✅ Datos de prueba completos (académicos, laborales, certificaciones)
- ✅ API funcionando correctamente
- ✅ Frontend con funcionalidad de edición implementada
- ✅ Control de acceso basado en autenticación
- ✅ Botón "Editar Perfil" solo visible para el propietario

## 🔧 Scripts Disponibles

- `create_test_professional.py` - Crear el profesional de prueba
- `test_api.py` - Verificar que la API funciona
- `test_login.py` - Probar el login (requiere servidor corriendo)

## 📝 Notas

- El profesional está marcado como `is_verified=True` y `is_active=True`
- La contraseña está hasheada con bcrypt
- Todos los datos están en formato JSON para las experiencias
- El perfil incluye foto de perfil de Unsplash
