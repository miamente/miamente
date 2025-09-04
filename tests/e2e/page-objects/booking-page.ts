import { Page, Locator, expect } from "@playwright/test";

export class BookingPage {
  readonly page: Page;
  readonly professionalsList: Locator;
  readonly professionalCard: Locator;
  readonly viewScheduleButton: Locator;
  readonly availableSlots: Locator;
  readonly slotButton: Locator;
  readonly bookButton: Locator;
  readonly paymentForm: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly cardholderNameInput: Locator;
  readonly payButton: Locator;
  readonly confirmationMessage: Locator;
  readonly jitsiUrl: Locator;
  readonly reviewModal: Locator;
  readonly ratingStars: Locator;
  readonly reviewComment: Locator;
  readonly submitReviewButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Professionals listing
    this.professionalsList = page.locator('[data-testid="professionals-list"]');
    this.professionalCard = page.locator('[data-testid="professional-card"]').first();
    this.viewScheduleButton = page.locator('button:has-text("Ver horarios")').first();

    // Booking flow
    this.availableSlots = page.locator('[data-testid="available-slots"]');
    this.slotButton = page.locator('[data-testid="slot-button"]').first();
    this.bookButton = page.locator('button:has-text("Reservar")');

    // Payment form
    this.paymentForm = page.locator('[data-testid="payment-form"]');
    this.cardNumberInput = page.locator('input[name="cardNumber"]');
    this.expiryInput = page.locator('input[name="expiry"]');
    this.cvvInput = page.locator('input[name="cvv"]');
    this.cardholderNameInput = page.locator('input[name="cardholderName"]');
    this.payButton = page.locator('button:has-text("Pagar")');

    // Confirmation
    this.confirmationMessage = page.locator('[data-testid="confirmation-message"]');
    this.jitsiUrl = page.locator('[data-testid="jitsi-url"]');

    // Review
    this.reviewModal = page.locator('[data-testid="review-modal"]');
    this.ratingStars = page.locator('[data-testid="rating-stars"]');
    this.reviewComment = page.locator('textarea[name="comment"]');
    this.submitReviewButton = page.locator('button:has-text("Enviar Reseña")');
  }

  async gotoProfessionals(): Promise<void> {
    await this.page.goto("/professionals");
    await this.page.waitForLoadState("networkidle");
  }

  async selectProfessional(): Promise<void> {
    await this.professionalCard.waitFor({ state: "visible" });
    await this.viewScheduleButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async selectAvailableSlot(): Promise<void> {
    await this.availableSlots.waitFor({ state: "visible" });
    await this.slotButton.click();
    await this.bookButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async fillPaymentForm(paymentData: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardholderName: string;
  }): Promise<void> {
    await this.paymentForm.waitFor({ state: "visible" });
    await this.cardNumberInput.fill(paymentData.cardNumber);
    await this.expiryInput.fill(paymentData.expiry);
    await this.cvvInput.fill(paymentData.cvv);
    await this.cardholderNameInput.fill(paymentData.cardholderName);
  }

  async submitPayment(): Promise<void> {
    await this.payButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectBookingConfirmation(): Promise<void> {
    await expect(this.confirmationMessage).toBeVisible();
    await expect(this.confirmationMessage).toContainText("Cita reservada exitosamente");
  }

  async expectJitsiUrl(): Promise<void> {
    await expect(this.jitsiUrl).toBeVisible();
    await expect(this.jitsiUrl).toHaveAttribute("href", /meet\.jit\.si/);
  }

  async openReviewModal(): Promise<void> {
    await this.page.locator('button:has-text("Calificar Sesión")').click();
    await this.reviewModal.waitFor({ state: "visible" });
  }

  async submitReview(rating: number, comment: string): Promise<void> {
    // Click on the nth star (rating)
    await this.ratingStars.locator(`[data-rating="${rating}"]`).click();
    await this.reviewComment.fill(comment);
    await this.submitReviewButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectReviewSubmitted(): Promise<void> {
    await expect(this.page.locator("text=Reseña enviada exitosamente")).toBeVisible();
  }

  async expectValidationError(field: string): Promise<void> {
    const fieldError = this.page.locator(`[data-testid="${field}-error"], #${field}-error`);
    await expect(fieldError).toBeVisible();
  }
}
