// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ParrotCard from "../components/features/ParrotCard";
import { useTranslation, translateParrot } from "../lib/translations";

// Dynamic variables to mutate states inside the mocks
let mockLanguage = "en";
const mockSetSelectedParrot = vi.fn();
const mockAddToCart = vi.fn();
const mockIsInCart = vi.fn().mockReturnValue(false);

// Mock AppContext
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    language: mockLanguage,
    theme: "light",
    setSelectedParrot: mockSetSelectedParrot,
  }),
}));

// Mock CartContext
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    isInCart: mockIsInCart,
  }),
}));

// Mock Next Navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/catalog",
  useSearchParams: () => ({
    get: () => null,
  }),
}));

// Mock Next Image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

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
    
    // Click on Title
    const titleEl = screen.getByText("Macaw Baby");
    fireEvent.click(titleEl);
    expect(mockSetSelectedParrot).toHaveBeenCalledTimes(1);

    // Click on Details button
    const detailsBtn = screen.getByRole("button", { name: "Details" });
    fireEvent.click(detailsBtn);
    expect(mockSetSelectedParrot).toHaveBeenCalledTimes(2);

    // Click on Image Container parent
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
    
    // There shouldn't be an add to cart button title
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
