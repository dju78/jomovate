# Jomovate — Website Source

This repository holds the **Claude Design source** for the Jomovate marketing website
(*Innovate. Grow. Elevate.*). It is the version-controlled source of truth, **not** a
pre-built static site — the pages are Claude Design documents (`.dc.html`) that render
through the Claude Design runtime and the shared **Organic** design system.

Because there is no standalone `index.html` and the pages depend on the Claude runtime,
this repo is not intended to be served directly from GitHub Pages. The site is published
through **Claude Design → Netlify**, which renders the pages and serves the result.

## Structure

```
Jomovate design system/
├─ Home.dc.html          # Landing page
├─ Products.dc.html      # 8 real products with screenshots
├─ Services.dc.html      # Data Analytics · Digital Product Development ·
│                        #   Workflow Automation · Research & Business Intelligence
├─ About.dc.html         # Company + founder profile
├─ Insights.dc.html      # Selected published research / policy work
├─ Contact.dc.html       # "Start a Conversation" — Netlify enquiry form
├─ NavHeader.dc.html     # Shared navigation
├─ Footer.dc.html        # Shared footer
├─ _ds/organic-…/        # Organic design system (tokens, styles.css, bundle)
├─ assets/               # Photography, product screenshots, founder image, logo/icon
├─ uploads/              # Uploaded brand assets
├─ support.js            # Claude Design runtime
├─ image-slot.js         # <image-slot> component
└─ doc-page.js           # Page runtime helper
```

## Design system

All colour, type, spacing, radius and shadow values come from design tokens defined in
`_ds/organic-…/styles.css` (see that folder's `readme.md`). Pages should never hard-code
a hex, font or pixel value that a token already provides.

## Contact form

`Contact.dc.html` is wired for **Netlify Forms** (`name="jomovate-enquiry"`, hidden
`form-name` field, honeypot, required fields). Netlify detects and captures submissions at
deploy time. The public contact address is `dju78@jomovate.com`.

## Deployment

Publish from Claude Design using **Send to Netlify**, then connect the custom domains
`jomovate.com` and `www.jomovate.com` in Netlify. See the project deployment notes for the
full DNS and verification checklist.

---
© 2026 Jomovate. All rights reserved.
