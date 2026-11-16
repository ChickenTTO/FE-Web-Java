Medicare Booking — Style ReferenceBrutalist editorial healthcare clinic on warm grayTheme: lightSource measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.Medicare runs on a brutalist-editorial logic adapted for modern healthcare booking: near-monochrome clinical canvas (#e5e5e5 page, #ffffff doctor & specialty cards, #000000 emergency/booking blocks), oversized uppercase display type squeezed into 0.9 line-height, and zero shadows or gradients. The single chromatic accent is a pale mint green (#d1ffca) used sparingly on department tags, "Available Today" badges, and insurance links, with yellow (#fff100) as a near-neon highlight on urgent alerts and hotline elements. Components are heavy on border-radius (24-64px on clinic cards, 48px on nav pills) and light on decoration — flat surfaces, thin or zero borders, no elevation effects. Typography does all the emotional work: compressed condensed headlines at 130px tower over 16px patient guide text, creating a dramatic scale ratio. The hero pairs a massive black appointment-booking headline with a 3D physical object render (textured diagnostic cubes and tactile medical modules with Medicare/Health labels), establishing a reassuring, material-care feel against the clinical canvas.Tokens — ColorsNameValueTokenRoleCarbon Black#000000--color-carbon-blackPrimary text, inverted urgent-care card surfaces, filled booking CTA blocks — the structural dark that anchors the monochrome systemPaper White#ffffff--color-paper-whiteDoctor profile cards, time-slot surfaces, inverted text on dark blocks, icon fills — the bright counterpoint to carbon blackWarm Canvas#e5e5e5--color-warm-canvasPage background, hero backdrop, section dividers — the slightly warm gray that distinguishes this from a sterile hospital white canvasMist Gray#f3f3f3--color-mist-graySecondary surface, nav pill backgrounds, calendar filter panels — one step lighter than canvas for quiet layeringAsh#c6c6c6--color-ashBorders, hairlines, booked/unavailable time-slot states — mid-tone neutral for structural linesSmoke#979797--color-smokeSecondary medical notes, doctor license meta labels, icon strokes — the muted text level for non-emphasized contentSlate#444444--color-slateSecondary body text (symptoms description, clinic address), navigation labels, and subdued headings. Do not promote it to the primary CTA colorGraphite#2f2f2f--color-graphiteDeep surface for electronic health record (EHR) snippets or heavy accents — near-black alternativeMint Chip#d1ffca--color-mint-chipSpecialty tag pills (e.g., Cardiology, Pediatrics), "Available Slot" highlights, insurance partner badges — the signature pale green that punctuates the monochrome systemVoltage Yellow#fff100--color-voltage-yellowEmergency hotline highlights, small availability indicator dots, urgent care notices — the high-energy chromatic note on micro-elementsTokens — TypographySuisseIntlCond — Display headlines — massive uppercase condensed at extreme sizes with tight 0.9 line-height creates the editorial brutalist voice; all-caps treatment amplifies clinical authority and clarity · --font-suisseintlcondSubstitute: Anton, Bebas Neue, Barlow Condensed BoldWeights: 700Sizes: 48px, 64px, 80px, 130pxLine height: 0.90Letter spacing: -0.0300emRole: Display headlines (e.g., "BOOK YOUR CARE NOW", "ZERO WAIT CLINICS") — massive uppercase condensed at extreme sizes with tight 0.9 line-height creates the editorial brutalist voice; all-caps treatment amplifies authoritySuisseIntl — Body text, nav, subheads, buttons, cards — the workhorse neo-grotesque that handles 90% of booking UI; weight 450 (a non-standard intermediate) carries mid-emphasis; 40px/450 uppercase serves as specialty and doctor names · --font-suisseintlSubstitute: Inter, Söhne, Neue Haas GroteskWeights: 400, 450, 500Sizes: 14px, 16px, 18px, 20px, 28px, 40pxLine height: 1.10, 1.14, 1.20, 1.25, 1.30, 1.33Letter spacing: -0.0300em, -0.0200em, -0.0110em, -0.0100emRole: Body text, nav, doctor bios, booking buttons, clinic cards — the workhorse neo-grotesque that handles 90% of UI; weight 450 carries mid-emphasis; 40px/450 uppercase serves as secondary headlinesSuisseIntlMono — Labels, tags, technical meta, small captions — monospace at 12px for appointment IDs, time-slot badges, and numbered booking steps · --font-suisseintlmonoSubstitute: JetBrains Mono, IBM Plex Mono, Geist MonoWeights: 400Sizes: 12pxLine height: 1.30, 1.60Letter spacing: -0.0300emRole: Labels, specialty tags, medical license numbers, time slots (e.g., 09:30 AM), small captions — monospace at 12px for system-level micro-copy and numbered annotationsType ScaleRoleFamilyWeightSizeLine HeightLetter SpacingTokencaption——12px1.6-0.36px--text-captionbody-sm——14px1.3-0.154px--text-body-smbody——16px1.25—--text-bodysubheading——18px1.33—--text-subheadingsubheading-lg——20px1.2—--text-subheading-lgheading-sm——28px1.3-0.84px--text-heading-smheading——40px1.1-0.8px--text-headingheading-lg——48px0.9-1.44px--text-heading-lgdisplay——80px0.9-2.4px--text-displaydisplay-xl——130px0.9-3.9px--text-display-xlTokens — Spacing & ShapesBase unit: 8pxDensity: comfortableSpacing ScaleNameValueToken88px--spacing-81616px--spacing-162424px--spacing-244040px--spacing-406464px--spacing-648080px--spacing-809696px--spacing-96Border RadiusElementValuetags64pxcards24-32pxbuttons4-8pxnav-pill48pxlarge-cards64pxLayoutPage max-width: 1200pxSection gap: 80pxCard padding: 24pxElement gap: 16-24pxComponentsFilled Dark ButtonRole: Primary CTA — "Đặt lịch khám ngay" (Book Appointment), "Xác nhận lịch hẹn" (Confirm Slot)Black (#000000) background, white (#ffffff) text, 8px radius, 16px 24px padding. SuisseIntl 16px/500. The high-contrast inverted treatment makes booking actions the strongest interactive element on any page.Ghost Border ButtonRole: Secondary navigation & filter action — "Chọn khung giờ khác" (Change Time), "Xem hồ sơ bác sĩ" (Doctor Profile)Transparent background, 1.5px solid border in #444444, #444444 text, 4px radius, 16px horizontal padding. SuisseIntl 16px/500. Restrained outlined variant for less critical booking actions.Text Link ButtonRole: Inline navigation, tertiary actions — "Chi tiết gói khám" (Package details), "Hướng dẫn nhịn ăn trước xét nghiệm"No background, no border, #000000 text, 0-4px radius, underline on hover. SuisseIntl 16px/500. Used for low-weight medical instructions and inline links.Nav PillRole: Top navigation container#ffffff background, 48px border-radius, wraps healthcare nav links (Chuyên khoa, Bác sĩ, Gói khám, Tra cứu BHYT) in a floating capsule. Creates a physical 'pill' shape that separates nav from the canvas.Standard CardRole: Doctor profile blocks, specialty containers, clinic location cards#ffffff background, 24-32px border-radius, no shadow, no border. Padding 24px. The flat white surface against the warm gray canvas creates natural separation without elevation.Inverted CardRole: Urgent Care / Telehealth fast-track blocks, Instant Booking summary zones#000000 background, 32px border-radius, white text. No shadow. Used for high-impact sections like 24/7 Emergency Telehealth or Fast-Track Booking that need to break the light canvas pattern.Top-Arc CardRole: Hero-bottom rounded booking widget, section openers (e.g., "Quy trình khám 3 bước")64px 64px 0px 0px border-radius (top corners rounded, bottom corners flat). Creates a 'dome' shape that suggests the booking portal emerges from below. Used in #000000 and #ffffff variants.Mint TagRole: Medical specialty labels (Tim mạch, Nhi khoa, Da liễu), "Còn lịch trống" (Available) indicators#d1ffca background, #000000 text, 64px radius (fully pill-shaped), small padding. The pale green pill is the signature accent element — used sparingly for medical taxonomy and real-time slot availability.Voltage HighlightRole: Emergency hotline numbers, urgent health alerts, support email links#fff100 background or text on select elements. Applied to emergency contact links (hotline@medicare.vn / 1900-XXXX) and small availability dots. The high-saturation yellow against monochrome creates immediate visual attention.3D Product RenderRole: Hero imagery, medical service illustrationTextured concrete and matte-ceramic cubes with warm wood-grain and colored geometric protrusions (mint green cross, yellow pulse dot, pink capsule form), branded with Medicare, BHYT, and JCI-Standard labels. Photorealistic 3D renders on clean canvas. The physical/tactile material treatment contrasts with the flat UI and replaces cliché stock doctor photos.Uppercase Display HeadingRole: Hero, major booking section titlesSuisseIntlCond 700 at 80-130px, line-height 0.9, letter-spacing -0.03em, uppercase. Extreme size + tight leading + condensed width creates massive visual blocks of text (e.g., "ĐẶT LỊCH KHÁM KHÔNG CHỜ ĐỢI") that dominate the page.Secondary HeadingRole: Sub-sections, Specialty titles, Doctor namesSuisseIntl 450 at 40px, uppercase, line-height 1.1, letter-spacing -0.02em. Lighter weight than display but still uppercase, bridging the brutalist display voice with readable clinical information.Mono LabelRole: Booking step indicators, time slots, insurance codes, numbered markersSuisseIntlMono 400 at 12px, letter-spacing -0.03em. Used for BƯỚC 01/03, SLOT: 08:30 - 09:00, doctor degree codes, and system labels. The monospace creates a precise clinical/editorial counterpoint to the neo-grotesque body.Do's and Don'tsDoUse SuisseIntlCond 700 at 48-130px with 0.9 line-height for all display headings — always uppercase, always tightly trackedApply the warm canvas (#e5e5e5) as the page background, never pure white — the gray is the canvas tone that makes white doctor and specialty cards feel liftedUse radius between 24-64px on clinic cards; 48px on nav pills; 4-8px on booking buttons — the radius scale is large and deliberateReserve #d1ffca (mint) for specialty tags and available slot badges; reserve #fff100 (yellow) for emergency hotlines and micro-accents onlyKeep all doctor and booking cards flat — no shadows, no gradients. Depth comes from surface color contrast between canvas, white, and blackSet nav height to 8rem with a floating pill-shaped container at 48px radius centered in the barUse 16px/500 SuisseIntl for symptom descriptions, doctor bios, and button labels; 14px/500 for clinic addresses and preparation checklistsDon'tNever add box-shadows to doctor cards, calendar pickers, or buttons — the system is explicitly flatAvoid pure white (#ffffff) as the page background — always use #e5e5e5 canvas beneath contentDo not use chromatic colors for large surface fills — mint and yellow are accent-only, used on small tags and status indicatorsNever set display heading line-height above 0.95 — the tight leading is what creates the compressed editorial blockDo not use mixed-case for headings — all display, specialty, and doctor name headings are uppercaseAvoid using SuisseIntlCond below 48px — the condensed face is designed for oversized display, not medical instructions or body textNever use subtle gray borders on cards — prefer surface color contrast over 1px borders for separationSurfacesLevelNameValuePurpose0Canvas#e5e5e5Page background — warm gray that separates healthcare content from pure white1Card#ffffffDoctor cards, specialty blocks, time-slot containers — clean white lifted from canvas2Inverted#000000Quick-booking bar, Telehealth/Emergency blocks — dramatic contrast zones3Mist#f3f3f3Subtle panel layering, nav pill backgrounds, date-picker unselected statesElevationFlat by design — zero shadows detected across all card variants. Depth is created through surface color contrast (canvas gray → white doctor cards → black instant-booking blocks) and radius, not elevation. This is a deliberate editorial-print influence that brings calm, structured clarity to medical booking.ImageryPhotorealistic 3D renders of physical medical & architectural objects — textured concrete and ceramic cubes with warm wood-grain elements, protruding colored geometric shapes (mint cross, yellow diagnostic light, soft coral pill), and branded labels (Medicare, BHYT, ISO-9001, JCI printed on surfaces). The renders sit on the warm gray canvas like medical industrial design in a gallery. No cheesy stethoscope stock imagery, no staged hospital lifestyle photography, no abstract gradients. Icons are minimal — monoline strokes in black or white for calendar, clock, location, and medical cross.LayoutFull-bleed warm gray (#e5e5e5) canvas with max-width ~1200px centered content. Hero is a split: massive 130px condensed booking headline on the left occupying ~50% width, 3D tactile medical object render on the right. Nav is a floating pill centered in the 8rem top bar. Sections alternate between light canvas, white specialty/doctor card surfaces, and full-width black inverted quick-booking blocks. Content is primarily single-column or 2-column splits. Specialty & Doctor directory is a card grid (2-3 columns). Footer is a compact dark band with clinic hours and emergency contacts. Vertical rhythm uses 80px section gaps with 24px element spacing. No sidebar navigation. No sticky elements beyond the header.Agent Prompt GuideQuick Color Reference:text: #000000background (canvas): #e5e5e5card surface: #ffffffborder/hairline: #c6c6c6accent: #d1ffca (mint)primary action: no distinct CTA color (uses #000000 Filled Dark Button)5 Example Component Prompts:Create a Medicare hero headline: 130px SuisseIntlCond weight 700, uppercase, line-height 0.9, letter-spacing -3.9px, #000000 text on #e5e5e5 canvas background. The headline should read as 3-4 lines of compressed uppercase text ("ĐẶT LỊCH KHÁM CHUYÊN KHOA TỨC THÌ") occupying the left 50% of the viewport.Create a Doctor / Specialty card: #ffffff background, 32px border-radius, no shadow, 24px padding, containing a 40px SuisseIntl weight 450 uppercase heading in #000000 (e.g., "KHOA TIM MẠCH" or "BS. CKI NGUYỄN VĂN A") and 16px body text in #444444 describing clinical expertise and available schedule. Place on #e5e5e5 canvas.Create a Mint Specialty & Availability tag pill: #d1ffca background, #000000 text, 64px border-radius, 8px 16px padding, 12px SuisseIntlMono weight 400 text (e.g., TRỐNG LỊCH HÔM NAY • 09:30). Use as a category/status label above doctor or department card titles.Create a Medicare top navigation bar: 8rem height, transparent #e5e5e5 background, containing a centered white pill at 48px border-radius with horizontal nav links ("Chuyên khoa", "Đội ngũ Bác sĩ", "Gói khám", "Bảo hiểm") in 16px SuisseIntl weight 500 #444444 text, 24px gap between links. Include a filled black 'Đặt lịch khám' button (8px radius, #ffffff text) aligned right.Create an Inverted Fast-Booking / Telehealth section: full-width #000000 background, 80px vertical padding, containing white text — an 80px SuisseIntlCond 700 uppercase headline ("KHÁM TỪ XA & CẤP CỨU 24/7") followed by 16px #979797 body text explaining instant insurance verification and zero-wait check-in. No shadows or gradients.Similar BrandsLinear — Same approach of oversized condensed display type, monochrome canvas with single accent color, flat surfaces with zero shadowsVercel — Similar full-bleed hero with massive headline, monochromatic palette, and large-radius card surfacesCursor — Same editorial-brutalist typographic voice with uppercase condensed headings and minimal color paletteArc Browser — Shared warm-gray canvas approach, oversized display type, and accent color used sparingly on small functional elementsQuick StartCSS Custom Properties:root {
  /* Colors */
  --color-carbon-black: #000000;
  --color-paper-white: #ffffff;
  --color-warm-canvas: #e5e5e5;
  --color-mist-gray: #f3f3f3;
  --color-ash: #c6c6c6;
  --color-smoke: #979797;
  --color-slate: #444444;
  --color-graphite: #2f2f2f;
  --color-mint-chip: #d1ffca;
  --color-voltage-yellow: #fff100;

  /* Typography — Font Families */
  --font-suisseintlcond: 'SuisseIntlCond', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-suisseintl: 'SuisseIntl', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-suisseintlmono: 'SuisseIntlMono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.6;
  --tracking-caption: -0.36px;
  --text-body-sm: 14px;
  --leading-body-sm: 1.3;
  --tracking-body-sm: -0.154px;
  --text-body: 16px;
  --leading-body: 1.25;
  --text-subheading: 18px;
  --leading-subheading: 1.33;
  --text-subheading-lg: 20px;
  --leading-subheading-lg: 1.2;
  --text-heading-sm: 28px;
  --leading-heading-sm: 1.3;
  --tracking-heading-sm: -0.84px;
  --text-heading: 40px;
  --leading-heading: 1.1;
  --tracking-heading: -0.8px;
  --text-heading-lg: 48px;
  --leading-heading-lg: 0.9;
  --tracking-heading-lg: -1.44px;
  --text-display: 80px;
  --leading-display: 0.9;
  --tracking-display: -2.4px;
  --text-display-xl: 130px;
  --leading-display-xl: 0.9;
  --tracking-display-xl: -3.9px;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-w450: 450;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 8px;
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-40: 40px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 80px;
  --card-padding: 24px;
  --element-gap: 16-24px;

  /* Border Radius */
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-3xl-2: 32px;
  --radius-full: 48px;
  --radius-full-2: 64px;
  --radius-full-3: 9999px;

  /* Named Radii */
  --radius-tags: 64px;
  --radius-cards: 24-32px;
  --radius-buttons: 4-8px;
  --radius-nav-pill: 48px;
  --radius-large-cards: 64px;

  /* Surfaces */
  --surface-canvas: #e5e5e5;
  --surface-card: #ffffff;
  --surface-inverted: #000000;
  --surface-mist: #f3f3f3;
}
Tailwind v4@theme {
  /* Colors */
  --color-carbon-black: #000000;
  --color-paper-white: #ffffff;
  --color-warm-canvas: #e5e5e5;
  --color-mist-gray: #f3f3f3;
  --color-ash: #c6c6c6;
  --color-smoke: #979797;
  --color-slate: #444444;
  --color-graphite: #2f2f2f;
  --color-mint-chip: #d1ffca;
  --color-voltage-yellow: #fff100;

  /* Typography */
  --font-suisseintlcond: 'SuisseIntlCond', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-suisseintl: 'SuisseIntl', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-suisseintlmono: 'SuisseIntlMono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.6;
  --tracking-caption: -0.36px;
  --text-body-sm: 14px;
  --leading-body-sm: 1.3;
  --tracking-body-sm: -0.154px;
  --text-body: 16px;
  --leading-body: 1.25;
  --text-subheading: 18px;
  --leading-subheading: 1.33;
  --text-subheading-lg: 20px;
  --leading-subheading-lg: 1.2;
  --text-heading-sm: 28px;
  --leading-heading-sm: 1.3;
  --tracking-heading-sm: -0.84px;
  --text-heading: 40px;
  --leading-heading: 1.1;
  --tracking-heading: -0.8px;
  --text-heading-lg: 48px;
  --leading-heading-lg: 0.9;
  --tracking-heading-lg: -1.44px;
  --text-display: 80px;
  --leading-display: 0.9;
  --tracking-display: -2.4px;
  --text-display-xl: 130px;
  --leading-display-xl: 0.9;
  --tracking-display-xl: -3.9px;

  /* Spacing */
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-40: 40px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;

  /* Border Radius */
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-3xl-2: 32px;
  --radius-full: 48px;
  --radius-full-2: 64px;
  --radius-full-3: 9999px;
}
