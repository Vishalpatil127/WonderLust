const { validateReviewInput, calculateAggregateRating } = require("../services/reviewService");

describe("reviewService", () => {
  test("validateReviewInput rejects invalid ratings and missing comment", () => {
    expect(() => validateReviewInput({ rating: 0, comment: "" })).toThrow(/rating/i);
    expect(() => validateReviewInput({ rating: 6, comment: "Great stay" })).toThrow(/rating/i);
    expect(() => validateReviewInput({ rating: 4, comment: "" })).toThrow(/comment/i);
  });

  test("calculateAggregateRating returns average and count from reviews", () => {
    const result = calculateAggregateRating([
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ]);

    expect(result.averageRating).toBe(4);
    expect(result.reviewCount).toBe(3);
  });
});
