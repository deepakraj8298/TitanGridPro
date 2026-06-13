# TitanGrid Pro — Mobile Test Guide

This guide describes how to create, configure, and execute a mobile test page for the TitanGrid Pro widget in a Mendix application. Following these steps ensures that the widget is verified on phone and tablet screen sizes before each release.

**See also**: [Setup Guide](./SETUP_GUIDE.md) | [Feature Guide](./FEATURES.md)

---

## When to Run Mobile Testing

Run this checklist when any of the following changes are made:

- The `enableMobileView` widget property is toggled.
- Any responsive breakpoint property (`responsiveBreakpoint`, `mobileBreakpoint`) is changed.
- A new theme is applied.
- Changes are made to row height, font size, or card view layout.

---

## Step 1 — Create a Mendix Phone Profile Test Page

1. Open your Mendix app in **Studio Pro**.
2. In the **App Explorer**, right-click the module where you want the test page.
3. Select **Add** → **Page**.
4. In the page dialog, configure:
   - **Name**: `TitanGrid_Mobile_Test`
   - **Navigation profile**: select **Phone (web)** or **Tablet (web)**
   - **Page template**: Blank — do not use a template with a sidebar
5. Click **OK**.

---

## Step 2 — Add the TitanGrid Widget to the Test Page

1. On the new page, drag and drop **TitanGrid Pro** from the Toolbox.
2. In the widget properties pane, set the following recommended values:

   | Property | Recommended Test Value |
   |---|---|
   | `enableMobileView` | `Yes` |
   | `mobileBreakpoint` | `768` (px) |
   | `responsiveBreakpoint` | `s768px` |
   | `gridWidth` | `100%` |
   | `gridHeight` | `auto` |
   | `columnWidthMode` | `auto` |
   | `rowHeightMode` | `comfortable` |
   | `gridTheme` | `alpine` (or `dark` for dark-mode testing) |

3. Connect the widget to a test data source containing **at least 20 rows and 5 columns** for a meaningful test.

---

## Step 3 — Run the Mendix App in Phone Preview Mode

### Option A — Browser DevTools (recommended)

1. Run your Mendix app locally (press **F5** in Studio Pro).
2. Open the page in **Google Chrome** or **Firefox**.
3. Press **F12** to open DevTools.
4. Click the **Device Toolbar** icon (the mobile phone icon, or press `Ctrl+Shift+M`).
5. Select a device preset from the dropdown:

   | Device | Viewport |
   |---|---|
   | iPhone SE | 375 × 667 px |
   | iPhone 12 Pro | 390 × 844 px |
   | iPad Air | 820 × 1180 px |

6. Navigate to the `TitanGrid_Mobile_Test` page.

### Option B — Physical Device

1. Ensure your Mendix dev server is accessible on the local network.
2. Open the app URL on a physical phone or tablet browser.
3. Navigate to the `TitanGrid_Mobile_Test` page.

---

## Step 4 — Responsive Breakpoint Test Scenarios

Test at each of the following viewport widths by resizing the browser window or selecting a matching device in DevTools:

| Breakpoint | Width | Expected Behaviour |
|---|---|---|
| **Phone portrait** | 480 px | Card view active, full-width cards, large tap targets |
| **Breakpoint threshold** | 768 px | Verify the transition between card view and table view |
| **Tablet landscape** | 1024 px | Table view active, toolbar visible |
| **Desktop** | 1280 px | Full table layout, card view inactive |

---

## Step 5 — Card View Feature Verification Checklist

When `enableMobileView = Yes` and the viewport is below `mobileBreakpoint`, verify:

- [ ] Cards render in a single column on narrow screens
- [ ] Each card shows the row header label and all visible column values
- [ ] Alternating card background colours apply correctly (`enableAlternatingRows`)
- [ ] Row click action fires on card tap (`onClickRow`)
- [ ] Custom cell widgets render correctly inside the card layout
- [ ] Empty state message shows when no records exist
- [ ] Vertical scrolling works without any horizontal overflow
- [ ] The aggregation totals card renders at the top or bottom as configured
- [ ] A fixed `gridHeight` value does not clip content on mobile

---

## Step 6 — Theme Verification on Mobile

Test each theme by setting `gridTheme` in the widget properties and reloading the page:

- [ ] **alpine** — Light background, blue header accent, clean borders
- [ ] **dark** — Dark background (`#1a1a1a`), all text readable on small screen
- [ ] **material** — Uppercase headers, Material Design blue hover
- [ ] **bootstrap** — Bootstrap grey header, `#dee2e6` borders
- [ ] **minimal** — No border, clean whitespace layout

---

## Step 7 — Export and Print on Mobile

These features should degrade gracefully on touch devices:

| Feature | Expected Mobile Behaviour |
|---|---|
| CSV export button | Triggers a file download dialog on the device |
| Excel export button | Triggers a `.xlsx` file download (browser-dependent) |
| Print button | Opens the browser print dialog; layout uses `@media print` rules |
| Right-click context menu | Not available on touch devices — this is expected behaviour |

---

## Known Limitations on Mobile

> [!NOTE]
> Column resizing (drag-to-resize handles) is not touch-friendly when `columnWidthMode = resizable`.
> Set `columnWidthMode = auto` on mobile test pages for the best experience.

> [!NOTE]
> Pinned columns (`stickyLeftColumns`, `stickyRightColumns`) use `position: sticky`, which requires `overflow: auto` on the parent container. Verify that sticky columns do not cause layout shifts on **iOS Safari**, which has known quirks with sticky positioning inside overflow containers.

---

## Mendix Mobile Profile Navigation

To add the test page to the mobile navigation menu:

1. Open **Navigation** in Studio Pro.
2. Switch to the **Phone web** or **Tablet web** profile tab.
3. Add a new menu item pointing to `TitanGrid_Mobile_Test`.
4. Deploy and navigate to the page from the device's bottom navigation bar.
