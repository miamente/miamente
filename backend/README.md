# Miamente Backend API

Backend API for the Miamente mental health platform built with FastAPI.

## Features

- **Authentication**: JWT-based authentication for users and professionals
- **Appointments**: Book, manage, and track mental health appointments
- **Availability**: Professional availability management
- **Payments**: Payment processing with mock provider (extensible to Stripe)
- **Email**: Automated email notifications using SendGrid
- **Database**: PostgreSQL with SQLAlchemy ORM

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Primary database
- **Redis**: Caching and task queue
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **SendGrid**: Email service
- **JWT**: Authentication tokens

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis (optional, for caching and background tasks)

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
pip install -r requirements.txt
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

# Email (optional for development)
SENDGRID_API_KEY=your-sendgrid-api-key
```

6. Run database migrations:

```bash
alembic upgrade head
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

### Appointments

- `POST /api/v1/appointments/book` - Book new appointment
- `GET /api/v1/appointments/` - Get user appointments
- `GET /api/v1/appointments/{id}` - Get appointment details
- `PUT /api/v1/appointments/{id}` - Update appointment
- `DELETE /api/v1/appointments/{id}` - Cancel appointment

### Professionals

- `GET /api/v1/professionals/` - List all professionals
- `GET /api/v1/professionals/{id}` - Get professional details

### Availability

- `GET /api/v1/availability/professional/{id}` - Get professional availability
- `POST /api/v1/availability/` - Create availability slot
- `POST /api/v1/availability/bulk` - Create multiple availability slots

### Payments

- `POST /api/v1/payments/intent` - Create payment intent
- `POST /api/v1/payments/confirm/{id}` - Confirm payment
- `GET /api/v1/payments/{id}` - Get payment details

## Database Models

### User

- Basic user information and preferences
- Authentication and profile data

### Professional

- Professional information and credentials
- Specialties, rates, and availability settings

### Appointment

- Appointment details and status
- Payment and session information

### Availability

- Time slots for professionals
- Booking status and management

### Payment

- Payment records and status
- Integration with payment providers

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
SENDGRID_API_KEY=your-sendgrid-api-key
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
