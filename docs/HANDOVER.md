# Handover — professional upgrade (October 2026)

Branch: `feature/professional-upgrade`. Nothing has been merged to `main` or deployed to production.

## 1. What changed

- **Standalone static site** replacing the Claude Design runtime (reasons in the README). Zero npm dependencies; Netlify builds with `node scripts/build.mjs`.
- **New structure:** Home · Services overview · Website & application development · Data analysis & dashboards · Work directory (search + sector/status/service filters, shareable filter URLs) · 17 case-study pages · About · Insights (2 articles + 5 publications) · Contact · Thanks · Privacy · 404.
- **Central data:** `content/projects.json` drives cards, filters, case studies, sitemap, structured data and social previews.
- **Removed:** fabricated Services dashboard (+$2.4M, 35%, 520 hrs), generic stock/AI imagery (team photo, branded office, insight illustrations), "Enterprise / small business / consumers" filler, the "we reply within two business days" promise.
- **Accuracy fixes:** TaxMate UK relabelled Prototype (its README says prototype); Speaking Trainer no longer implies AI (no AI dependency in source); UBA Pulse and NairaGuard carry explicit not-affiliated / simulated notices; AI Lab, Price Quality Explorer and PriceLab keep their independent / not-ONS context; CQI, CarePhrase and the Academy state they are not CQC-endorsed or clinical tools.
- **New entries:** UK AI Economic Measurement Lab, PriceLab, Takete-Ide community website, Aldanat Care FC Match Predictor, all with new screenshots.
- **Enquiry form:** name, email, optional organisation, service, brief, optional budget and timeframe; accessible inline errors and error summary; honeypot; success shown only on a 2xx response; no-JS fallback page.
- **SEO/sharing:** per-page titles, descriptions and canonicals in `<head>`; per-project 1200×630 social images; Organization, Person, Service, SoftwareApplication/WebSite, Article and BreadcrumbList JSON-LD; sitemap.xml; robots.txt; 301s from every old `.dc.html` URL.
- **Security headers** and a strict Content-Security-Policy in `netlify.toml` (no inline scripts or styles on any page).

## 2. Preview locally

```bash
npm run build
npm run serve            # http://localhost:8123
```

## 3. Test results (10 October 2026)

- `npm test`: **22/22 passing** — content validation, every project has a page, no private repo links, no fabricated metrics, metadata in `<head>` on every page, valid JSON-LD, all internal links/images resolve, alt text and dimensions on all images, form wiring and required/optional fields, legacy redirects, sitemap, no legacy runtime / inline styles, homepage selection size, and 8 unit tests for form validation and success/failure handling.
- Browser checks (local): mobile menu open/close, Work filters (search, sector, status, empty state, clear, URL state), contact form validation, prefill from `?service=…&type=quote&ref=…`, success path, and failure path against a server returning 404.
- `npm run check-links`: 37 of 40 external links return 200. SSRN returns 403 to scripts (the DOI resolves to the SSRN page); the two Streamlit apps loop on cookies for scripts and were verified in a browser instead.
- **Not tested:** a real Netlify form submission (form detection is off — see §5), the products' own back-end features (only their public pages were loaded), and assistive-technology testing with a screen reader.

## 4. Mapping conflicts and missing evidence

| Item | Finding | What the site does |
|---|---|---|
| UKCalc calculator count | Repo's `UK_Calculator_Platform_Engineering_Foundation/FOUNDATION_STATUS.md` says 55; live site says 253 in 19 categories (served from the root `apps/web` Next.js app) | Uses 253, sourced from the live site |
| CarePhrase domain | GitHub homepage metadata `carephrace.com` does not resolve | Uses carephrase.com. Fix the GitHub "Website" field |
| tax-report-ng | README titled "TaxMate UK", homepage points to the TaxMate domain, but the code is a Nigerian tax reporting app (FIRS/VAT/WHT) | Not shown. Correct the README if it will be shown later |
| Speaking Trainer | README shows a "Claude" badge; no AI dependency in package.json; uses browser speech recognition | No AI claim |
| UK AI Lab | Public repo has documentation only; README quick-start refers to an app folder that isn't committed | "View source" kept (public), limitation stated |
| Apeke Alága URL | Prompt/README: apeke-alaga.dju78.chatgpt.site; repo homepage: apekealaga.vercel.app | Both load; draft uses the Vercel URL |
| uba vs uba2 | Not versions of one app: `uba` is a professorial-chair proposal dashboard (with `proflawal`); `uba2` is UBA Pulse | Only UBA Pulse shown |
| Nairadetect vs Fake-money-detector- | Nairadetect ("Naira Verify") is an earlier, private attempt; the live NairaGuard is Fake-money-detector- | Merged into NairaGuard |
| GarageProof / AutoDamage | car.jomovate.com = Netlify project fed by `car_garage` (originally "autodamage-quote"); `car_-repair_clau` = design system + marketing preview | One GarageProof entry, no source link |
| PriceLab demo | Requires sign-in; README says the demo predates the 1.0 build | Stated on the page |
| Price Quality Explorer demo | Streamlit reports no access / app does not exist | "Demo currently unavailable" kept |
| LinkedIn | Two different profile URLs in your materials (`daramola-joseph-omoyele` and `daramola-omoyele-bbb006244`) | No LinkedIn link added until you confirm which |
| Founder photo | The portrait has a JOMOVATE wall sign that looks digitally composited | Used on Home/About only; replace with an unedited photo if you have one |
| Professional titles | omoyelejd.co.uk describes you as a Chartered Accountant; the awarding body isn't stated | Not used on the site |

## 5. Configuration and permissions needed from you

1. **Enable Netlify form detection** for project `jomovate`, then add an email notification for `jomovate-enquiry`. Until this is done, enquiries cannot be received (the page now says so honestly instead of showing false success).
2. Confirm that the Netlify build image can run `node scripts/build.mjs` (it sets `NODE_VERSION=22`; no install step is needed).
3. Decide on the three draft client case studies in `drafts/` (TOBDAV, Alaga Alayo, Apeke Alága): written client approval is needed before publishing. Instructions are at the top of `drafts/drafts.json`.
4. Review the two Insights articles and the About copy. They are written in your voice from your projects and public profiles.
5. Optionally confirm a LinkedIn URL and an unedited founder photo.
6. CQI's public README and login page publish its demo passwords. They're demo-only, but if the deployment holds anything real, rotate them.

## 6. Deploying

1. `git push -u origin feature/professional-upgrade` — Netlify builds a deploy preview if branch/PR previews are enabled.
2. Check the preview: home, /work/ filters, a case study, /contact/, and `/Products.dc.html` redirecting to `/work/`.
3. Enable form detection (§5.1), then submit one real test enquiry on the deploy preview and confirm it arrives in Netlify → Forms.
4. Merge into `main` (PR or `git merge`). Netlify deploys production automatically from `main`.
5. After launch: submit `https://jomovate.com/sitemap.xml` in Google Search Console and test a page with a LinkedIn Post Inspector to refresh old link previews.

## 7. Known limitations

- Fonts load from Google Fonts (allowed in the CSP); self-hosting would remove that third-party request.
- Screenshots of third-party sites were captured on 10 October 2026 and will age; re-capture when products change.
- Free-hosted demos (Streamlit, CQI) sleep and can take up to a minute to load; this is stated on their pages.
- Image processing was done once with `sharp` from the old local tooling folder; new screenshots can be produced with any tool at the sizes in the README.
