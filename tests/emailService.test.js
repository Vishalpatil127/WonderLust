const { buildBookingConfirmationEmail } = require("../services/emailService");

describe("emailService", () => {
  test("buildBookingConfirmationEmail returns a structured booking message", () => {
    const message = buildBookingConfirmationEmail({
      customerName: "Ava",
      listingTitle: "Ocean View Loft",
      location: "Malibu",
      checkIn: "2026-08-01",
      checkOut: "2026-08-05",
      guests: 2,
      totalPrice: 2400,
    });

    expect(message.subject).toContain("Booking Confirmed");
    expect(message.text).toContain("Ocean View Loft");
    expect(message.text).toContain("Malibu");
    expect(message.text).toContain("2400");
  });
});
