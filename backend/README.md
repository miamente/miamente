# Miamente Backend API

Backend API for the Miamente mental health platform built with FastAPI.

## Features

- **Authentication**: JWT-based authentication for users and professionals
- **Availability**: Professional availability management
- **Database**: PostgreSQL with SQLAlchemy ORM

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Primary database
- **Redis**: Caching and task queue
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **JWT**: Authentication tokens

## Quick Start

### Prerequisites

- **Python 3.13.7** (exact version required)
- PostgreSQL
- Redis (optional, for caching and background tasks)

> **Note**: This project requires Python 3.13.7 specifically. Use pyenv, conda, or similar tools to manage Python versions.

### Python Version Management

This project uses Python 3.13.7. The following files ensure version consistency:

- `.python-version` - For pyenv users
- `runtime.txt` - For deployment platforms (Heroku, Railway, etc.)
- `pyproject.toml` - Specifies `requires-python = ">=3.13,<3.14"` and manages all dependencies

> **Note**: This project uses `pyproject.toml` as the single source of truth for dependencies. No `requirements.txt` files are used.

#### Using pyenv (Recommended)

```bash
# Install Python 3.13.7
pyenv install 3.13.7

# Set local version for this project
pyenv local 3.13.7

# Verify version
python --version  # Should output: Python 3.13.7
```

#### Using conda

```bash
# Create environment with specific Python version
conda create -n miamente-backend python=3.13.7

# Activate environment
conda activate miamente-backend
```

### Dependency Management

This project uses `pyproject.toml` for dependency management. Here are the available dependency groups:

- **Production**: `pip install -e .` (installs only runtime dependencies)
- **Development**: `pip install -e ".[dev]"` (includes testing, linting, and formatting tools)

#### Adding Dependencies

To add a new dependency, edit `pyproject.toml`:

```toml
# For production dependencies
dependencies = [
    "fastapi==0.115.6",
    "your-new-package==1.0.0",
]

# For development dependencies
[project.optional-dependencies]
dev = [
    "pytest==8.3.4",
    "your-dev-package==1.0.0",
]
```

Then reinstall:

```bash
pip install -e ".[dev]"
```

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
# Install production dependencies
pip install -e .

# Or install with development dependencies
pip install -e ".[dev]"
```

4. Copy environment variables:

```bash
cp env.example .env
```

5. Update the `.env` file with your configuration:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/miamente

# JWT
SECRET_KEY=your-secret-key-here
```

6. Database migrations and seed (minimal commands)

```bash
# From repo root
cd backend

# Create and activate virtualenv (first time only)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Copy and edit environment
cp env.example .env
# Edit .env to set DATABASE_URL and SECRET_KEY

# Run migrations
alembic stamp head
alembic upgrade head

# Seed demo data
python -m app.services.seed_demo_data
```

7. Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register/user` - Register new user
- `POST /api/v1/auth/register/professional` - Register new professional
- `POST /api/v1/auth/login/user` - Login user
- `POST /api/v1/auth/login/professional` - Login professional
- `POST /api/v1/auth/refresh` - Refresh access token

### Professionals

- `GET /api/v1/professionals/` - List all professionals
- `GET /api/v1/professionals/{id}` - Get professional details

### Availability

- `GET /api/v1/availability/professional/{id}` - Get professional availability
- `POST /api/v1/availability/` - Create availability slot
- `POST /api/v1/availability/bulk` - Create multiple availability slots

## Database Models

### User

- Basic user information and preferences
- Authentication and profile data

### Professional

- Professional information and credentials
- Specialties, rates, and availability settings

### Availability

- Time slots for professionals
- Booking status and management

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
isort .
```

### Type Checking

```bash
mypy .
```

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-production-secret-key
BACKEND_CORS_ORIGINS=https://your-frontend-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
