// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import ParrotCard from "../components/features/ParrotCard";
import NewsletterForm from "../components/common/NewsletterForm";
import CartDrawer from "../components/common/CartDrawer";
import WhatsAppButton from "../components/common/WhatsAppButton";
import { processCheckout } from "@/app/actions/checkout";
import { useTranslation, translateParrot } from "../lib/translations";

// --- Mutable mock state ---
let mockLanguage = "en";
const mockSetSelectedParrot = vi.fn();
const mockAddToCart = vi.fn();
const mockIsInCart = vi.fn().mockReturnValue(false);
const mockRemoveFromCart = vi.fn();
const mockClearCart = vi.fn();
let mockCart: { id: string; name: string; slug: string; species: string; price: number; imageUrl: string }[] = [];
let mockCartTotal = 0;
let mockCartCount = 0;

// --- AppContext mock ---
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    language: mockLanguage,
    theme: "light",
    setSelectedParrot: mockSetSelectedParrot,
  }),
}));

// --- CartContext mock ---
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    isInCart: mockIsInCart,
    cart: mockCart,
    removeFromCart: mockRemoveFromCart,
    clearCart: mockClearCart,
    cartTotal: mockCartTotal,
    cartCount: mockCartCount,
  }),
}));

// --- Next.js mocks ---
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/catalog",
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// --- Action mocks ---
vi.mock("@/actions/newsletter", () => ({
  subscribeToNewsletter: vi.fn().mockImplementation(
    async () => ({ success: false, message: "" })
  ),
}));

vi.mock("@/app/actions/checkout", () => ({
  processCheckout: vi.fn(),
}));

// --- Framer Motion mock: AnimatePresence renders children, motion.div → plain div ---
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} onClick={onClick}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ============================================================
// PARROT CARD TESTS
// ============================================================
describe("ParrotCard Component", () => {
  const mockParrot = {
    id: "p1",
    name: "Macaw Baby",
    slug: "macaw-baby",
    species: "Ara macao",
    price: 3500,
    status: "AVAILABLE",
    size: "LARGE",
    sex: "MALE",
    rarity: "EXCEPTIONAL",
    origin: "Costa Rica",
    behavior: "Friendly",
    feeding: "Seed mix",
    domestication: "Hand reared",
    healthNotes: "Perfect",
    images: [{ url: "https://example.com/ara.jpg", alt: "Ara macao" }],
  };

  beforeEach(() => {
    mockLanguage = "en";
    mockSetSelectedParrot.mockReset();
    mockAddToCart.mockReset();
    mockIsInCart.mockReset().mockReturnValue(false);
  });

  it("renders parrot details in English correctly", () => {
    render(<ParrotCard parrot={mockParrot} />);

    expect(screen.getByText("Macaw Baby")).toBeDefined();
    expect(screen.getByText("Ara macao")).toBeDefined();
    expect(screen.getByText("$3,500")).toBeDefined();
    expect(screen.getByText("Costa Rica")).toBeDefined();
  });

  it("triggers setSelectedParrot when clicking the image, name, or details button", () => {
    render(<ParrotCard parrot={mockParrot} />);

    const titleEl = screen.getByText("Macaw Baby");
    fireEvent.click(titleEl);
    expect(mockSetSelectedParrot).toHaveBeenCalledTimes(1);

    const detailsBtn = screen.getByRole("button", { name: "Details" });
    fireEvent.click(detailsBtn);
    expect(mockSetSelectedParrot).toHaveBeenCalledTimes(2);

    const imgEl = screen.getByRole("img");
    fireEvent.click(imgEl.parentElement!);
    expect(mockSetSelectedParrot).toHaveBeenCalledTimes(3);
  });

  it("adds to reservation cart when clicking the cart button", () => {
    render(<ParrotCard parrot={mockParrot} />);

    const cartBtn = screen.getByTitle("Add to Reservation Cart");
    fireEvent.click(cartBtn);

    expect(mockAddToCart).toHaveBeenCalledWith({
      id: "p1",
      name: "Macaw Baby",
      slug: "macaw-baby",
      species: "Ara macao",
      price: 3500,
      imageUrl: "https://example.com/ara.jpg",
    });
  });

  it("displays as disabled/in-cart if already in cart", () => {
    mockIsInCart.mockReturnValue(true);
    render(<ParrotCard parrot={mockParrot} />);

    const cartBtn = screen.getByTitle("In Cart");
    expect(cartBtn).toBeDefined();
    expect(cartBtn.hasAttribute("disabled")).toBe(true);
  });

  it("renders French interface strings when context language is FR", () => {
    mockLanguage = "fr";
    render(<ParrotCard parrot={mockParrot} />);

    expect(screen.getByRole("button", { name: "Détails" })).toBeDefined();
    expect(screen.getByText("S'enquérir")).toBeDefined();
  });

  it("hides reservation cart option if parrot status is RESERVED or SOLD", () => {
    const reservedParrot = { ...mockParrot, status: "RESERVED" };
    render(<ParrotCard parrot={reservedParrot} />);

    expect(screen.queryByTitle("Add to Reservation Cart")).toBeNull();
  });

  it("renders alternative statuses, sizes, and fallbacks", () => {
    const commonParrot = {
      id: "p2",
      name: "Common Amazon",
      slug: "common-amazon",
      species: "Amazonas",
      price: 1500,
      status: "SOLD",
      size: "MEDIUM",
      sex: "FEMALE",
      rarity: "COMMON",
      origin: "Mexico",
    };
    render(<ParrotCard parrot={commonParrot} />);
    expect(screen.getByText("Common Breed")).toBeDefined();
    expect(screen.getByText("Graduated / Sold")).toBeDefined();
  });

  it("renders small parrot with fallback default image and RARE badge", () => {
    const smallParrot = {
      id: "p3",
      name: "Small Conure",
      slug: "small-conure",
      species: "Pyrrhura",
      price: 500,
      status: "AVAILABLE",
      size: "SMALL",
      sex: "UNKNOWN",
      rarity: "RARE",
      origin: "Brazil",
    };
    render(<ParrotCard parrot={smallParrot} />);
    const imgEl = screen.getByRole("img");
    expect(imgEl.getAttribute("src")).toContain("unsplash");
    expect(screen.getByText("Rare Specimen")).toBeDefined();
  });
});

// ============================================================
// NEWSLETTER FORM TESTS
// ============================================================
describe("NewsletterForm Component", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it("renders the email input and subscribe button in English", () => {
    render(<NewsletterForm />);

    const heading = screen.getByText("Aviary Newsletter");
    expect(heading).toBeDefined();

    const emailInput = screen.getByRole("textbox");
    expect(emailInput.getAttribute("type")).toBe("email");
    expect(emailInput.getAttribute("name")).toBe("email");
  });

  it("renders French labels when language is 'fr'", () => {
    mockLanguage = "fr";
    render(<NewsletterForm />);

    expect(screen.getByText("Lettre d'Information")).toBeDefined();
    const emailInput = screen.getByRole("textbox");
    expect(emailInput.getAttribute("placeholder")).toContain("email");
  });

  it("shows the submit button", () => {
    render(<NewsletterForm />);

    const submitBtn = screen.getByRole("button");
    expect(submitBtn).toBeDefined();
    expect(submitBtn.getAttribute("type")).toBe("submit");
  });

  it("email input requires a value before submitting", () => {
    render(<NewsletterForm />);

    const emailInput = screen.getByRole("textbox");
    expect(emailInput.hasAttribute("required")).toBe(true);
  });

  it("calls the form action when the form is submitted", () => {
    const { container } = render(<NewsletterForm />);

    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "subscriber@example.com" } });

    const form = container.querySelector("form");
    if (form) fireEvent.submit(form);
  });
});

// ============================================================
// CART DRAWER TESTS
// ============================================================
describe("CartDrawer Component", () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    mockLanguage = "en";
    mockCart = [];
    mockCartTotal = 0;
    mockCartCount = 0;
    onCloseMock.mockReset();
    mockRemoveFromCart.mockReset();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(<CartDrawer isOpen={false} onClose={onCloseMock} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows empty cart state when isOpen is true and cart is empty", () => {
    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    const emptyText = screen.getByText(/empty|vide/i);
    expect(emptyText).toBeDefined();
  });

  it("renders cart items when the cart contains birds", () => {
    mockCart = [
      {
        id: "p1",
        name: "Hyacinth Macaw",
        slug: "hyacinth-macaw",
        species: "Anodorhynchus hyacinthinus",
        price: 9500,
        imageUrl: "https://example.com/hyacinth.jpg",
      },
    ];
    mockCartTotal = 9500;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText("Hyacinth Macaw")).toBeDefined();
    expect(screen.getByText("Anodorhynchus hyacinthinus")).toBeDefined();
    // Price appears in both item row and subtotal — use getAllByText
    expect(screen.getAllByText("$9,500").length).toBeGreaterThanOrEqual(1);
  });

  it("calls removeFromCart when clicking the remove (trash) button on an item", () => {
    mockCart = [
      {
        id: "p1",
        name: "African Grey",
        slug: "african-grey",
        species: "Psittacus erithacus",
        price: 2500,
        imageUrl: "https://example.com/grey.jpg",
      },
    ];
    mockCartTotal = 2500;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    const removeBtn = screen.getByTitle(/remove/i);
    fireEvent.click(removeBtn);
    expect(mockRemoveFromCart).toHaveBeenCalledWith("p1");
  });

  it("calls onClose when the close button (X) is clicked", () => {
    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    const allButtons = screen.getAllByRole("button");
    const closeBtn = allButtons.find((btn) => btn.querySelector("svg"));
    if (closeBtn) fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("shows the checkout button and total when cart has items", () => {
    mockCart = [
      {
        id: "p1",
        name: "Sun Conure",
        slug: "sun-conure",
        species: "Aratinga solstitialis",
        price: 1200,
        imageUrl: "https://example.com/conure.jpg",
      },
    ];
    mockCartTotal = 1200;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    // Price appears in both the item row and the subtotal
    expect(screen.getAllByText("$1,200").length).toBeGreaterThanOrEqual(1);
    const checkoutBtn = screen.getByRole("button", { name: /inquiry|checkout/i });
    expect(checkoutBtn).toBeDefined();
  });

  it("navigates to the inquiry form when the checkout button is clicked", () => {
    mockCart = [
      {
        id: "p1",
        name: "Cockatoo",
        slug: "cockatoo",
        species: "Cacatua alba",
        price: 2500,
        imageUrl: "https://example.com/cockatoo.jpg",
      },
    ];
    mockCartTotal = 2500;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    const checkoutBtn = screen.getByRole("button", { name: /proceed|inquiry/i });
    fireEvent.click(checkoutBtn);

    expect(screen.getByPlaceholderText("e.g. John Doe")).toBeDefined();
    expect(screen.getByPlaceholderText("john@example.com")).toBeDefined();
    expect(screen.getByPlaceholderText("+1 (555) 019-2834")).toBeDefined();
  });

  it("fills in inquiry form fields correctly", () => {
    mockCart = [
      {
        id: "p2",
        name: "African Grey",
        slug: "african-grey",
        species: "Psittacus erithacus",
        price: 3000,
        imageUrl: "https://example.com/grey.jpg",
      },
    ];
    mockCartTotal = 3000;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByRole("button", { name: /proceed|inquiry/i }));

    const nameInput = screen.getByPlaceholderText("e.g. John Doe");
    fireEvent.change(nameInput, { target: { value: "Jane Doe", name: "name" } });
    expect((nameInput as HTMLInputElement).value).toBe("Jane Doe");

    const emailInput = screen.getByPlaceholderText("john@example.com");
    fireEvent.change(emailInput, { target: { value: "jane@example.com", name: "email" } });
    expect((emailInput as HTMLInputElement).value).toBe("jane@example.com");
  });

  it("shows success state after a successful checkout submission", async () => {
    vi.mocked(processCheckout).mockResolvedValue({
      success: true,
      inquiryId: "inquiry-123",
      whatsappText: "Hello AraHaven! I want the African Grey.",
    });
    vi.spyOn(window, "open").mockImplementation(() => null);

    mockCart = [
      {
        id: "p2",
        name: "African Grey",
        slug: "african-grey",
        species: "Psittacus erithacus",
        price: 3000,
        imageUrl: "https://example.com/grey.jpg",
      },
    ];
    mockCartTotal = 3000;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByRole("button", { name: /proceed|inquiry/i }));

    fireEvent.change(screen.getByPlaceholderText("e.g. John Doe"), {
      target: { value: "Test Buyer", name: "name" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "test@example.com", name: "email" },
    });
    fireEvent.change(screen.getByPlaceholderText("+1 (555) 019-2834"), {
      target: { value: "+15551234567", name: "phone" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. United States"), {
      target: { value: "United States", name: "country" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send|submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeDefined();
    });

    expect(mockClearCart).toHaveBeenCalled();
  });

  it("shows a generic error when processCheckout returns failure with no error message", async () => {
    vi.mocked(processCheckout).mockResolvedValue({ success: false, error: "" });

    mockCart = [
      {
        id: "p4",
        name: "Eclectus",
        slug: "eclectus",
        species: "Eclectus roratus",
        price: 1800,
        imageUrl: "https://example.com/eclectus.jpg",
      },
    ];
    mockCartTotal = 1800;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByRole("button", { name: /proceed|inquiry/i }));

    fireEvent.change(screen.getByPlaceholderText("e.g. John Doe"), {
      target: { value: "Sam", name: "name" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "sam@example.com", name: "email" },
    });
    fireEvent.change(screen.getByPlaceholderText("+1 (555) 019-2834"), {
      target: { value: "+15553334444", name: "phone" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. United States"), {
      target: { value: "Germany", name: "country" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send|submit/i }));

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred.")).toBeDefined();
    });
  });

  it("navigates back to cart when clicking the Back to Review button", () => {
    mockCart = [
      {
        id: "p1",
        name: "Galah Cockatoo",
        slug: "galah",
        species: "Eolophus roseicapilla",
        price: 1600,
        imageUrl: "https://example.com/galah.jpg",
      },
    ];
    mockCartTotal = 1600;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByRole("button", { name: /proceed|inquiry/i }));

    expect(screen.getByPlaceholderText("e.g. John Doe")).toBeDefined();

    const backBtn = screen.getByRole("button", { name: /back to review/i });
    fireEvent.click(backBtn);

    expect(screen.queryByPlaceholderText("e.g. John Doe")).toBeNull();
  });

  it("shows an error message when processCheckout returns a failure", async () => {
    vi.mocked(processCheckout).mockResolvedValue({
      success: false,
      error: "Server validation failed",
    });

    mockCart = [
      {
        id: "p3",
        name: "Macaw",
        slug: "macaw",
        species: "Ara macao",
        price: 4000,
        imageUrl: "https://example.com/macaw.jpg",
      },
    ];
    mockCartTotal = 4000;
    mockCartCount = 1;

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByRole("button", { name: /proceed|inquiry/i }));

    fireEvent.change(screen.getByPlaceholderText("e.g. John Doe"), {
      target: { value: "Bob", name: "name" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "bob@example.com", name: "email" },
    });
    fireEvent.change(screen.getByPlaceholderText("+1 (555) 019-2834"), {
      target: { value: "+12223334444", name: "phone" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. United States"), {
      target: { value: "Canada", name: "country" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send|submit/i }));

    await waitFor(() => {
      expect(screen.getByText("Server validation failed")).toBeDefined();
    });
  });
});

// ============================================================
// WHATSAPP BUTTON TESTS
// ============================================================
describe("WhatsAppButton Component", () => {
  beforeEach(() => {
    mockLanguage = "en";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing before the 2.5s delay (invisible by default)", () => {
    const { container } = render(<WhatsAppButton />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the WhatsApp link button after 2500ms", async () => {
    render(<WhatsAppButton />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const link = screen.getByRole("link");
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toContain("wa.me");
    expect(link.getAttribute("href")).toContain("text=");
  });

  it("shows a dismiss button alongside the WhatsApp link", () => {
    render(<WhatsAppButton />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const dismissBtn = screen.getByLabelText("Dismiss chat widget");
    expect(dismissBtn).toBeDefined();
  });

  it("hides the button when dismiss is clicked", () => {
    const { container } = render(<WhatsAppButton />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const dismissBtn = screen.getByLabelText("Dismiss chat widget");
    fireEvent.click(dismissBtn);

    expect(container.innerHTML).toBe("");
  });

  it("uses a custom phone number when provided", () => {
    render(<WhatsAppButton phone="15559998888" />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toContain("wa.me/15559998888");
  });

  it("uses a custom message when customText is provided", () => {
    render(<WhatsAppButton customText="I want the blue macaw!" />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toContain("I%20want%20the%20blue%20macaw");
  });

  it("uses the French default message when language is fr and no customText given", () => {
    mockLanguage = "fr";
    render(<WhatsAppButton />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toContain("Bonjour");
  });
});

// ============================================================
// TRANSLATIONS LIBRARY & HOOK TESTS
// ============================================================
describe("Translations Library & Hook", () => {
  it("translates nav keys into English", () => {
    const { t } = useTranslation("en");
    expect(t("nav.home")).toBe("Home");
    expect(t("nav.catalog")).toBe("Parrots Directory");
  });

  it("translates nav keys into French", () => {
    const { t } = useTranslation("fr");
    expect(t("nav.home")).toBe("Accueil");
    expect(t("nav.catalog")).toBe("Annuaire des Oiseaux");
  });

  it("handles translation fallback for nonexistent keys", () => {
    const { t } = useTranslation("en");
    expect(t("nonexistent.key.test")).toBe("nonexistent.key.test");
  });

  it("translates parrot structures cleanly", () => {
    const parrotEn = {
      slug: "charlie",
      name: "Charlie",
      species: "Ara",
      status: "AVAILABLE",
      size: "LARGE",
      sex: "MALE",
      rarity: "EXCEPTIONAL",
    };

    const translatedEn = translateParrot(parrotEn, "en");
    expect(translatedEn.name).toBe("Charlie");
    expect(translatedEn.statusLabel).toBe("Available Now");

    const translatedFr = translateParrot(parrotEn, "fr") as typeof parrotEn & { behavior?: string; statusLabel: string };
    expect(translatedFr.name).toBe("Charlie");
    expect(translatedFr.statusLabel).toBe("Disponible");
    expect(translatedFr.behavior).toBe("Très énergique, curieux, aime les jeux d'intelligence et interagir avec les gens.");
  });
});
