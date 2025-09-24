# Reporte de Análisis de Tests de Integración

============================================================

## tests/integration/professional_therapeutic_approaches/test_professional_therapeutic_approaches_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Patch Decorators

- Line 41: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 74: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 103: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 128: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 163: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 196: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 223: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 248: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 273: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")

### Mock Objects

- Line 30: return Mock(spec=Session)
- Line 35: approach = Mock(spec=ProfessionalTherapeuticApproach)
- Line 54: mock_service = Mock()
- Line 87: mock_service = Mock()
- Line 114: mock_service = Mock()
- Line 140: mock_service = Mock()
- Line 176: mock_service = Mock()
- Line 207: mock_service = Mock()
- Line 234: mock_service = Mock()
- Line 259: mock_service = Mock()
- Line 285: mock_service = Mock()

### Mock Services

- Line 50: # Mock the ProfessionalTherapeuticApproachService
- Line 53: ) as mock_service_class:
- Line 54: mock_service = Mock()
- Line 55: mock_service.get_professional_therapeutic_approaches.return_value = [
- Line 58: mock_service_class.return_value = mock_service
- Line 83: # Mock the ProfessionalTherapeuticApproachService
- Line 86: ) as mock_service_class:
- Line 87: mock_service = Mock()
- Line 88: mock_service.get_professional_therapeutic_approach.return_value = sample_professional_therapeutic_approach
- Line 89: mock_service_class.return_value = mock_service
- Line 110: # Mock the ProfessionalTherapeuticApproachService
- Line 113: ) as mock_service_class:
- Line 114: mock_service = Mock()
- Line 115: mock_service.get_professional_therapeutic_approach.return_value = None
- Line 116: mock_service_class.return_value = mock_service
- Line 136: # Mock the ProfessionalTherapeuticApproachService
- Line 139: ) as mock_service_class:
- Line 140: mock_service = Mock()
- Line 141: mock_service.create_professional_therapeutic_approach.return_value = (
- Line 144: mock_service_class.return_value = mock_service
- Line 172: # Mock the ProfessionalTherapeuticApproachService
- Line 175: ) as mock_service_class:
- Line 176: mock_service = Mock()
- Line 177: mock_service.update_professional_therapeutic_approach.return_value = (
- Line 180: mock_service_class.return_value = mock_service
- Line 203: # Mock the ProfessionalTherapeuticApproachService
- Line 206: ) as mock_service_class:
- Line 207: mock_service = Mock()
- Line 208: mock_service.update_professional_therapeutic_approach.return_value = None
- Line 209: mock_service_class.return_value = mock_service
- Line 230: # Mock the ProfessionalTherapeuticApproachService
- Line 233: ) as mock_service_class:
- Line 234: mock_service = Mock()
- Line 235: mock_service.delete_professional_therapeutic_approach.return_value = True
- Line 236: mock_service_class.return_value = mock_service
- Line 255: # Mock the ProfessionalTherapeuticApproachService
- Line 258: ) as mock_service_class:
- Line 259: mock_service = Mock()
- Line 260: mock_service.delete_professional_therapeutic_approach.return_value = False
- Line 261: mock_service_class.return_value = mock_service
- Line 281: # Mock the ProfessionalTherapeuticApproachService
- Line 284: ) as mock_service_class:
- Line 285: mock_service = Mock()
- Line 286: mock_service.add_therapeutic_approaches_to_professional.return_value = approach_ids
- Line 287: mock_service_class.return_value = mock_service

### Mock Db

- Line 28: def mock_db(self):
- Line 41: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 43: self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
- Line 47: mock_get_db.return_value = mock_db
- Line 74: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 76: self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
- Line 80: mock_get_db.return_value = mock_db
- Line 103: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 104: def test_get_professional_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
- Line 107: mock_get_db.return_value = mock_db
- Line 128: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 130: self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
- Line 134: mock_get_db.return_value = mock_db
- Line 163: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 165: self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
- Line 169: mock_get_db.return_value = mock_db
- Line 196: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 197: def test_update_professional_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
- Line 200: mock_get_db.return_value = mock_db
- Line 223: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 224: def test_delete_professional_therapeutic_approach_success(self, mock_get_db, client, mock_db):
- Line 227: mock_get_db.return_value = mock_db
- Line 248: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 249: def test_delete_professional_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
- Line 252: mock_get_db.return_value = mock_db
- Line 273: @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
- Line 274: def test_update_professional_therapeutic_approaches_success(self, mock_get_db, client, mock_db):
- Line 277: mock_get_db.return_value = mock_db

---

## tests/integration/specialties/test_specialties_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Patch Decorators

- Line 38: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 59: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 80: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 102: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 125: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 145: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 169: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 193: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 215: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 235: @patch("app.api.v1.endpoints.specialties.get_db")

### Mock Objects

- Line 27: return Mock(spec=Session)
- Line 32: specialty = Mock(spec=Specialty)
- Line 46: mock_service = Mock()
- Line 67: mock_service = Mock()
- Line 88: mock_service = Mock()
- Line 110: mock_service = Mock()
- Line 133: mock_service = Mock()
- Line 153: mock_service = Mock()
- Line 177: mock_service = Mock()
- Line 201: mock_service = Mock()
- Line 223: mock_service = Mock()
- Line 243: mock_service = Mock()

### Mock Services

- Line 44: # Mock the SpecialtyService
- Line 45: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 46: mock_service = Mock()
- Line 47: mock_service.get_specialties.return_value = [sample_specialty]
- Line 48: mock_service_class.return_value = mock_service
- Line 65: # Mock the SpecialtyService
- Line 66: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 67: mock_service = Mock()
- Line 68: mock_service.get_specialties.return_value = [sample_specialty]
- Line 69: mock_service_class.return_value = mock_service
- Line 78: mock_service.get_specialties.assert_called_once_with(skip=10, limit=5)
- Line 86: # Mock the SpecialtyService
- Line 87: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 88: mock_service = Mock()
- Line 89: mock_service.get_specialties_by_category.return_value = [sample_specialty]
- Line 90: mock_service_class.return_value = mock_service
- Line 100: mock_service.get_specialties_by_category.assert_called_once_with("therapy")
- Line 108: # Mock the SpecialtyService
- Line 109: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 110: mock_service = Mock()
- Line 111: mock_service.get_specialty.return_value = sample_specialty
- Line 112: mock_service_class.return_value = mock_service
- Line 131: # Mock the SpecialtyService
- Line 132: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 133: mock_service = Mock()
- Line 134: mock_service.get_specialty.return_value = None
- Line 135: mock_service_class.return_value = mock_service
- Line 151: # Mock the SpecialtyService
- Line 152: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 153: mock_service = Mock()
- Line 154: mock_service.create_specialty.return_value = sample_specialty
- Line 155: mock_service_class.return_value = mock_service
- Line 175: # Mock the SpecialtyService
- Line 176: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 177: mock_service = Mock()
- Line 178: mock_service.update_specialty.return_value = sample_specialty
- Line 179: mock_service_class.return_value = mock_service
- Line 199: # Mock the SpecialtyService
- Line 200: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 201: mock_service = Mock()
- Line 202: mock_service.update_specialty.return_value = None
- Line 203: mock_service_class.return_value = mock_service
- Line 221: # Mock the SpecialtyService
- Line 222: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 223: mock_service = Mock()
- Line 224: mock_service.delete_specialty.return_value = True
- Line 225: mock_service_class.return_value = mock_service
- Line 241: # Mock the SpecialtyService
- Line 242: with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
- Line 243: mock_service = Mock()
- Line 244: mock_service.delete_specialty.return_value = False
- Line 245: mock_service_class.return_value = mock_service

### Mock Db

- Line 25: def mock_db(self):
- Line 38: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 39: def test_get_specialties_success(self, mock_get_db, client, mock_db, sample_specialty):
- Line 42: mock_get_db.return_value = mock_db
- Line 59: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 60: def test_get_specialties_with_pagination(self, mock_get_db, client, mock_db, sample_specialty):
- Line 63: mock_get_db.return_value = mock_db
- Line 80: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 81: def test_get_specialties_by_category_success(self, mock_get_db, client, mock_db, sample_specialty):
- Line 84: mock_get_db.return_value = mock_db
- Line 102: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 103: def test_get_specialty_success(self, mock_get_db, client, mock_db, sample_specialty):
- Line 106: mock_get_db.return_value = mock_db
- Line 125: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 126: def test_get_specialty_not_found(self, mock_get_db, client, mock_db):
- Line 129: mock_get_db.return_value = mock_db
- Line 145: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 146: def test_create_specialty_success(self, mock_get_db, client, mock_db, sample_specialty):
- Line 149: mock_get_db.return_value = mock_db
- Line 169: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 170: def test_update_specialty_success(self, mock_get_db, client, mock_db, sample_specialty):
- Line 173: mock_get_db.return_value = mock_db
- Line 193: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 194: def test_update_specialty_not_found(self, mock_get_db, client, mock_db):
- Line 197: mock_get_db.return_value = mock_db
- Line 215: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 216: def test_delete_specialty_success(self, mock_get_db, client, mock_db):
- Line 219: mock_get_db.return_value = mock_db
- Line 235: @patch("app.api.v1.endpoints.specialties.get_db")
- Line 236: def test_delete_specialty_not_found(self, mock_get_db, client, mock_db):
- Line 239: mock_get_db.return_value = mock_db

---

## tests/integration/professionals/test_professionals_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 8: from unittest.mock import patch

### Patch Decorators

- Line 575: @patch("app.services.auth_service.AuthService.get_professional_by_id")

### Dependency Overrides

- Line 245: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 255: app.dependency_overrides.clear()
- Line 267: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 276: app.dependency_overrides.clear()
- Line 291: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 316: app.dependency_overrides.clear()
- Line 328: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 339: app.dependency_overrides.clear()
- Line 352: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 372: app.dependency_overrides.clear()
- Line 387: app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
- Line 398: app.dependency_overrides.clear()
- Line 409: app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
- Line 420: app.dependency_overrides.clear()
- Line 431: app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
- Line 443: app.dependency_overrides.clear()
- Line 466: app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
- Line 473: app.dependency_overrides.clear()
- Line 484: app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
- Line 493: app.dependency_overrides.clear()
- Line 504: app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
- Line 515: app.dependency_overrides.clear()
- Line 536: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 546: app.dependency_overrides.clear()
- Line 557: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 569: app.dependency_overrides.clear()
- Line 585: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 595: app.dependency_overrides.clear()
- Line 606: app.dependency_overrides[get_current_user_id] = override_get_current_user_id
- Line 617: app.dependency_overrides.clear()

---

## tests/integration/professional_specialties/test_professional_specialties_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Patch Decorators

- Line 38: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 64: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 87: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 108: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 137: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 164: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 189: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 210: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 231: @patch("app.api.v1.endpoints.professional_specialties.get_db")

### Mock Objects

- Line 27: return Mock(spec=Session)
- Line 32: specialty = Mock(spec=ProfessionalSpecialty)
- Line 47: mock_service = Mock()
- Line 73: mock_service = Mock()
- Line 96: mock_service = Mock()
- Line 116: mock_service = Mock()
- Line 146: mock_service = Mock()
- Line 173: mock_service = Mock()
- Line 198: mock_service = Mock()
- Line 219: mock_service = Mock()
- Line 241: mock_service = Mock()

### Mock Services

- Line 45: # Mock the ProfessionalSpecialtyService
- Line 46: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 47: mock_service = Mock()
- Line 48: mock_service.get_professional_specialties.return_value = [sample_professional_specialty]
- Line 49: mock_service_class.return_value = mock_service
- Line 71: # Mock the ProfessionalSpecialtyService
- Line 72: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 73: mock_service = Mock()
- Line 74: mock_service.get_professional_specialty.return_value = sample_professional_specialty
- Line 75: mock_service_class.return_value = mock_service
- Line 94: # Mock the ProfessionalSpecialtyService
- Line 95: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 96: mock_service = Mock()
- Line 97: mock_service.get_professional_specialty.return_value = None
- Line 98: mock_service_class.return_value = mock_service
- Line 114: # Mock the ProfessionalSpecialtyService
- Line 115: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 116: mock_service = Mock()
- Line 117: mock_service.create_professional_specialty.return_value = sample_professional_specialty
- Line 118: mock_service_class.return_value = mock_service
- Line 144: # Mock the ProfessionalSpecialtyService
- Line 145: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 146: mock_service = Mock()
- Line 147: mock_service.update_professional_specialty.return_value = sample_professional_specialty
- Line 148: mock_service_class.return_value = mock_service
- Line 171: # Mock the ProfessionalSpecialtyService
- Line 172: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 173: mock_service = Mock()
- Line 174: mock_service.update_professional_specialty.return_value = None
- Line 175: mock_service_class.return_value = mock_service
- Line 196: # Mock the ProfessionalSpecialtyService
- Line 197: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 198: mock_service = Mock()
- Line 199: mock_service.delete_professional_specialty.return_value = True
- Line 200: mock_service_class.return_value = mock_service
- Line 217: # Mock the ProfessionalSpecialtyService
- Line 218: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 219: mock_service = Mock()
- Line 220: mock_service.delete_professional_specialty.return_value = False
- Line 221: mock_service_class.return_value = mock_service
- Line 239: # Mock the ProfessionalSpecialtyService
- Line 240: with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
- Line 241: mock_service = Mock()
- Line 242: mock_service.add_specialties_to_professional.return_value = specialty_ids
- Line 243: mock_service_class.return_value = mock_service

### Mock Db

- Line 25: def mock_db(self):
- Line 38: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 39: def test_get_professional_specialties_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
- Line 42: mock_get_db.return_value = mock_db
- Line 64: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 65: def test_get_professional_specialty_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
- Line 68: mock_get_db.return_value = mock_db
- Line 87: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 88: def test_get_professional_specialty_not_found(self, mock_get_db, client, mock_db):
- Line 91: mock_get_db.return_value = mock_db
- Line 108: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 109: def test_create_professional_specialty_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
- Line 112: mock_get_db.return_value = mock_db
- Line 137: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 138: def test_update_professional_specialty_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
- Line 141: mock_get_db.return_value = mock_db
- Line 164: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 165: def test_update_professional_specialty_not_found(self, mock_get_db, client, mock_db):
- Line 168: mock_get_db.return_value = mock_db
- Line 189: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 190: def test_delete_professional_specialty_success(self, mock_get_db, client, mock_db):
- Line 193: mock_get_db.return_value = mock_db
- Line 210: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 211: def test_delete_professional_specialty_not_found(self, mock_get_db, client, mock_db):
- Line 214: mock_get_db.return_value = mock_db
- Line 231: @patch("app.api.v1.endpoints.professional_specialties.get_db")
- Line 232: def test_update_professional_specialties_success(self, mock_get_db, client, mock_db):
- Line 235: mock_get_db.return_value = mock_db

---

## tests/integration/auth/test_auth_endpoints_extended.py

**Estado**: ✅ CORRECTO

No se encontraron problemas de mocking.

---

## tests/integration/auth/test_auth_endpoints.py

**Estado**: ✅ CORRECTO

No se encontraron problemas de mocking.

---

## tests/integration/admin/test_admin_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Patch Decorators

- Line 89: @patch("app.api.v1.endpoints.users.get_db")
- Line 122: @patch("app.api.v1.endpoints.users.get_db")
- Line 154: @patch("app.api.v1.endpoints.users.get_db")
- Line 172: @patch("app.api.v1.endpoints.users.get_db")
- Line 204: @patch("app.api.v1.endpoints.users.get_db")
- Line 236: @patch("app.api.v1.endpoints.users.get_db")
- Line 279: @patch("app.api.v1.endpoints.users.get_db")
- Line 316: @patch("app.api.v1.endpoints.professionals.get_db")
- Line 375: @patch("app.api.v1.endpoints.professionals.get_db")

### Mock Objects

- Line 28: return Mock(spec=Session)
- Line 33: user = Mock(spec=User)
- Line 54: user = Mock(spec=User)
- Line 75: professional = Mock(spec=Professional)
- Line 103: mock_user_service = Mock()
- Line 136: mock_user_service = Mock()
- Line 186: mock_user_service = Mock()
- Line 218: mock_user_service = Mock()
- Line 250: mock_user_service = Mock()
- Line 254: mock_db.commit = Mock()
- Line 255: mock_db.refresh = Mock()
- Line 293: mock_user_service = Mock()
- Line 297: mock_db.commit = Mock()
- Line 332: mock_db.commit = Mock()
- Line 333: mock_db.refresh = Mock()
- Line 336: mock_query = Mock()
- Line 391: mock_db.commit = Mock()
- Line 394: mock_query = Mock()

### Dependency Overrides

- Line 99: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 100: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 120: client.app.dependency_overrides.clear()
- Line 132: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 133: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 152: client.app.dependency_overrides.clear()
- Line 169: client.app.dependency_overrides.clear()
- Line 182: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 183: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 202: client.app.dependency_overrides.clear()
- Line 214: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 215: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 233: client.app.dependency_overrides.clear()
- Line 246: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 247: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 276: client.app.dependency_overrides.clear()
- Line 289: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 290: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 313: client.app.dependency_overrides.clear()
- Line 328: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 329: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 373: client.app.dependency_overrides.clear()
- Line 387: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 388: client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user
- Line 409: client.app.dependency_overrides.clear()

### Mock Services

- Line 102: # Mock UserService
- Line 103: mock_user_service = Mock()
- Line 104: mock_user_service.get_users.return_value = [sample_regular_user, sample_admin_user]
- Line 106: with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
- Line 107: mock_service_class.return_value = mock_user_service
- Line 135: # Mock UserService
- Line 136: mock_user_service = Mock()
- Line 137: mock_user_service.get_users.return_value = [sample_regular_user]
- Line 139: with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
- Line 140: mock_service_class.return_value = mock_user_service
- Line 185: # Mock UserService
- Line 186: mock_user_service = Mock()
- Line 187: mock_user_service.get_user_by_id.return_value = sample_regular_user
- Line 189: with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
- Line 190: mock_service_class.return_value = mock_user_service
- Line 217: # Mock UserService
- Line 218: mock_user_service = Mock()
- Line 219: mock_user_service.get_user_by_id.return_value = None
- Line 221: with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
- Line 222: mock_service_class.return_value = mock_user_service
- Line 249: # Mock UserService
- Line 250: mock_user_service = Mock()
- Line 251: mock_user_service.get_user_by_id.return_value = sample_regular_user
- Line 257: with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
- Line 258: mock_service_class.return_value = mock_user_service
- Line 292: # Mock UserService
- Line 293: mock_user_service = Mock()
- Line 294: mock_user_service.get_user_by_id.return_value = sample_regular_user
- Line 299: with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
- Line 300: mock_service_class.return_value = mock_user_service

### Mock Db

- Line 26: def mock_db(self):
- Line 89: @patch("app.api.v1.endpoints.users.get_db")
- Line 90: def test_get_users_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
- Line 93: mock_get_db.return_value = mock_db
- Line 99: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 122: @patch("app.api.v1.endpoints.users.get_db")
- Line 123: def test_get_users_with_role_filter(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
- Line 126: mock_get_db.return_value = mock_db
- Line 132: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 154: @patch("app.api.v1.endpoints.users.get_db")
- Line 155: def test_get_users_unauthorized(self, mock_get_db, client, mock_db):
- Line 158: mock_get_db.return_value = mock_db
- Line 172: @patch("app.api.v1.endpoints.users.get_db")
- Line 173: def test_get_user_by_id_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
- Line 176: mock_get_db.return_value = mock_db
- Line 182: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 204: @patch("app.api.v1.endpoints.users.get_db")
- Line 205: def test_get_user_by_id_not_found(self, mock_get_db, client, mock_db, sample_admin_user):
- Line 208: mock_get_db.return_value = mock_db
- Line 214: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 236: @patch("app.api.v1.endpoints.users.get_db")
- Line 237: def test_toggle_user_status_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
- Line 240: mock_get_db.return_value = mock_db
- Line 246: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 254: mock_db.commit = Mock()
- Line 255: mock_db.refresh = Mock()
- Line 272: mock_db.commit.assert_called_once()
- Line 273: mock_db.refresh.assert_called_once()
- Line 279: @patch("app.api.v1.endpoints.users.get_db")
- Line 280: def test_delete_user_admin_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
- Line 283: mock_get_db.return_value = mock_db
- Line 289: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 297: mock_db.commit = Mock()
- Line 310: mock_db.commit.assert_called_once()
- Line 316: @patch("app.api.v1.endpoints.professionals.get_db")
- Line 318: self, mock_get_db, client, mock_db, sample_admin_user, sample_professional
- Line 322: mock_get_db.return_value = mock_db
- Line 328: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 332: mock_db.commit = Mock()
- Line 333: mock_db.refresh = Mock()
- Line 338: mock_db.query.return_value = mock_query
- Line 369: mock_db.commit.assert_called_once()
- Line 370: mock_db.refresh.assert_called_once()
- Line 375: @patch("app.api.v1.endpoints.professionals.get_db")
- Line 377: self, mock_get_db, client, mock_db, sample_admin_user, sample_professional
- Line 381: mock_get_db.return_value = mock_db
- Line 387: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 391: mock_db.commit = Mock()
- Line 396: mock_db.query.return_value = mock_query
- Line 406: mock_db.commit.assert_called_once()

---

## tests/integration/modalities/test_modalities_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Mock Objects

- Line 27: return Mock(spec=Session)
- Line 32: modality = Mock(spec=Modality)
- Line 47: mock_query = Mock()
- Line 48: mock_filter = Mock()
- Line 73: mock_query = Mock()
- Line 74: mock_filter = Mock()
- Line 101: mock_query = Mock()
- Line 102: mock_filter = Mock()
- Line 129: mock_query = Mock()
- Line 130: mock_filter = Mock()
- Line 136: mock_db.add = Mock()
- Line 137: mock_db.commit = Mock()
- Line 138: mock_db.refresh = Mock()
- Line 175: mock_query = Mock()
- Line 176: mock_filter = Mock()
- Line 212: mock_query = Mock()
- Line 213: mock_filter = Mock()
- Line 219: mock_db.commit = Mock()
- Line 220: mock_db.refresh = Mock()
- Line 248: mock_query = Mock()
- Line 249: mock_filter = Mock()
- Line 280: mock_query = Mock()
- Line 281: mock_filter = Mock()
- Line 287: mock_db.commit = Mock()
- Line 312: mock_query = Mock()
- Line 313: mock_filter = Mock()

### Dependency Overrides

- Line 56: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 68: client.app.dependency_overrides.clear()
- Line 83: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 84: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 96: client.app.dependency_overrides.clear()
- Line 111: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 112: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 123: client.app.dependency_overrides.clear()
- Line 144: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 145: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 169: client.app.dependency_overrides.clear()
- Line 185: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 186: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 206: client.app.dependency_overrides.clear()
- Line 226: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 227: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 242: client.app.dependency_overrides.clear()
- Line 258: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 259: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 274: client.app.dependency_overrides.clear()
- Line 293: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 294: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 306: client.app.dependency_overrides.clear()
- Line 322: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 323: client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"
- Line 334: client.app.dependency_overrides.clear()

### Mock Db

- Line 25: def mock_db(self):
- Line 44: def test_get_modalities_success(self, client, mock_db, sample_modality):
- Line 51: mock_db.query.return_value = mock_query
- Line 56: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 70: def test_get_modality_success(self, client, mock_db, sample_modality):
- Line 77: mock_db.query.return_value = mock_query
- Line 83: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 98: def test_get_modality_not_found(self, client, mock_db):
- Line 105: mock_db.query.return_value = mock_query
- Line 111: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 125: def test_create_modality_success(self, client, mock_db, sample_modality):
- Line 133: mock_db.query.return_value = mock_query
- Line 136: mock_db.add = Mock()
- Line 137: mock_db.commit = Mock()
- Line 138: mock_db.refresh = Mock()
- Line 144: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 171: def test_create_modality_duplicate_name(self, client, mock_db, sample_modality):
- Line 179: mock_db.query.return_value = mock_query
- Line 185: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 208: def test_update_modality_success(self, client, mock_db, sample_modality):
- Line 216: mock_db.query.return_value = mock_query
- Line 219: mock_db.commit = Mock()
- Line 220: mock_db.refresh = Mock()
- Line 226: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 244: def test_update_modality_not_found(self, client, mock_db):
- Line 252: mock_db.query.return_value = mock_query
- Line 258: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 276: def test_delete_modality_success(self, client, mock_db, sample_modality):
- Line 284: mock_db.query.return_value = mock_query
- Line 287: mock_db.commit = Mock()
- Line 293: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 308: def test_delete_modality_not_found(self, client, mock_db):
- Line 316: mock_db.query.return_value = mock_query
- Line 322: client.app.dependency_overrides[get_db] = lambda: mock_db

---

## tests/integration/user/test_user_endpoints.py

**Estado**: ✅ CORRECTO

No se encontraron problemas de mocking.

---

## tests/integration/models/test_models.py

**Estado**: ✅ CORRECTO

No se encontraron problemas de mocking.

---

## tests/integration/users/test_users_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Patch Decorators

- Line 49: @patch("app.api.v1.endpoints.users.get_db")
- Line 63: @patch("app.api.v1.endpoints.users.get_db")

### Mock Objects

- Line 27: return Mock(spec=Session)
- Line 32: user = Mock(spec=User)
- Line 95: mock_service = Mock()
- Line 106: mock_db.commit = Mock()
- Line 107: mock_db.refresh = Mock()
- Line 134: mock_service = Mock()
- Line 162: mock_service = Mock()
- Line 175: mock_db.commit = Mock(side_effect=SQLAlchemyError("Database error"))
- Line 176: mock_db.rollback = Mock()
- Line 197: mock_service = Mock()
- Line 208: mock_db.commit = Mock()
- Line 228: mock_service = Mock()
- Line 256: mock_service = Mock()
- Line 269: mock_db.commit = Mock(side_effect=SQLAlchemyError("Database error"))
- Line 270: mock_db.rollback = Mock()

### Dependency Overrides

- Line 102: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 103: client.app.dependency_overrides[get_current_user_id] = lambda: "550e8400-e29b-41d4-a716-446655440002"
- Line 128: client.app.dependency_overrides.clear()
- Line 141: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 142: client.app.dependency_overrides[get_current_user_id] = lambda: "550e8400-e29b-41d4-a716-446655440002"
- Line 156: client.app.dependency_overrides.clear()
- Line 169: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 170: client.app.dependency_overrides[get_current_user_id] = lambda: "550e8400-e29b-41d4-a716-446655440002"
- Line 191: client.app.dependency_overrides.clear()
- Line 204: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 205: client.app.dependency_overrides[get_current_user_id] = lambda: "550e8400-e29b-41d4-a716-446655440002"
- Line 222: client.app.dependency_overrides.clear()
- Line 235: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 236: client.app.dependency_overrides[get_current_user_id] = lambda: "550e8400-e29b-41d4-a716-446655440002"
- Line 250: client.app.dependency_overrides.clear()
- Line 263: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 264: client.app.dependency_overrides[get_current_user_id] = lambda: "550e8400-e29b-41d4-a716-446655440002"
- Line 285: client.app.dependency_overrides.clear()

### Mock Services

- Line 94: # Mock the AuthService
- Line 95: mock_service = Mock()
- Line 96: mock_service.get_user_by_id.return_value = sample_user
- Line 109: with patch("app.api.v1.endpoints.users.AuthService") as mock_service_class:
- Line 110: mock_service_class.return_value = mock_service
- Line 133: # Mock the AuthService
- Line 134: mock_service = Mock()
- Line 135: mock_service.get_user_by_id.return_value = None
- Line 144: with patch("app.api.v1.endpoints.users.AuthService") as mock_service_class:
- Line 145: mock_service_class.return_value = mock_service
- Line 161: # Mock the AuthService
- Line 162: mock_service = Mock()
- Line 163: mock_service.get_user_by_id.return_value = sample_user
- Line 178: with patch("app.api.v1.endpoints.users.AuthService") as mock_service_class:
- Line 179: mock_service_class.return_value = mock_service
- Line 196: # Mock the AuthService
- Line 197: mock_service = Mock()
- Line 198: mock_service.get_user_by_id.return_value = sample_user
- Line 210: with patch("app.api.v1.endpoints.users.AuthService") as mock_service_class:
- Line 211: mock_service_class.return_value = mock_service
- Line 227: # Mock the AuthService
- Line 228: mock_service = Mock()
- Line 229: mock_service.get_user_by_id.return_value = None
- Line 238: with patch("app.api.v1.endpoints.users.AuthService") as mock_service_class:
- Line 239: mock_service_class.return_value = mock_service
- Line 255: # Mock the AuthService
- Line 256: mock_service = Mock()
- Line 257: mock_service.get_user_by_id.return_value = sample_user
- Line 272: with patch("app.api.v1.endpoints.users.AuthService") as mock_service_class:
- Line 273: mock_service_class.return_value = mock_service

### Mock Db

- Line 25: def mock_db(self):
- Line 49: @patch("app.api.v1.endpoints.users.get_db")
- Line 50: def test_get_users_unauthorized(self, mock_get_db, client, mock_db):
- Line 53: mock_get_db.return_value = mock_db
- Line 63: @patch("app.api.v1.endpoints.users.get_db")
- Line 64: def test_get_user_by_id_unauthorized(self, mock_get_db, client, mock_db):
- Line 67: mock_get_db.return_value = mock_db
- Line 77: def test_get_current_user_success(self, client, mock_db, sample_user):
- Line 84: def test_get_current_user_not_found(self, client, mock_db):
- Line 91: def test_update_current_user_success(self, client, mock_db, sample_user):
- Line 102: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 106: mock_db.commit = Mock()
- Line 107: mock_db.refresh = Mock()
- Line 124: mock_db.commit.assert_called_once()
- Line 125: mock_db.refresh.assert_called_once()
- Line 130: def test_update_current_user_not_found(self, client, mock_db):
- Line 141: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 158: def test_update_current_user_exception_handling(self, client, mock_db, sample_user):
- Line 169: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 175: mock_db.commit = Mock(side_effect=SQLAlchemyError("Database error"))
- Line 176: mock_db.rollback = Mock()
- Line 188: mock_db.rollback.assert_called_once()
- Line 193: def test_delete_current_user_success(self, client, mock_db, sample_user):
- Line 204: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 208: mock_db.commit = Mock()
- Line 219: mock_db.commit.assert_called_once()
- Line 224: def test_delete_current_user_not_found(self, client, mock_db):
- Line 235: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 252: def test_delete_current_user_exception_handling(self, client, mock_db, sample_user):
- Line 263: client.app.dependency_overrides[get_db] = lambda: mock_db
- Line 269: mock_db.commit = Mock(side_effect=SQLAlchemyError("Database error"))
- Line 270: mock_db.rollback = Mock()
- Line 282: mock_db.rollback.assert_called_once()

---

## tests/integration/professional_modalities/test_professional_modalities_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Patch Decorators

- Line 44: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 74: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 104: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 127: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 154: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 175: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 213: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 247: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 272: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 293: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 314: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 338: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 361: @patch("app.api.v1.endpoints.professional_modalities.get_db")

### Mock Objects

- Line 27: return Mock(spec=Session)
- Line 32: modality = Mock(spec=ProfessionalModality)
- Line 53: mock_service = Mock()
- Line 85: mock_service = Mock()
- Line 113: mock_service = Mock()
- Line 136: mock_service = Mock()
- Line 163: mock_service = Mock()
- Line 183: mock_service = Mock()
- Line 222: mock_service = Mock()
- Line 256: mock_service = Mock()
- Line 281: mock_service = Mock()
- Line 302: mock_service = Mock()
- Line 323: mock_service = Mock()
- Line 347: mock_service = Mock()
- Line 370: mock_service = Mock()

### Mock Services

- Line 51: # Mock the ProfessionalModalityService
- Line 52: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 53: mock_service = Mock()
- Line 54: mock_service.get_professional_modalities.return_value = [sample_professional_modality]
- Line 55: mock_service_class.return_value = mock_service
- Line 83: # Mock the ProfessionalModalityService
- Line 84: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 85: mock_service = Mock()
- Line 86: mock_service.get_default_professional_modality.return_value = sample_professional_modality
- Line 87: mock_service_class.return_value = mock_service
- Line 111: # Mock the ProfessionalModalityService
- Line 112: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 113: mock_service = Mock()
- Line 114: mock_service.get_default_professional_modality.return_value = None
- Line 115: mock_service_class.return_value = mock_service
- Line 134: # Mock the ProfessionalModalityService
- Line 135: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 136: mock_service = Mock()
- Line 137: mock_service.get_professional_modality.return_value = sample_professional_modality
- Line 138: mock_service_class.return_value = mock_service
- Line 161: # Mock the ProfessionalModalityService
- Line 162: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 163: mock_service = Mock()
- Line 164: mock_service.get_professional_modality.return_value = None
- Line 165: mock_service_class.return_value = mock_service
- Line 181: # Mock the ProfessionalModalityService
- Line 182: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 183: mock_service = Mock()
- Line 184: mock_service.create_professional_modality.return_value = sample_professional_modality
- Line 185: mock_service_class.return_value = mock_service
- Line 220: # Mock the ProfessionalModalityService
- Line 221: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 222: mock_service = Mock()
- Line 223: mock_service.update_professional_modality.return_value = sample_professional_modality
- Line 224: mock_service_class.return_value = mock_service
- Line 254: # Mock the ProfessionalModalityService
- Line 255: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 256: mock_service = Mock()
- Line 257: mock_service.update_professional_modality.return_value = None
- Line 258: mock_service_class.return_value = mock_service
- Line 279: # Mock the ProfessionalModalityService
- Line 280: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 281: mock_service = Mock()
- Line 282: mock_service.delete_professional_modality.return_value = True
- Line 283: mock_service_class.return_value = mock_service
- Line 300: # Mock the ProfessionalModalityService
- Line 301: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 302: mock_service = Mock()
- Line 303: mock_service.delete_professional_modality.return_value = False
- Line 304: mock_service_class.return_value = mock_service
- Line 321: # Mock the ProfessionalModalityService
- Line 322: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 323: mock_service = Mock()
- Line 324: mock_service.get_professional_modality.return_value = sample_professional_modality
- Line 325: mock_service.set_default_modality.return_value = True
- Line 326: mock_service_class.return_value = mock_service
- Line 345: # Mock the ProfessionalModalityService
- Line 346: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 347: mock_service = Mock()
- Line 348: mock_service.get_professional_modality.return_value = None
- Line 349: mock_service_class.return_value = mock_service
- Line 368: # Mock the ProfessionalModalityService
- Line 369: with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
- Line 370: mock_service = Mock()
- Line 371: mock_service.get_professional_modality.return_value = sample_professional_modality
- Line 372: mock_service.set_default_modality.return_value = False
- Line 373: mock_service_class.return_value = mock_service

### Mock Db

- Line 25: def mock_db(self):
- Line 44: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 45: def test_get_professional_modalities_success(self, mock_get_db, client, mock_db, sample_professional_modality):
- Line 48: mock_get_db.return_value = mock_db
- Line 74: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 76: self, mock_get_db, client, mock_db, sample_professional_modality
- Line 80: mock_get_db.return_value = mock_db
- Line 104: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 105: def test_get_default_professional_modality_not_found(self, mock_get_db, client, mock_db):
- Line 108: mock_get_db.return_value = mock_db
- Line 127: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 128: def test_get_professional_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
- Line 131: mock_get_db.return_value = mock_db
- Line 154: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 155: def test_get_professional_modality_not_found(self, mock_get_db, client, mock_db):
- Line 158: mock_get_db.return_value = mock_db
- Line 175: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 176: def test_create_professional_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
- Line 179: mock_get_db.return_value = mock_db
- Line 213: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 214: def test_update_professional_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
- Line 217: mock_get_db.return_value = mock_db
- Line 247: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 248: def test_update_professional_modality_not_found(self, mock_get_db, client, mock_db):
- Line 251: mock_get_db.return_value = mock_db
- Line 272: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 273: def test_delete_professional_modality_success(self, mock_get_db, client, mock_db):
- Line 276: mock_get_db.return_value = mock_db
- Line 293: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 294: def test_delete_professional_modality_not_found(self, mock_get_db, client, mock_db):
- Line 297: mock_get_db.return_value = mock_db
- Line 314: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 315: def test_set_default_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
- Line 318: mock_get_db.return_value = mock_db
- Line 338: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 339: def test_set_default_modality_not_found(self, mock_get_db, client, mock_db):
- Line 342: mock_get_db.return_value = mock_db
- Line 361: @patch("app.api.v1.endpoints.professional_modalities.get_db")
- Line 362: def test_set_default_modality_failed(self, mock_get_db, client, mock_db, sample_professional_modality):
- Line 365: mock_get_db.return_value = mock_db

---

## tests/integration/files/test_files_endpoints.py

**Estado**: ✅ CORRECTO

No se encontraron problemas de mocking.

---

## tests/integration/therapeutic_approaches/test_therapeutic_approaches_endpoints.py

**Estado**: ❌ PROBLEMÁTICO

### Mock Imports

- Line 7: from unittest.mock import Mock, patch

### Patch Decorators

- Line 39: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 61: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 84: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 111: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 134: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 154: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 182: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 206: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 230: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 252: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")

### Mock Objects

- Line 27: return Mock(spec=Session)
- Line 32: approach = Mock(spec=TherapeuticApproach)
- Line 47: mock_service = Mock()
- Line 71: mock_service = Mock()
- Line 94: mock_service = Mock()
- Line 119: mock_service = Mock()
- Line 142: mock_service = Mock()
- Line 162: mock_service = Mock()
- Line 190: mock_service = Mock()
- Line 214: mock_service = Mock()
- Line 238: mock_service = Mock()
- Line 260: mock_service = Mock()

### Mock Services

- Line 45: # Mock the TherapeuticApproachService
- Line 46: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 47: mock_service = Mock()
- Line 48: mock_service.get_therapeutic_approaches.return_value = [sample_therapeutic_approach]
- Line 49: mock_service_class.return_value = mock_service
- Line 69: # Mock the TherapeuticApproachService
- Line 70: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 71: mock_service = Mock()
- Line 72: mock_service.get_therapeutic_approaches.return_value = [sample_therapeutic_approach]
- Line 73: mock_service_class.return_value = mock_service
- Line 82: mock_service.get_therapeutic_approaches.assert_called_once_with(skip=10, limit=5)
- Line 92: # Mock the TherapeuticApproachService
- Line 93: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 94: mock_service = Mock()
- Line 95: mock_service.get_therapeutic_approaches_by_category.return_value = [sample_therapeutic_approach]
- Line 96: mock_service_class.return_value = mock_service
- Line 109: mock_service.get_therapeutic_approaches_by_category.assert_called_once_with("psychotherapy")
- Line 117: # Mock the TherapeuticApproachService
- Line 118: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 119: mock_service = Mock()
- Line 120: mock_service.get_therapeutic_approach.return_value = sample_therapeutic_approach
- Line 121: mock_service_class.return_value = mock_service
- Line 140: # Mock the TherapeuticApproachService
- Line 141: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 142: mock_service = Mock()
- Line 143: mock_service.get_therapeutic_approach.return_value = None
- Line 144: mock_service_class.return_value = mock_service
- Line 160: # Mock the TherapeuticApproachService
- Line 161: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 162: mock_service = Mock()
- Line 163: mock_service.create_therapeutic_approach.return_value = sample_therapeutic_approach
- Line 164: mock_service_class.return_value = mock_service
- Line 188: # Mock the TherapeuticApproachService
- Line 189: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 190: mock_service = Mock()
- Line 191: mock_service.update_therapeutic_approach.return_value = sample_therapeutic_approach
- Line 192: mock_service_class.return_value = mock_service
- Line 212: # Mock the TherapeuticApproachService
- Line 213: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 214: mock_service = Mock()
- Line 215: mock_service.update_therapeutic_approach.return_value = None
- Line 216: mock_service_class.return_value = mock_service
- Line 236: # Mock the TherapeuticApproachService
- Line 237: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 238: mock_service = Mock()
- Line 239: mock_service.delete_therapeutic_approach.return_value = True
- Line 240: mock_service_class.return_value = mock_service
- Line 258: # Mock the TherapeuticApproachService
- Line 259: with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
- Line 260: mock_service = Mock()
- Line 261: mock_service.delete_therapeutic_approach.return_value = False
- Line 262: mock_service_class.return_value = mock_service

### Mock Db

- Line 25: def mock_db(self):
- Line 39: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 40: def test_get_therapeutic_approaches_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
- Line 43: mock_get_db.return_value = mock_db
- Line 61: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 63: self, mock_get_db, client, mock_db, sample_therapeutic_approach
- Line 67: mock_get_db.return_value = mock_db
- Line 84: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 86: self, mock_get_db, client, mock_db, sample_therapeutic_approach
- Line 90: mock_get_db.return_value = mock_db
- Line 111: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 112: def test_get_therapeutic_approach_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
- Line 115: mock_get_db.return_value = mock_db
- Line 134: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 135: def test_get_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
- Line 138: mock_get_db.return_value = mock_db
- Line 154: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 155: def test_create_therapeutic_approach_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
- Line 158: mock_get_db.return_value = mock_db
- Line 182: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 183: def test_update_therapeutic_approach_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
- Line 186: mock_get_db.return_value = mock_db
- Line 206: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 207: def test_update_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
- Line 210: mock_get_db.return_value = mock_db
- Line 230: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 231: def test_delete_therapeutic_approach_success(self, mock_get_db, client, mock_db):
- Line 234: mock_get_db.return_value = mock_db
- Line 252: @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
- Line 253: def test_delete_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
- Line 256: mock_get_db.return_value = mock_db

---

## Resumen

- **Total de archivos analizados**: 14
- **Archivos problemáticos**: 9
- **Archivos correctos**: 5

### Recomendaciones

1. Refactorizar archivos problemáticos para eliminar mocks
2. Usar base de datos real en tests de integración
3. Separar claramente unit tests (con mocks) de integration tests (sin mocks)
