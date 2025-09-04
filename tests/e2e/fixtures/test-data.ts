// Test data fixtures for E2E tests

export const TEST_FIXTURES = {
  // User test data
  users: {
    regular: {
      email: "test-user@miamente.com",
      password: "TestPassword123!",
      fullName: "Test User",
      phone: "+573001234567",
    },
    professional: {
      email: "test-professional@miamente.com",
      password: "TestPassword123!",
      fullName: "Dr. Test Professional",
      phone: "+573001234568",
      specialty: "Psicología Clínica",
      rateCents: 80000,
      bio: "Profesional de prueba con experiencia en psicología clínica.",
    },
    admin: {
      email: "test-admin@miamente.com",
      password: "TestPassword123!",
      fullName: "Test Admin",
      phone: "+573001234569",
    },
  },

  // Payment test data
  payments: {
    valid: {
      cardNumber: "4111111111111111",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    },
    declined: {
      cardNumber: "4000000000000002",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    },
    invalid: {
      cardNumber: "1234567890123456",
      expiry: "13/25",
      cvv: "12",
      cardholderName: "",
    },
  },

  // Appointment test data
  appointments: {
    duration: 60, // minutes
    timezone: "America/Bogota",
    tomorrow: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    },
    nextWeek: () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split("T")[0];
    },
  },

  // Review test data
  reviews: {
    excellent: {
      rating: 5,
      comment: "Excelente profesional, muy recomendado. La sesión fue muy útil y me ayudó mucho.",
    },
    good: {
      rating: 4,
      comment: "Muy buen profesional, la sesión fue productiva.",
    },
    average: {
      rating: 3,
      comment: "Profesional competente, la sesión fue aceptable.",
    },
    poor: {
      rating: 2,
      comment: "La sesión no cumplió mis expectativas.",
    },
    bad: {
      rating: 1,
      comment: "Muy mala experiencia, no recomiendo.",
    },
  },

  // Professional specialties
  specialties: [
    "Psicología Clínica",
    "Psiquiatría",
    "Terapia Cognitivo-Conductual",
    "Terapia Familiar",
    "Psicología Infantil",
    "Neuropsicología",
    "Psicología Organizacional",
    "Terapia de Pareja",
  ],

  // Test URLs
  urls: {
    staging: "https://miamente-staging.web.app",
    production: "https://miamente-prod.web.app",
    local: "http://localhost:3000",
  },

  // Mock data
  mock: {
    jitsiUrl: (appointmentId: string) => `https://meet.jit.si/miamente-${appointmentId}`,
    appointmentId: () => `test-appointment-${Date.now()}`,
    emailVerificationCode: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
  },

  // Test timeouts
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
    veryLong: 60000,
  },

  // Test selectors
  selectors: {
    // Common selectors
    loadingSpinner: '[data-testid="loading-spinner"]',
    errorMessage: '[role="alert"], .text-red-600, .text-red-400',
    successMessage: ".text-green-600, .text-green-400",

    // Form selectors
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    submitButton: 'button[type="submit"]',

    // Navigation selectors
    loginButton: 'button:has-text("Iniciar Sesión")',
    registerButton: 'button:has-text("Crear Cuenta")',
    logoutButton: 'button:has-text("Cerrar Sesión")',

    // Professional selectors
    professionalCard: '[data-testid="professional-card"]',
    viewScheduleButton: 'button:has-text("Ver horarios")',
    availableSlot: '[data-testid="available-slot"]',

    // Payment selectors
    paymentForm: '[data-testid="payment-form"]',
    cardNumberInput: 'input[name="cardNumber"]',
    expiryInput: 'input[name="expiry"]',
    cvvInput: 'input[name="cvv"]',
    cardholderNameInput: 'input[name="cardholderName"]',
    payButton: 'button:has-text("Pagar")',

    // Review selectors
    reviewModal: '[data-testid="review-modal"]',
    ratingStars: '[data-testid="rating-stars"]',
    reviewComment: 'textarea[name="comment"]',
    submitReviewButton: 'button:has-text("Enviar Reseña")',

    // Admin selectors
    adminDashboard: '[data-testid="admin-dashboard"]',
    metricsCard: '[data-testid="metrics-card"]',
    professionalsTable: '[data-testid="professionals-table"]',
    appointmentsTable: '[data-testid="appointments-table"]',
    paymentsTable: '[data-testid="payments-table"]',
    verifyButton: 'button:has-text("Verificar")',
  },
};

// Helper functions for test data generation
export const generateTestData = {
  email: (prefix: string = "test") => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}@miamente.com`;
  },

  phone: () => {
    const random = Math.floor(Math.random() * 9000000) + 1000000;
    return `+57300${random}`;
  },

  name: (prefix: string = "Test") => {
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix} ${random}`;
  },

  specialty: () => {
    const specialties = TEST_FIXTURES.specialties;
    return specialties[Math.floor(Math.random() * specialties.length)];
  },

  rate: () => {
    const rates = [50000, 60000, 70000, 80000, 90000, 100000, 120000, 150000];
    return rates[Math.floor(Math.random() * rates.length)];
  },

  date: (daysFromNow: number = 1) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split("T")[0];
  },

  time: () => {
    const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 7 PM
    const minutes = Math.random() < 0.5 ? "00" : "30";
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  },
};

// Test environment configuration
export const TEST_CONFIG = {
  // Base URLs for different environments
  baseUrls: {
    local: "http://localhost:3000",
    staging: "https://miamente-staging.web.app",
    production: "https://miamente-prod.web.app",
  },

  // Test data cleanup
  cleanup: {
    // Users to clean up after tests
    users: [] as string[],
    // Appointments to clean up after tests
    appointments: [] as string[],
    // Reviews to clean up after tests
    reviews: [] as string[],
  },

  // Test flags
  flags: {
    skipEmailVerification: false,
    skipPaymentProcessing: false,
    skipEmailSending: false,
    useMockData: true,
  },
};
