#!/usr/bin/env python3
"""
scripts/build-user-guides.py

Generates the official bilingual Word (.docx) user guides for Pawelium 2.0 SUPER_ADMIN:
- docs/user-guide/Pawelium_SUPER_ADMIN_Guide_EN.docx
- docs/user-guide/Pawelium_Guide_SUPER_ADMIN_FR.docx

Includes executive styling, brand palette (#183C32 Forest, #B69A65 Gold),
structured step-by-step workflows, security notices, and embedded high-resolution screenshots.
"""

import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

COLOR_PRIMARY = RGBColor(24, 60, 50)     # #183C32 Deep Forest Green
COLOR_GOLD = RGBColor(182, 154, 101)     # #B69A65 Accent Gold
COLOR_DARK = RGBColor(32, 40, 35)        # #202823 Dark Charcoal
COLOR_MUTED = RGBColor(100, 100, 100)    # Subdued gray
COLOR_ALERT_RED = RGBColor(180, 40, 40)

HEX_LIGHT_BG = "F4F6F4"
HEX_GOLD_BORDER = "B69A65"
HEX_PRIMARY = "183C32"

SCREENSHOTS_DIR = os.path.join(os.getcwd(), "docs", "user-guide", "screenshots")

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def add_callout(doc, text, title="SECURITY & COMPLIANCE REQUIREMENT", border_color=HEX_GOLD_BORDER, bg_color=HEX_LIGHT_BG):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    
    # Border left
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
        f'  <w:top w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"🔒 {title}\n")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(9.5)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY
    
    run_text = p.add_run(text)
    run_text.font.name = "Calibri"
    run_text.font.size = Pt(9.5)
    run_text.font.color.rgb = COLOR_DARK
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def embed_screenshot(doc, screenshot_name, lang, caption):
    img_path = os.path.join(SCREENSHOTS_DIR, lang, f"{screenshot_name}.png")
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(12)
        run_cap = p_cap.add_run(f"Figure: {caption}")
        run_cap.font.name = "Calibri"
        run_cap.font.size = Pt(8.5)
        run_cap.font.italic = True
        run_cap.font.color.rgb = COLOR_MUTED
    else:
        # Placeholder indicator
        p_sub = doc.add_paragraph()
        run_sub = p_sub.add_run(f"[Screenshot: {screenshot_name}.png ({caption})]")
        run_sub.font.italic = True
        run_sub.font.size = Pt(8.5)
        run_sub.font.color.rgb = COLOR_MUTED

def build_guide_en(out_path):
    doc = Document()
    
    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # ─── COVER PAGE ─────────────────────────────────────────────────────────────
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(72)
    title_p.paragraph_format.space_after = Pt(6)
    r_brand = title_p.add_run("PAWELIUM 2.0")
    r_brand.font.name = "Georgia"
    r_brand.font.size = Pt(36)
    r_brand.font.bold = True
    r_brand.font.color.rgb = COLOR_PRIMARY
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(24)
    r_sub = sub_p.add_run("SUPER_ADMIN OPERATIONAL HANDBOOK & ARCHITECTURAL MANUAL")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(14)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_GOLD

    desc_p = doc.add_paragraph()
    desc_p.paragraph_format.space_after = Pt(140)
    r_desc = desc_p.add_run(
        "Confidential documentation and master operator procedure guide for Pawelium luxury companion marketplace.\n"
        "Covers complete platform console workflows, single-admin security governance, card-only orchestration, "
        "and bilingual content operations."
    )
    r_desc.font.name = "Calibri"
    r_desc.font.size = Pt(11)
    r_desc.font.color.rgb = COLOR_DARK

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_after = Pt(12)
    r_meta = meta_p.add_run(
        "CLASSIFICATION: RESTRICTED — SUPER_ADMIN CLEARANCE ONLY\n"
        "VERSION: 2.0.4 (RELEASE CANDIDATE)\n"
        "DATE: NOVEMBER 2026\n"
        "JURISDICTION: EUROPEAN UNION / FRANCE (RGPD COMPLIANT)"
    )
    r_meta.font.name = "Consolas"
    r_meta.font.size = Pt(9)
    r_meta.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # ─── TABLE OF CONTENTS SUMMARY ──────────────────────────────────────────────
    h_toc = doc.add_paragraph()
    r_htoc = h_toc.add_run("Table of Operational Modules")
    r_htoc.font.name = "Georgia"
    r_htoc.font.size = Pt(20)
    r_htoc.font.bold = True
    r_htoc.font.color.rgb = COLOR_PRIMARY
    h_toc.paragraph_format.space_after = Pt(12)

    modules_en = [
        ("1. Security Architecture & Single-Admin Governance", "Master authentication, IP rate limiting, anti-replay TOTP MFA, and session controls."),
        ("2. Master Account Security & Recovery Operations", "Password changes, emergency recovery codes, TOTP reconfiguration, and active session revocation."),
        ("3. Animals & Live Inventory Management", "Creation, veterinary biometrics, pedigree documents, pricing in integer cents, and publication toggling."),
        ("4. Breeds Registry & FCI Standards", "Official breed registry, canine and feline species classifications, and bilingual breed profiles."),
        ("5. Partner Breeding Estates & Accreditation", "Accredited breeding facilities directory, kennel verification, and incoming partner application review."),
        ("6. Temporary Holds & Cart Reservation Concurrency", "15-minute checkout reservation locks, database uniqueness guarantees, and manual force-release procedure."),
        ("7. Adoption Orders & Commercial Lifecycle", "Order state transitions, terms acceptance tracking, fulfillment progression, and item validation."),
        ("8. Payment Orchestration & Card Routing", "GeniusPay card-only engine, Stripe primary processing, Paystack/PaiementPro/CinetPay fallbacks, circuit breakers."),
        ("9. Dispute Resolution & Manual Refunds", "Customer refund clearance, payment exception handling, and cancellation workflows."),
        ("10. VIP Pet Deliveries & Chaperone Logistics", "Doorstep pet transport scheduling, veterinary handover documentation, and carrier dispatch."),
        ("11. Adopter Client Directory & GDPR Erasure", "Customer profiles, purchase histories, and irreversible GDPR Right-to-Erasure compliance protocol."),
        ("12. Review Moderation & Testimonial Curation", "Adopter testimonials queue, 5-star ratings, verified purchase badges, and storefront publication."),
        ("13. Concierge Support Tickets & Client Messaging", "Omnichannel inquiry resolution, customer response dispatch, and internal confidential staff notes."),
        ("14. Content Blocks & Editorial CMS", "Dynamic homepage copy, legal notice revisions, announcement banners, and FAQ editing."),
        ("15. Translations Parity & Runtime Overrides", "Modular EN/FR translation catalogs, zero-bloat client delivery, and hotfix translation overrides."),
        ("16. SEO & OpenGraph Social Metadata", "Search engine title templates, bilingual meta descriptions, and social graph preview cards."),
        ("17. Newsletter Subscriber Management", "Double-opt-in newsletter database and CSV marketing dispatch export."),
        ("18. Business Analytics & Financial KPIs", "Gross transaction volumes, conversion ratios, and per-gateway payment attempt reliability metrics."),
        ("19. Immutable Security Audit Ledger", "Comprehensive actor tracking, IP forensics, before/after state diffs, and compliance auditing."),
        ("20. System Settings & Gateway Health Diagnostics", "Environment secret presence checks, database provider status, and operational rules parameters.")
    ]

    for title, desc in modules_en:
        p_m = doc.add_paragraph()
        p_m.paragraph_format.space_before = Pt(4)
        p_m.paragraph_format.space_after = Pt(2)
        r_t = p_m.add_run(title + "\n")
        r_t.font.name = "Calibri"
        r_t.font.size = Pt(10.5)
        r_t.font.bold = True
        r_t.font.color.rgb = COLOR_PRIMARY
        r_d = p_m.add_run("   " + desc)
        r_d.font.name = "Calibri"
        r_d.font.size = Pt(9.5)
        r_d.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # ─── MODULE DETAILS ─────────────────────────────────────────────────────────

    def add_module_section(mod_num, title, purpose, procedure_steps, security_note, screenshot_key, screenshot_cap):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
        r = h.add_run(f"Module {mod_num}: {title}")
        r.font.name = "Georgia"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY

        p_purp = doc.add_paragraph()
        p_purp.paragraph_format.space_after = Pt(8)
        r_p_lbl = p_purp.add_run("Purpose & Scope: ")
        r_p_lbl.font.bold = True
        r_p_lbl.font.color.rgb = COLOR_GOLD
        r_p_txt = p_purp.add_run(purpose)
        r_p_txt.font.color.rgb = COLOR_DARK

        p_proc = doc.add_paragraph()
        p_proc.paragraph_format.space_after = Pt(4)
        r_proc = p_proc.add_run("Standard Operating Procedure:")
        r_proc.font.bold = True
        r_proc.font.color.rgb = COLOR_PRIMARY

        for idx, step in enumerate(procedure_steps, start=1):
            p_step = doc.add_paragraph()
            p_step.paragraph_format.left_indent = Inches(0.25)
            p_step.paragraph_format.space_before = Pt(1)
            p_step.paragraph_format.space_after = Pt(2)
            r_num = p_step.add_run(f"{idx}. ")
            r_num.font.bold = True
            r_num.font.color.rgb = COLOR_PRIMARY
            r_st = p_step.add_run(step)
            r_st.font.color.rgb = COLOR_DARK

        add_callout(doc, security_note, title="SECURITY & COMPLIANCE MANDATE")
        embed_screenshot(doc, screenshot_key, "en", screenshot_cap)
        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 1. Login & Auth
    add_module_section(
        1, "Security Architecture & Master Authentication",
        "Provides single-admin authentication for Pawelium 2.0. Protects console access via sliding HMAC sessions, IP sliding-window rate limiting, and RFC 6238 TOTP two-factor authentication.",
        [
            "Navigate to /admin/login directly. Public storefront pages carry no links to this administrative portal.",
            "Enter master email (admin@pawelium.fyi) and 14+ character master password.",
            "If TOTP MFA is configured, input the 6-digit dynamic code from Google Authenticator or 1Password.",
            "Upon 5 failed login attempts from a given IP address, an automated 15-minute security lockout engages without revealing account existence.",
            "Sessions automatically slide on active usage; inactivity beyond 8 hours revokes authorization."
        ],
        "Zero links to /admin/login exist in customer storefront headers, footers, or client bundles. Any attempt to access protected endpoints without an authenticated __Host-pw_admin cookie redirects to login.",
        "01_login", "Super Administrator Authentication Screen with editorial split layout and password visibility controls."
    )

    # 2. Account & MFA
    add_module_section(
        2, "Master Account Security & Recovery Credentials",
        "Enables cryptographic password updates, emergency recovery codes generation, TOTP enrolment via server-rendered SVG QR codes, and active session termination.",
        [
            "Access /admin/account to inspect active session statistics and current security status.",
            "To rotate master password, provide the existing password followed by the new 12+ character credential.",
            "To enrol or reset TOTP MFA, scan the rendered SVG QR code in your authenticator app and enter the verification code.",
            "Record the 8 generated emergency single-use recovery codes in a secure offline vault.",
            "Inspect the active sessions table; click 'Revoke Session' on any unrecognised IP to instantly invalidate its session token."
        ],
        "TOTP verification strictly enforces anti-replay protection: a code step cannot be used twice within the current or past 30-second time windows. Comparisons use crypto.timingSafeEqual to prevent side-channel timing attacks.",
        "22_account", "Account Security Console displaying password change, TOTP MFA configuration, and active session audit table."
    )

    # 3. Animals & Live Inventory
    add_module_section(
        3, "Animals & Catalogue Inventory Control",
        "Provides end-to-end listing lifecycle control: companion profiles, pedigree parameters, biometric records, microchip IDs, and real-time storefront publication status.",
        [
            "Navigate to /admin/animals to view the full inventory table with photos, species, pricing, and availability badges.",
            "Click '+ Add Animal' to launch the profile creation form (/admin/animals/new).",
            "Fill in mandatory parameters: companion name, breed selection, species (Canine/Feline), gender, price in integer cents (e.g. 150000 = 1,500.00 €), and bilingual description.",
            "Upload or assign high-resolution photography. The first uploaded media automatically assigns as primary (sortOrder: 0).",
            "Toggle 'Published' to immediately expose or hide the listing from the public marketplace without modifying inventory availability status."
        ],
        "All prices in database and API operations are strictly stored as integer cents to avoid floating-point inaccuracies. Price comparisons and display formatting utilize deterministic locale-aware rules.",
        "03_animals", "Animals & Inventory Registry displaying companion thumbnails, FCI breed classification, and availability state toggles."
    )

    # 4. Breeds Registry
    add_module_section(
        4, "Breeds Registry & FCI Standards",
        "Maintains the centralized canine and feline breed database, official FCI classifications, and bilingual profile content for breed-specific discovery pages.",
        [
            "Navigate to /admin/breeds to review all registered breeds and live listing counts.",
            "Click 'Add Breed' to open the modal registration drawer.",
            "Input English name, French name, URL slug, and species categorization (DOG or CAT).",
            "Provide detailed bilingual descriptions detailing temperament, breed history, and care recommendations.",
            "Click 'Save Breed' to commit changes across all public search filters and breed showcases."
        ],
        "Public storefront filters dynamically query prisma.breed. Deleting a breed with active animals is blocked by database foreign key constraints to prevent orphaned listings.",
        "05_breeds", "Breeds Registry Console showing registered canine and feline breeds with bilingual naming and listing tallies."
    )

    # 5. Partner Breeding Estates
    add_module_section(
        5, "Certified European Breeders & Partner Accreditation",
        "Governs partner breeding estates across France and Europe. Evaluates veterinary accreditation, legal kennel registrations, and incoming partner applications.",
        [
            "Navigate to /admin/breeders to inspect verified partner facilities and incoming accreditation applications.",
            "Click 'Add Breeder' to register an accredited partner with contact info, municipality, country, and estate bio.",
            "Under 'Incoming Partner Applications', review pending submissions from European breeders seeking platform partnership.",
            "Examine applicant experience years, website URLs, and facility locations before approving or rejecting applications."
        ],
        "All verified breeding partners undergo strict veterinary and ethical audits prior to receiving the platform VERIFIED accreditation badge.",
        "06_breeders", "Breeders Console showing certified partner estates alongside incoming applicant review queue."
    )

    # 6. Holds & Concurrency Controls
    add_module_section(
        6, "Temporary Holds & Concurrency Lock Controls",
        "Protects single-companion marketplace integrity by enforcing strict atomic 15-minute checkout holds. Prevents double-booking through unique database constraints.",
        [
            "Navigate to /admin/reservations to inspect all active, converted, and released temporary holds.",
            "Active holds feature an orange badge and real-time expiration countdown.",
            "If an adopter abandons checkout or requests hold cancellation, click 'Release Hold' to force immediate de-escalation.",
            "The associated animal status instantly reverts from HELD to AVAILABLE, allowing other buyers to initiate checkout."
        ],
        "A database-level unique constraint on activeAnimalId ensures that exactly ONE active hold can exist per companion across concurrent requests. Automated expiration cron jobs clean expired holds with an authoritative payment provider status check.",
        "07_reservations", "Temporary Holds Console tracking customer checkout carts, expiration timers, and manual release actions."
    )

    # 7. Adoption Orders
    add_module_section(
        7, "Adoption Orders & Commercial Lifecycle",
        "Oversees the full adoption lifecycle: checkout placement, payment verification, legal terms acceptance records, and fulfillment status state transitions.",
        [
            "Navigate to /admin/orders to inspect all placed adoption orders sorted chronologically.",
            "Review customer contact details, companion reference, total amount paid, and terms acceptance timestamp.",
            "Click 'Actions' on an order row to advance its operational status: PENDING_PAYMENT → PAID → PREPARING → IN_TRANSIT → DELIVERED.",
            "For offline concierge wire settlements, use 'Record Manual Payment' to update status while validating that the companion is not already sold."
        ],
        "Every order status transition is immutably recorded in the OrderStatusHistory table with timestamp and previous status for full forensic traceability.",
        "08_orders", "Adoption Orders Console displaying order references, customer details, financial totals, and lifecycle progression."
    )

    # 8. Payment Orchestration & Card Routing
    add_module_section(
        8, "Card Payment Orchestration & Webhooks",
        "Controls the card-only payment layer orchestrated through GeniusPay. Routes transactions to verified card processors (Stripe first, with automated Paystack/PaiementPro/CinetPay fallbacks) while strictly excluding Mobile Money.",
        [
            "Navigate to /admin/payments to review payment transactions, provider references, and incoming webhook logs.",
            "Inspect payment attempt records to verify which card gateway processed the customer checkout.",
            "Check circuit breaker states: if a gateway encounters 3 consecutive failures, it opens for 15 minutes and traffic transparently diverts to the next fallback card gateway.",
            "Inspect raw webhook logs to confirm valid HMAC-SHA256 signatures, timestamps within 300 seconds, and idempotent settlement execution."
        ],
        "CUSTOMER BRAND GUARD: Customers never see provider names (GeniusPay, Stripe, Paystack). The customer UI strictly displays 'Credit / Debit Card'. Webhooks returning HTTP 500 trigger automated provider retries without duplicate transaction loss.",
        "09_payments", "Payments & Webhooks Audit Console displaying card transactions, settlement state, and raw payload audit records."
    )

    # 9. Dispute Resolution & Manual Refunds
    add_module_section(
        9, "Dispute Resolution & Manual Refunds",
        "Handles adoption cancellations, reconciliation exceptions, and manual refund execution with full audit tracking.",
        [
            "Navigate to /admin/refunds to inspect requested customer refunds.",
            "Review associated order reference, customer email, original payment provider reference, and refund justification.",
            "To disburse funds and close a ticket, execute the manual bank or card refund and click 'Mark Processed'.",
            "The system records the performing Super Admin's ID and timestamp, updating refund status to COMPLETED."
        ],
        "GeniusPay does not provide a direct automated refund disbursement API for card checkouts; all platform refunds are processed through accredited banking channels and authoritatively logged here.",
        "10_refunds", "Refunds & Dispute Resolution Console tracking refund requests, disbursement amounts, and resolution status."
    )

    # 10. VIP Pet Deliveries
    add_module_section(
        10, "VIP Pet Transport & Chaperoned Deliveries",
        "Coordinates white-glove European pet transport manifests, specialized climate-controlled transport vehicles, and veterinary handover protocols.",
        [
            "Navigate to /admin/deliveries to inspect all scheduled and completed companion deliveries.",
            "Review recipient addresses, companion name, scheduled delivery dates, and assigned transport carrier.",
            "Verify that veterinary dossiers (ICAD transfer, EU Pet Passport, rabies vaccination certificates) are physically affixed to transport crates.",
            "Mark deliveries as DELIVERED upon signed client handover receipt."
        ],
        "Animal welfare regulations (Regulation EC 1/2005) mandate maximum transit intervals and veterinary inspection stops for all cross-border companion transport manifests.",
        "11_deliveries", "VIP Deliveries Console detailing customer destination addresses, carriers, and scheduled handover dates."
    )

    # 11. Customer Directory & GDPR
    add_module_section(
        11, "Customer Directory & GDPR Privacy Compliance",
        "Maintains verified adopter profiles while providing one-click irreversible GDPR Right-to-Erasure compliance tooling.",
        [
            "Navigate to /admin/customers to browse verified adopters, order counts, and registration dates.",
            "Click 'Export Adopters' to download an authorized GDPR-compliant data export.",
            "When a customer formally exercises their GDPR Article 17 Right to Erasure, locate their profile and trigger 'Anonymize & Erase'.",
            "The system irreversibly replaces PII (name, email, phone, street address) with cryptographic hash placeholders while preserving anonymous accounting totals."
        ],
        "GDPR erasure is permanent and non-reversible. Financial records (invoices, transaction amounts) are legally retained in anonymized format under French commercial code requirements.",
        "12_customers", "Customer Directory Console displaying adopter records, purchase history, and GDPR erasure controls."
    )

    # 12. Review Moderation
    add_module_section(
        12, "Reviews Moderation & Testimonial Curation",
        "Curates authentic adopter feedback, verifies purchase authenticity against order records, and publishes approved reviews to the public storefront.",
        [
            "Navigate to /admin/reviews to inspect incoming adopter reviews.",
            "Inspect author name, star rating (1–5), review text, and 'Verified Adopter' badge validity.",
            "Click the green checkmark to approve and publish the review to the homepage and animal profile carousels.",
            "Click the red cross to reject fraudulent, abusive, or irrelevant submissions."
        ],
        "Only reviews in status APPROVED are ever served to public client requests. All unmoderated submissions remain invisible to customers.",
        "13_reviews", "Review Moderation Queue showing submitted testimonials, star ratings, and moderation action triggers."
    )

    # 13. Concierge Support Tickets
    add_module_section(
        13, "Concierge Support & Omnichannel Ticketing",
        "Manages pre-adoption inquiries, transport updates, and post-placement customer assistance with threaded email replies and private staff notes.",
        [
            "Navigate to /admin/support to view tickets categorized by General, Order, or Transport.",
            "Click a ticket to view the full message thread and linked customer order.",
            "To send an official reply to the customer's email, input text in 'Reply to Customer' and submit.",
            "To record confidential internal notes invisible to the customer, toggle 'Internal Confidential Note' before posting.",
            "Update ticket status to IN_PROGRESS or RESOLVED as milestones are achieved."
        ],
        "Customer email replies dispatch asynchronously via Resend. Internal notes are permanently stored with an internal flag and never leak into outgoing customer emails.",
        "14_support", "Support Ticket Desk showing active conversation threads, order context, and internal staff reply composer."
    )

    # 14. Content Blocks CMS
    add_module_section(
        14, "Content Blocks CMS & Editorial Management",
        "Allows immediate updates to marketing headlines, promotional banners, legal policies, and concierge FAQs without triggering code deployments.",
        [
            "Navigate to /admin/content to inspect all dynamic content blocks by key and locale.",
            "Click 'Add Content Block' or the edit icon on an existing block.",
            "Specify the content key (e.g. 'home.hero.announcement'), target locale ('en' or 'fr'), and Markdown content body.",
            "Save the block; Next.js cache revalidation immediately updates the storefront."
        ],
        "Content blocks override static dictionary fallbacks dynamically. If a key is absent in the database, the application gracefully renders its default compiled dictionary string.",
        "15_content", "Content Blocks CMS displaying dynamic editorial keys, locale targets, and content body previews."
    )

    # 15. Translations Parity
    add_module_section(
        15, "Translations Parity Health & Runtime Overrides",
        "Audits bilingual alignment between English (en) and French (fr) modular namespaces. Provides zero-downtime translation override capabilities.",
        [
            "Navigate to /admin/translations to review modular namespace parity metrics and active database overrides.",
            "Verify that both EN and FR dictionaries report 100% key and ICU branch parity.",
            "To patch a spelling mistake or phrasing in production without redeploying, click 'Add Override'.",
            "Select target locale, namespace (e.g. 'Catalogue', 'Checkout'), key path, and new string value.",
            "Click 'Save Override' to immediately serve the corrected text to storefront visitors."
        ],
        "The automated Brand Guard verifies that customer dictionaries contain zero references to payment gateway brands. Translations strictly follow the always-prefixed locale URL routing structure (/en and /fr).",
        "16_translations", "Translations Parity Console displaying bilingual health metrics, brand leakage status, and active overrides."
    )

    # 16. SEO & OpenGraph Configuration
    add_module_section(
        16, "Global SEO & Social Graph Configuration",
        "Configures search engine crawler directives, dynamic title templates, bilingual meta descriptions, and OpenGraph social card previews.",
        [
            "Navigate to /admin/seo to access the global search optimization form.",
            "Edit the page title templates for English and French (e.g. 'Pawelium | European Concierge Animal Adoption').",
            "Review and tune meta descriptions to ensure optimal click-through rates on Google search results.",
            "Configure the OpenGraph image URL used when marketplace listings are shared on WhatsApp, Facebook, or LinkedIn.",
            "Click 'Save SEO Settings' to persist parameters to database site settings."
        ],
        "The application generates dynamic XML sitemaps (/sitemap.xml) and robots directives (/robots.txt) reflecting current animal catalogue availability.",
        "17_seo", "SEO Configuration Console with bilingual title template inputs, meta descriptions, and preview image settings."
    )

    # 17. Newsletter Subscribers
    add_module_section(
        17, "Newsletter Subscribers & Marketing Exports",
        "Maintains the double-opt-in marketing subscriber database, tracks language preferences, and generates CSV exports for email campaigns.",
        [
            "Navigate to /admin/newsletter to inspect registered subscriber emails.",
            "Review confirmed vs pending subscription ratios and user locale preferences.",
            "Click 'Export CSV' to download a timestamped file of confirmed subscribers for importation into marketing platforms."
        ],
        "Subscribers register via double-opt-in confirmation links. The database stores hashed confirmation tokens to safeguard against unauthorized subscription hijacking.",
        "18_newsletter", "Newsletter Subscriber Console displaying subscriber emails, language flags, and CSV export action."
    )

    # 18. Analytics & Financial KPIs
    add_module_section(
        18, "Business Analytics & Financial KPIs",
        "Provides executive visibility into gross transaction revenue, adoption conversion rates, customer acquisition velocity, and card gateway routing health.",
        [
            "Navigate to /admin/analytics to examine platform KPIs across all historical adoption transactions.",
            "Inspect Gross Transaction Volume in EUR calculated authoritatively from paid and delivered orders.",
            "Review the Payment Success Rate percentage and total completed transactions tally.",
            "Under 'Card Gateway Performance & Route Distribution', examine attempt counts and conversion ratios across each candidate card processor (Stripe, Paystack, PaiementPro, CinetPay)."
        ],
        "All revenue metrics are calculated strictly from database-persisted Order and Payment rows; no client-side estimations are used.",
        "19_analytics", "Analytics Console featuring revenue cards, payment conversion rate, and per-gateway attempt distribution table."
    )

    # 19. Audit Ledger & Compliance Forensics
    add_module_section(
        19, "Immutable Audit Ledger & Compliance Forensics",
        "Records every administrative modification with cryptographic actor references, client IP addresses, before/after JSON diffs, and timestamp forensics.",
        [
            "Navigate to /admin/audit to inspect the security log.",
            "Every action (animal creation, status toggles, password updates, MFA changes, refund clearances) produces an append-only audit row.",
            "Filter audit records by actor, target entity, action category, or date range.",
            "Inspect the client IP and User-Agent metadata to verify the authorized origin of sensitive commands."
        ],
        "The AuditLog model has no update or delete mutations exposed in Server Actions or admin UI. It functions as an immutable compliance journal for SOC 2 and GDPR audits.",
        "20_audit", "Security Audit Ledger displaying chronological administrative events, actor IDs, IPs, and action payloads."
    )

    # 20. System Settings & Diagnostics
    add_module_section(
        20, "System Settings & Infrastructure Diagnostics",
        "Inspects runtime environment variables, database provider health, email service configuration, and active card routing priority rules.",
        [
            "Navigate to /admin/settings to view the system diagnostic health board.",
            "Verify that Database Provider reports SQLITE (staging/local) or POSTGRESQL (production Neon Serverless).",
            "Verify that GeniusPay Orchestration reports LIVE or SANDBOX with card-only mode verified.",
            "Review the Card Payment Priority chain (#1 Stripe, #2 Paystack, #3 PaiementPro, #4 CinetPay) and confirm that all circuit breakers report 'CIRCUIT CLOSED (HEALTHY)'.",
            "Inspect operational business rules including the 15-minute hold timer, transport tariffs, and concierge dossier fees."
        ],
        "NEVER PRINT SECRETS: The settings diagnostic console displays only presence flags (e.g. 'CONFIGURED', 'SECURE'). Raw API keys, database connection strings, and webhook signing secrets are strictly redacted from rendering.",
        "21_settings", "System Settings Console displaying service health diagnostics, card routing chain, and operational tariffs."
    )

    doc.save(out_path)
    print(f"✅ Generated English User Guide: {out_path}")

def build_guide_fr(out_path):
    doc = Document()
    
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # ─── PAGE DE GARDE ──────────────────────────────────────────────────────────
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(72)
    title_p.paragraph_format.space_after = Pt(6)
    r_brand = title_p.add_run("PAWELIUM 2.0")
    r_brand.font.name = "Georgia"
    r_brand.font.size = Pt(36)
    r_brand.font.bold = True
    r_brand.font.color.rgb = COLOR_PRIMARY
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(24)
    r_sub = sub_p.add_run("MANUEL D'ADMINISTRATION & GUIDE OPÉRATIONNEL SUPER_ADMIN")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(14)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_GOLD

    desc_p = doc.add_paragraph()
    desc_p.paragraph_format.space_after = Pt(140)
    r_desc = desc_p.add_run(
        "Documentation confidentielle et guide de procédures opérationnelles pour la conciergerie animale d'exception Pawelium.\n"
        "Couvre l'intégralité des modules de gestion, la gouvernance de sécurité à administrateur unique, "
        "l'orchestration des paiements par carte bancaire stricte et la gestion bilingue du contenu."
    )
    r_desc.font.name = "Calibri"
    r_desc.font.size = Pt(11)
    r_desc.font.color.rgb = COLOR_DARK

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_after = Pt(12)
    r_meta = meta_p.add_run(
        "CLASSIFICATION : RESTREINT — ACCÈS SUPER_ADMIN EXCLUSIF\n"
        "VERSION : 2.0.4 (RELEASE CANDIDATE)\n"
        "DATE : NOVEMBRE 2026\n"
        "CONFORMITÉ : UNION EUROPÉENNE / FRANCE (CONFORME RGPD)"
    )
    r_meta.font.name = "Consolas"
    r_meta.font.size = Pt(9)
    r_meta.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # ─── SOMMAIRE ───────────────────────────────────────────────────────────────
    h_toc = doc.add_paragraph()
    r_htoc = h_toc.add_run("Sommaire des Modules Opérationnels")
    r_htoc.font.name = "Georgia"
    r_htoc.font.size = Pt(20)
    r_htoc.font.bold = True
    r_htoc.font.color.rgb = COLOR_PRIMARY
    h_toc.paragraph_format.space_after = Pt(12)

    modules_fr = [
        ("1. Architecture de Sécurité & Gouvernance Administrateur", "Authentification unique, limitation de débit par IP, double facteur TOTP anti-rejeu et sessions glissantes."),
        ("2. Sécurité du Compte Maître & Codes de Secours", "Modification du mot de passe, codes de secours d'urgence, configuration TOTP et révocation des sessions."),
        ("3. Gestion des Animaux & Inventaire en Direct", "Création de fiches, biométrie vétérinaire, gestion documentaire, tarification en centimes entiers et publication."),
        ("4. Registre des Races & Standards FCI", "Registre officiel des races canines et félines, classifications FCI et descriptions bilingues."),
        ("5. Élevages Partenaires & Accréditation Européenne", "Annuaire des domaines certifiés, vérification d'affixe et traitement des candidatures partenaires."),
        ("6. Réservations Temporaires & Contrôles de Concurrence", "Verrous de panier de 15 minutes, garantie d'unicité en base de données et libération manuelle."),
        ("7. Commandes d'Adoption & Cycle Commercial", "Transitions d'états de commande, acceptation des CGV, préparation et validation des pièces."),
        ("8. Orchestration des Paiements par Carte Bancaire", "Moteur GeniusPay carte stricte, Stripe prioritaire, replis automatisés (Paystack/PaiementPro/CinetPay) et disjoncteurs."),
        ("9. Résolution des Litiges & Remboursements Manuels", "Traitement des annulations, conciliation des paiements et régularisation des remboursements."),
        ("10. Livraisons VIP & Transport Chaperonné", "Planification logistique, transport climatisé agréé, documents sanitaires et bordereaux de remise."),
        ("11. Répertoire des Adoptants & Conformité RGPD", "Profils clients, historiques d'adoption et protocole d'effacement irréversible RGPD (Droit à l'oubli)."),
        ("12. Modération des Avis & Témoignages Clients", "File de validation des avis, notation 5 étoiles, badge adoptant vérifié et publication sur la boutique."),
        ("13. Support Conciergerie & Gestion des Tickets", "Traitement multicanal des demandes, réponses par e-mail et notes internes confidentielles."),
        ("14. Gestion de Contenu CMS (Content Blocks)", "Édition des accroches, bannières d'annonces, révision des politiques légales et FAQ sans déploiement."),
        ("15. Santé des Traductions & Remplacements à Chaud", "Catalogues bilingues modulaires EN/FR, zéro surcharge client et surcharges de traduction en base."),
        ("16. Configuration SEO & Métadonnées OpenGraph", "Modèles de balises titres, méta-descriptions bilingues et visuels pour réseaux sociaux."),
        ("17. Abonnés Newsletter & Exports Marketing", "Base d'abonnés en double opt-in, préférences linguistiques et export CSV pour campagnes."),
        ("18. Analytique Commerciale & Indicateurs Clés (KPIs)", "Volume brut de transaction, ratios de conversion et fiabilité par passerelle de carte bancaire."),
        ("19. Journal d'Audit Immuable & Forensique de Sécurité", "Traçabilité intégrale des actions d'administration, adresses IP, deltas avant/après et conformité."),
        ("20. Paramètres Système & Santé des Passerelles", "Vérification des secrets d'environnement, état de la base de données et barèmes opérationnels.")
    ]

    for title, desc in modules_fr:
        p_m = doc.add_paragraph()
        p_m.paragraph_format.space_before = Pt(4)
        p_m.paragraph_format.space_after = Pt(2)
        r_t = p_m.add_run(title + "\n")
        r_t.font.name = "Calibri"
        r_t.font.size = Pt(10.5)
        r_t.font.bold = True
        r_t.font.color.rgb = COLOR_PRIMARY
        r_d = p_m.add_run("   " + desc)
        r_d.font.name = "Calibri"
        r_d.font.size = Pt(9.5)
        r_d.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # ─── MODULES DÉTAILLÉS ──────────────────────────────────────────────────────

    def add_module_section_fr(mod_num, title, purpose, procedure_steps, security_note, screenshot_key, screenshot_cap):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
        r = h.add_run(f"Module {mod_num} : {title}")
        r.font.name = "Georgia"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY

        p_purp = doc.add_paragraph()
        p_purp.paragraph_format.space_after = Pt(8)
        r_p_lbl = p_purp.add_run("Objectif & Périmètre : ")
        r_p_lbl.font.bold = True
        r_p_lbl.font.color.rgb = COLOR_GOLD
        r_p_txt = p_purp.add_run(purpose)
        r_p_txt.font.color.rgb = COLOR_DARK

        p_proc = doc.add_paragraph()
        p_proc.paragraph_format.space_after = Pt(4)
        r_proc = p_proc.add_run("Procédure Opérationnelle Standard :")
        r_proc.font.bold = True
        r_proc.font.color.rgb = COLOR_PRIMARY

        for idx, step in enumerate(procedure_steps, start=1):
            p_step = doc.add_paragraph()
            p_step.paragraph_format.left_indent = Inches(0.25)
            p_step.paragraph_format.space_before = Pt(1)
            p_step.paragraph_format.space_after = Pt(2)
            r_num = p_step.add_run(f"{idx}. ")
            r_num.font.bold = True
            r_num.font.color.rgb = COLOR_PRIMARY
            r_st = p_step.add_run(step)
            r_st.font.color.rgb = COLOR_DARK

        add_callout(doc, security_note, title="EXIGENCE DE SÉCURITÉ & CONFORMITÉ")
        embed_screenshot(doc, screenshot_key, "fr", screenshot_cap)
        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 1. Login
    add_module_section_fr(
        1, "Architecture de Sécurité & Authentification Maître",
        "Assure l'accès unique et sécurisé à la console Pawelium 2.0. Protège les points de terminaison par sessions HMAC glissantes, limitation de débit par IP et double facteur TOTP (RFC 6238).",
        [
            "Accédez directement à l'URL /admin/login. L'interface publique ne comporte aucun lien vers cette console.",
            "Renseignez l'adresse e-mail maître (admin@pawelium.fyi) et le mot de passe complexe de 14 caractères minimum.",
            "Si le double facteur est activé, saisissez le code dynamique à 6 chiffres depuis votre application d'authentification.",
            "Après 5 tentatives infructueuses depuis une même adresse IP, un verrouillage automatique de 15 minutes s'enclenche sans divulguer l'existence du compte.",
            "Les sessions se renouvellent automatiquement lors de l'activité ; une inactivité supérieure à 8 heures révoque l'accès."
        ],
        "Aucun lien vers /admin/login n'est présent dans le code public, les en-têtes ou les pieds de page. Toute tentative d'accès non autorisé à une route /admin redirige immédiatement vers la page de connexion.",
        "01_login", "Écran de Connexion Super Administrateur avec disposition éditoriale et masquage sécurisé du mot de passe."
    )

    # 2. Account
    add_module_section_fr(
        2, "Sécurité du Compte Maître & Codes de Secours",
        "Permet la rotation cryptographique du mot de passe, l'émission des codes de secours d'urgence, l'enrôlement TOTP par QR code vectoriel SVG et la résiliation des sessions actives.",
        [
            "Rendez-vous sur /admin/account pour inspecter l'état de sécurité du compte maître et les sessions en cours.",
            "Pour modifier le mot de passe, fournissez le mot de passe actuel puis le nouveau mot de passe fort (12+ caractères).",
            "Pour activer ou réinitialiser le double facteur TOTP, scannez le QR code SVG affiché et confirmez avec un code dynamique.",
            "Conservez les 8 codes de secours d'urgence à usage unique dans un coffre-fort hors ligne sécurisé.",
            "Consultez le tableau des sessions actives ; cliquez sur 'Révoquer la session' pour déconnecter immédiatement toute IP suspecte."
        ],
        "La validation TOTP intègre une protection stricte contre le rejeu : un même code ne peut être réutilisé sur le palier temporel de 30 secondes en cours. Les vérifications emploient crypto.timingSafeEqual contre les attaques par canal auxiliaire.",
        "22_account", "Console de Sécurité du Compte Maître avec rotation du mot de passe, QR code TOTP et tableau des sessions."
    )

    # 3. Animals
    add_module_section_fr(
        3, "Gestion des Animaux & Inventaire en Direct",
        "Supervise le cycle de vie complet des fiches d'animaux : caractéristiques biométriques, documentation sanitaire, généalogie, tarification et statut de visibilité sur la boutique.",
        [
            "Accédez à /admin/animals pour consulter le registre d'inventaire avec visuels, races, prix et statuts de disponibilité.",
            "Cliquez sur '+ Ajouter un Animal' pour ouvrir le formulaire de saisie (/admin/animals/new).",
            "Renseignez les données obligatoires : nom, race associée, espèce (Canin/Félin), sexe, prix en centimes entiers (ex. 150000 pour 1 500,00 €) et descriptif bilingue.",
            "Associez des photographies haute définition ; la première image importée devient automatiquement l'image principale (sortOrder: 0).",
            "Basculez le bouton 'Publié' pour afficher ou masquer instantanément la fiche sur la vitrine publique sans modifier sa disponibilité commerciale."
        ],
        "Tous les prix en base de données et dans les API sont strictement stockés en centimes d'euros pour éliminer tout risque d'erreur d'arrondi à virgule flottante.",
        "03_animals", "Registre des Animaux affichant les fiches, les classifications de race et les commutateurs de statut."
    )

    # 4. Breeds
    add_module_section_fr(
        4, "Registre des Races & Standards FCI",
        "Gère la nomenclature officielle des races canines et félines, les classifications FCI et les fiches descriptives bilingues destinées aux pages de découverte.",
        [
            "Accédez à /admin/breeds pour consulter la liste des races homologuées et le nombre d'animaux actifs.",
            "Cliquez sur 'Ajouter une Race' pour ouvrir le tiroir modal d'enregistrement.",
            "Saisissez le nom en anglais, le nom en français, l'identifiant slug et l'espèce (Chien ou Chat).",
            "Rédigez les descriptions bilingues détaillant le tempérament, les spécificités morphologiques et les besoins de la race.",
            "Enregistrez pour actualiser automatiquement l'ensemble des filtres de recherche sur la boutique."
        ],
        "Les filtres de la boutique interrogent dynamiquement prisma.breed. La suppression d'une race liée à des animaux existants est bloquée par contrainte d'intégrité relationnelle.",
        "05_breeds", "Registre des Races présentant les races canines et félines homologuées et les descriptifs bilingues."
    )

    # 5. Breeders
    add_module_section_fr(
        5, "Élevages Partenaires & Accréditation Européenne",
        "Supervise les domaines d'élevage partenaires en France et en Europe. Contrôle les accréditations vétérinaires, les affixes officiels et instruit les nouvelles candidatures.",
        [
            "Consultez /admin/breeders pour examiner les élevages accrédités et la file des candidatures en attente.",
            "Cliquez sur 'Ajouter un Éleveur' pour certifier un nouveau partenaire avec coordonnées, ville, pays et historique d'élevage.",
            "Dans la section 'Candidatures Partenaires Entrantes', examinez les dossiers soumis par des éleveurs européens.",
            "Vérifiez l'expérience, les liens vers les installations et la conformité légale avant d'accorder le statut vérifié."
        ],
        "Tout partenaire vérifié fait l'objet d'un audit documentaire vétérinaire strict avant l'octroi du badge de certification officiel Pawelium.",
        "06_breeders", "Console des Éleveurs répertoriant les domaines partenaires accrédités et la file d'examen des candidatures."
    )

    # 6. Holds
    add_module_section_fr(
        6, "Réservations Temporaires & Verrous de Concurrence",
        "Garantit l'intégrité de l'adoption en appliquant un verrou atomique de 15 minutes lors du passage en caisse. Empêche toute double réservation grâce à une contrainte d'unicité en base.",
        [
            "Accédez à /admin/reservations pour visualiser les réservations actives, converties ou expirées.",
            "Les verrous en cours affichent un badge orange avec décompte précis de l'expiration.",
            "Si un adoptant interrompt son achat ou signale une erreur, cliquez sur 'Libérer le Verrou'.",
            "Le statut de l'animal repasse immédiatement de 'HELD' (Réservé) à 'AVAILABLE' (Disponible) pour les autres visiteurs."
        ],
        "Une contrainte d'unicité sur la colonne activeAnimalId garantit qu'exactement UN SEUL verrou actif peut exister par compagnon. Le cron d'expiration vérifie l'état auprès du prestataire de paiement avant toute libération automatique.",
        "07_reservations", "Console des Réservations assurant le suivi des verrous de panier et la libération manuelle d'inventaire."
    )

    # 7. Orders
    add_module_section_fr(
        7, "Commandes d'Adoption & Cycle Commercial",
        "Gère le cycle de vie complet des dossiers d'adoption : validation du paiement, traçabilité de l'acceptation des CGV et franchissement des étapes de livraison.",
        [
            "Consultez /admin/orders pour visualiser les commandes d'adoption classées par date.",
            "Vérifiez les coordonnées du client, la référence du compagnon, le montant total perçu et l'horodatage de consentement aux CGV.",
            "Cliquez sur 'Actions' pour faire progresser le statut : EN_ATTENTE → PAYÉ → EN_PRÉPARATION → EN_LIVRAISON → LIVRÉ.",
            "Pour les règlements manuels en conciergerie (virement bancaire), utilisez 'Enregistrer un Règlement Manuel'."
        ],
        "Chaque changement d'état est consigné de façon immuable dans la table OrderStatusHistory avec horodatage et statut d'origine pour un audit infaillible.",
        "08_orders", "Console des Commandes affichant les références, coordonnées des adoptants et progression opérationnelle."
    )

    # 8. Payments
    add_module_section_fr(
        8, "Orchestration des Paiements par Carte Bancaire",
        "Pilote le moteur de paiement par carte bancaire orchestré via GeniusPay. Oriente les transactions vers les passerelles carte homologuées (Stripe en priorité, avec bascule vers Paystack/PaiementPro/CinetPay) en excluant rigoureusement le Mobile Money.",
        [
            "Consultez /admin/payments pour suivre les transactions financières et les réceptions de webhooks.",
            "Vérifiez l'historique des tentatives pour identifier la passerelle de carte ayant validé le règlement.",
            "Surveillez les disjoncteurs : après 3 échecs consécutifs, une passerelle est mise en pause pendant 15 minutes et le trafic bascule automatiquement sur la suivante.",
            "Contrôlez les journaux de webhooks pour attester de la validité de la signature HMAC-SHA256 et du traitement idempotent."
        ],
        "GARDE DE MARQUE CLIENT : Les clients ne voient jamais le nom des passerelles (GeniusPay, Stripe, Paystack). La vitrine affiche exclusivement 'Carte Bancaire / Crédit'. Les webhooks retournant une erreur HTTP 500 provoquent un réessai automatique sans perte de transaction.",
        "09_payments", "Console des Paiements & Webhooks retraçant les transactions carte, les états de règlement et les données brutes."
    )

    # 9. Refunds
    add_module_section_fr(
        9, "Résolution des Litiges & Remboursements Manuels",
        "Traite les demandes d'annulation d'adoption, les exceptions de rapprochement et l'enregistrement comptable des remboursements.",
        [
            "Accédez à /admin/refunds pour consulter les demandes de remboursement en attente.",
            "Examinez la commande liée, l'adresse e-mail de l'adoptant, la référence bancaire d'origine et le motif invoqué.",
            "Après exécution du virement de restitution bancaire, cliquez sur 'Marquer comme Traité'.",
            "Le système enregistre l'identifiant du Super Administrateur et horodate le dossier au statut COMPLETED."
        ],
        "GeniusPay ne proposant pas d'API de rétrocession automatique sur les cartes, les restitutions sont exécutées par virement bancaire sécurisé et consignées ici pour la comptabilité.",
        "10_refunds", "Console des Remboursements assurant le suivi des annulations, des montants restitués et de l'historique d'audit."
    )

    # 10. Deliveries
    add_module_section_fr(
        10, "Livraisons VIP & Transport Chaperonné",
        "Organise les feuilles de route du transport d'animaux en Europe : véhicules climatisés agréés, suivi vétérinaire et protocole de remise au domicile de l'adoptant.",
        [
            "Rendez-vous sur /admin/deliveries pour visualiser les missions de transport planifiées et achevées.",
            "Contrôlez l'adresse de destination, le nom de l'animal, la date de livraison prévue et le transporteur mandaté.",
            "Assurez-vous que le passeport européen, le certificat vétérinaire de bonne santé et la carte d'identification ICAD accompagnent le compagnon.",
            "Confirmez le statut 'LIVRÉ' dès signature du bordereau de remise par l'adoptant."
        ],
        "Le transport d'animaux vivants est soumis au règlement européen (CE) n° 1/2005 relatif à la protection des animaux en cours de transport.",
        "11_deliveries", "Console des Livraisons VIP détaillant les adresses de destination, les transporteurs et les dates de remise."
    )

    # 11. Customers
    add_module_section_fr(
        11, "Répertoire des Clients & Conformité RGPD",
        "Administre l'annuaire des adoptants vérifiés tout en offrant un outil en un clic d'anonymisation irréversible conforme au Droit à l'oubli (RGPD Art. 17).",
        [
            "Accédez à /admin/customers pour parcourir la liste des adoptants, leurs commandes et leurs dates d'inscription.",
            "Cliquez sur 'Exporter les Clients' pour générer un fichier de conformité réglementaire.",
            "En cas de demande formelle d'effacement de données, localisez le profil et cliquez sur 'Anonymiser & Supprimer'.",
            "Les données personnelles (nom, e-mail, téléphone, adresse) sont définitivement écrasées par des empreintes cryptographiques anonymes."
        ],
        "L'effacement RGPD est définitif et irréversible. Les montants des commandes sont légalement conservés sous forme anonyme conformément aux obligations comptables françaises.",
        "12_customers", "Répertoire des Clients présentant l'historique d'adoption et la commande d'anonymisation RGPD."
    )

    # 12. Reviews
    add_module_section_fr(
        12, "Modération des Avis & Valorisation des Témoignages",
        "Contrôle les retours d'expérience des adoptants, vérifie l'authenticité de l'achat et publie les témoignages approuvés sur la vitrine publique.",
        [
            "Accédez à /admin/reviews pour examiner les nouveaux avis soumis par les adoptants.",
            "Contrôlez le nom de l'auteur, la note attribuée (1 à 5 étoiles), le texte et la présence du badge 'Adoptant Vérifié'.",
            "Cliquez sur l'icône verte pour valider et publier immédiatement le commentaire sur la page d'accueil et les fiches.",
            "Cliquez sur l'icône rouge pour rejeter tout contenu inapproprié ou frauduleux."
        ],
        "Seuls les avis au statut APPROVED sont transmis aux visiteurs publics. Les avis non modérés restent strictement invisibles sur la vitrine.",
        "13_reviews", "File de Modération des Avis avec notation par étoiles, badge d'achat vérifié et commandes de publication."
    )

    # 13. Support
    add_module_section_fr(
        13, "Support Conciergerie & Gestion des Demandes",
        "Traite les demandes d'information avant adoption, le suivi logistique et l'assistance post-adoption avec réponses par e-mail et mémos internes protégés.",
        [
            "Consultez /admin/support pour filtrer les tickets par catégorie (Général, Commande, Transport).",
            "Cliquez sur un ticket pour examiner le fil d'échange complet et la commande associée.",
            "Pour expédier une réponse officielle par e-mail au client, rédigez dans 'Répondre au Client' puis validez.",
            "Pour inscrire une information interne confidentielle invisible pour le client, cochez 'Note Interne Confidentielle'.",
            "Basculez l'état du ticket vers 'EN COURS' ou 'RÉSOLU' une fois l'assistance finalisée."
        ],
        "Les réponses e-mail sont distribuées de façon asynchrone via Resend. Les notes internes ne sont jamais divulguées dans les messages adressés aux clients.",
        "14_support", "Bureau de Support Conciergerie présentant les fils de discussion, le contexte d'adoption et l'éditeur de réponse."
    )

    # 14. Content
    add_module_section_fr(
        14, "Gestion de Contenu CMS (Content Blocks)",
        "Permet de réviser les messages d'accueil, bannières d'annonces, clauses légales et foires aux questions sans redéployer le code applicatif.",
        [
            "Consultez /admin/content pour inspecter l'ensemble des blocs de contenu par clé et par langue.",
            "Cliquez sur 'Ajouter un Bloc' ou sur l'icône d'édition d'une entrée existante.",
            "Définissez la clé de ciblage (ex. 'home.hero.announcement'), la langue ('en' ou 'fr') et le corps au format Markdown.",
            "Enregistrez pour que la revalidation du cache Next.js mette à jour la vitrine immédiatement."
        ],
        "Les blocs CMS surchargent dynamiquement les dictionnaires de traduction statiques. En cas d'absence d'une clé en base, l'application rend sa valeur par défaut issue des fichiers JSON.",
        "15_content", "Gestionnaire de Contenu CMS présentant les clés éditoriales, les cibles linguistiques et les aperçus de texte."
    )

    # 15. Translations
    add_module_section_fr(
        15, "Santé des Traductions & Surcharges en Ligne",
        "Vérifie la parité rigoureuse entre les catalogues modulaires français (fr) et anglais (en). Permet de corriger des tournures de phrases en temps réel.",
        [
            "Consultez /admin/translations pour évaluer la parité des espaces de noms modulaires et les surcharges enregistrées.",
            "Constatez que les dictionnaires EN et FR atteignent 100% de concordance structurelle.",
            "Pour corriger une coquille ou adapter une expression en production sans redéploiement, cliquez sur 'Ajouter une Surcharge'.",
            "Sélectionnez la langue, l'espace de noms (ex. 'Catalogue', 'Checkout'), le chemin de la clé et la nouvelle valeur textuelle.",
            "Enregistrez pour que la modification soit instantanément servie aux utilisateurs."
        ],
        "Le dispositif automatique de garde de marque veille à ce qu'aucun nom de prestataire de paiement ne s'immisce dans les dictionnaires publics. Les URL respectent la politique de préfixe obligatoire (/fr et /en).",
        "16_translations", "Console de Santé des Traductions présentant les métriques de parité bilingue et les surcharges en ligne."
    )

    # 16. SEO
    add_module_section_fr(
        16, "Configuration SEO & Référencement Naturel",
        "Pilote les balises de référencement pour moteurs de recherche, les modèles de titres de page, les méta-descriptions bilingues et les visuels OpenGraph.",
        [
            "Rendez-vous sur /admin/seo pour ajuster les métadonnées globales du site.",
            "Modifiez les gabarits de titre de page en français et en anglais (ex. 'Pawelium | Conciergerie d'Adoption Animale Haut de Gamme').",
            "Rédigez des méta-descriptions percutantes respectant les critères d'affichage de Google.",
            "Spécifiez l'URL de l'image OpenGraph pour harmoniser les prévisualisations sur WhatsApp, Facebook ou LinkedIn.",
            "Cliquez sur 'Enregistrer les Paramètres SEO' pour appliquer les changements en base de données."
        ],
        "L'application distribue automatiquement un sitemap XML dynamique (/sitemap.xml) et un fichier de consignes robots (/robots.txt) actualisés en temps réel.",
        "17_seo", "Console de Paramétrage SEO présentant les gabarits de titres bilingues, méta-descriptions et paramètres d'image."
    )

    # 17. Newsletter
    add_module_section_fr(
        17, "Gestion des Abonnés Newsletter & Exports",
        "Recueille les adresses e-mail des visiteurs ayant souscrit à la lettre d'information en double opt-in et permet leur export CSV pour les campagnes marketing.",
        [
            "Accédez à /admin/newsletter pour examiner la liste des abonnés enregistrés.",
            "Visualisez le ratio des abonnements confirmés par rapport aux envois en attente et la répartition par langue.",
            "Cliquez sur 'Exporter en CSV' pour télécharger le fichier des contacts confirmés prêt à l'import dans votre logiciel de routage e-mail."
        ],
        "Les inscriptions nécessitent une validation via un lien de confirmation sécurisé. Les jetons de confirmation sont hashés en base pour prévenir tout détournement.",
        "18_newsletter", "Console des Abonnés Newsletter affichant la liste des contacts, les statuts de confirmation et l'action d'export CSV."
    )

    # 18. Analytics
    add_module_section_fr(
        18, "Analytique Commerciale & Performance des Passerelles",
        "Offre une vision stratégique sur le chiffre d'affaires brut, les taux de conversion d'adoption, le volume de commandes et la fiabilité de chaque passerelle carte.",
        [
            "Rendez-vous sur /admin/analytics pour analyser les indicateurs de performance commerciale.",
            "Inspectez le Chiffre d'Affaires Brut en euros calculé exclusivement sur les commandes payées et livrées.",
            "Consultez le Taux de Réussite des Paiements et le nombre total d'adoptions finalisées.",
            "Dans le tableau 'Performance des Passerelles Carte', examinez le nombre de tentatives et le taux de concrétisation par fournisseur (Stripe, Paystack, PaiementPro, CinetPay)."
        ],
        "Les calculs financiers reposent sur les enregistrements vérifiés en base de données sans aucune extrapolation côté client.",
        "19_analytics", "Console Analytique présentant les cartes de revenus, le taux de succès des transactions et le tableau de distribution des passerelles."
    )

    # 19. Audit
    add_module_section_fr(
        19, "Journal d'Audit Immuable & Forensique de Sécurité",
        "Trace chaque intervention administrative avec identifiant de l'auteur, adresse IP d'origine, charge utile détaillée et horodatage infalsifiable.",
        [
            "Consultez /admin/audit pour examiner le registre d'audit de sécurité.",
            "Toute modification (création d'animal, bascule de publication, changement de mot de passe, validation de remboursement) produit une ligne immuable.",
            "Filtrez les événements par administrateur, entité cible, catégorie d'action ou période calendaire.",
            "Analysez les adresses IP clientes et les signatures de navigateur pour certifier l'origine des instructions sensibles."
        ],
        "Le modèle AuditLog ne comporte aucune fonction de modification ou de suppression en base de données. Il constitue un registre légal certifié pour les audits RGPD et bancaires.",
        "20_audit", "Journal d'Audit de Sécurité présentant les événements administratifs horodatés, les adresses IP et les charges utiles."
    )

    # 20. Settings
    add_module_section_fr(
        20, "Paramètres Système & Diagnostic d'Infrastructure",
        "Vérifie la disponibilité des secrets d'environnement, l'état de la base de données, la configuration du service e-mail et l'ordre de priorité des passerelles de paiement.",
        [
            "Accédez à /admin/settings pour visualiser le tableau de bord de diagnostic technique.",
            "Vérifiez que le fournisseur de base de données indique bien SQLITE (développement/tests) ou POSTGRESQL (production Neon).",
            "Attestez que l'orchestration GeniusPay indique le mode LIVE ou SANDBOX avec politique carte bancaire stricte.",
            "Passez en revue l'ordre de priorité des cartes (#1 Stripe, #2 Paystack, #3 PaiementPro, #4 CinetPay) et confirmez que tous les disjoncteurs sont au statut 'CIRCUIT FERMÉ (SAIN)'.",
            "Examinez les barèmes opérationnels : durée du verrou temporaire (15 min), forfaits de livraison en France et en Europe, frais de dossier de conciergerie."
        ],
        "PROTECTION DES SECRETS : L'interface de configuration n'affiche jamais les clés secrètes en clair. Seuls des indicateurs de présence ('CONFIGURÉ', 'SÉCURISÉ') sont restitués visuellement pour prévenir toute fuite de données.",
        "21_settings", "Console des Paramètres Système avec diagnostics des services, ordre de priorité des passerelles et barèmes tarifaires."
    )

    doc.save(out_path)
    print(f"✅ Generated French User Guide: {out_path}")

if __name__ == "__main__":
    out_dir = os.path.join(os.getcwd(), "docs", "user-guide")
    os.makedirs(out_dir, exist_ok=True)
    
    en_path = os.path.join(out_dir, "Pawelium_SUPER_ADMIN_Guide_EN.docx")
    fr_path = os.path.join(out_dir, "Pawelium_Guide_SUPER_ADMIN_FR.docx")
    
    build_guide_en(en_path)
    build_guide_fr(fr_path)
    print("🎉 Both official Word user guides successfully generated!")
