type PaystackSuccessResponse = { reference?: string; trxref?: string };

type PaystackResumeCallbacks = {
  onSuccess?: (response: PaystackSuccessResponse) => void;
  onCancel?: () => void;
};

type PaystackSetupOptions = {
  key: string;
  email: string;
  amount: number;
  ref: string;
  access_code: string;
  callback: (response: PaystackSuccessResponse) => void;
  onClose: () => void;
};

type PaystackHandler = { openIframe: () => void };

type PaystackPopApi = {
  setup?: (options: PaystackSetupOptions) => PaystackHandler;
  resumeTransaction?: (accessCode: string, callbacks?: PaystackResumeCallbacks) => void;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPopApi & (new () => PaystackPopApi);
  }
}

const PAYSTACK_SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";

let scriptLoadPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack is only available in the browser"));
  }
  if (window.PaystackPop) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }
  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack")));
      return;
    }
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

function resolveReference(response: PaystackSuccessResponse): string | undefined {
  return response.reference || response.trxref;
}

function resumeTransaction(
  pop: PaystackPopApi,
  accessCode: string,
  onSuccess: (reference: string) => void,
  onClose?: () => void
): void {
  const callbacks: PaystackResumeCallbacks = {
    onSuccess: (response) => {
      const ref = resolveReference(response);
      if (ref) onSuccess(ref);
    },
    onCancel: () => onClose?.(),
  };

  if (typeof pop.resumeTransaction === "function") {
    pop.resumeTransaction(accessCode, callbacks);
    return;
  }

  const instance = new (pop as unknown as new () => PaystackPopApi)();
  if (typeof instance.resumeTransaction === "function") {
    instance.resumeTransaction(accessCode, callbacks);
    return;
  }

  throw new Error("Paystack resumeTransaction is not available");
}

export interface OpenPaystackPaymentOptions {
  accessCode: string;
  publicKey: string;
  email: string;
  amountKobo: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

/**
 * Opens Paystack checkout for a server-initialized transaction.
 * @see https://paystack.com/docs/developer-tools/inlinejs/
 */
export async function openPaystackPayment(options: OpenPaystackPaymentOptions): Promise<void> {
  await loadPaystackScript();
  const pop = window.PaystackPop;
  if (!pop) {
    throw new Error("Paystack could not be loaded");
  }

  const onSuccess = (response: PaystackSuccessResponse) => {
    const ref = resolveReference(response);
    if (ref) options.onSuccess(ref);
  };

  if (typeof pop.setup === "function") {
    try {
      const handler = pop.setup({
        key: options.publicKey,
        email: options.email,
        amount: options.amountKobo,
        ref: options.reference,
        access_code: options.accessCode,
        callback: onSuccess,
        onClose: () => options.onClose?.(),
      });
      handler.openIframe();
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!options.accessCode) {
        throw e instanceof Error ? e : new Error(message);
      }
    }
  }

  if (!options.accessCode) {
    throw new Error("Payment session is missing an access code");
  }

  resumeTransaction(pop, options.accessCode, options.onSuccess, options.onClose);
}
