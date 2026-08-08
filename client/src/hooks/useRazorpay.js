/**
 * Payment handler.
 *
 * - If VITE_RAZORPAY_KEY_ID is set AND backend returns a real order → opens Razorpay SDK checkout
 * - If keys are missing OR backend returned a mock order → resolves with { success:true, mock:true }
 *   so ListingDetail can show its own PaymentModal instead.
 */

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript() {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Returns true when we have real Razorpay credentials and a real order.
 */
export function isRazorpayEnabled(order) {
  return !!import.meta.env.VITE_RAZORPAY_KEY_ID && !order?.mock;
}

/**
 * Opens the Razorpay checkout modal (only called when real keys exist).
 */
export async function openRazorpayCheckout({ order, amount, name, user }) {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!keyId || order?.mock) {
    // Signal to caller to use the custom PaymentModal instead
    return { success: false, useCustomModal: true };
  }

  const loaded = await loadScript();
  if (!loaded) {
    throw new Error("Failed to load Razorpay checkout. Check your internet connection.");
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "Wonderlust",
      description: name,
      order_id: order.id,
      prefill: {
        name:  user?.username || "",
        email: user?.email    || "",
      },
      theme: { color: "#e11d48" },
      handler(response) {
        resolve({
          success:   true,
          paymentId: response.razorpay_payment_id,
          orderId:   response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss() {
          reject(new Error("Payment cancelled"));
        },
      },
    });
    rzp.open();
  });
}
