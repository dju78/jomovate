# Measurement and advertising integration

**Current state: no analytics, advertising pixel or tag manager is installed.** The site sets no cookies and loads no third-party scripts. Nothing below is active until you add a tag manager with real account identifiers and appropriate consent.

## What the site already records

### In each enquiry (stored by Netlify Forms)
| Field | Source |
|---|---|
| `enquiry-source` | Optional "How did you hear about Jomovate?" answer |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Campaign parameters on the landing URL |
| `gclid` | Google Ads click ID (auto-tagging), if present |
| `landing_page` | The first page visited with campaign parameters |
| `enquiry-type` | `discussion`, `quote` or `demo` |
| `referring-project` | Case study the visitor came from, if any |

Campaign values are allow-listed and sanitised (`src/js/attribution.js`), carried between pages **in the page address only** (no cookies or storage), and copied into hidden form fields. Use tagged landing URLs in adverts, for example:

```
https://jomovate.com/services/web-development/?utm_source=google&utm_medium=cpc&utm_campaign=web-dev-uk
https://jomovate.com/services/data-analysis/?utm_source=google&utm_medium=cpc&utm_campaign=data-dashboards-uk
```

### Browser events (pushed only if a tag manager has created `window.dataLayer`)
| Event | Meaning | Count as a conversion? |
|---|---|---|
| `cta_click` | Clicked a "Discuss your project" button (with `location`) | No — interest only |
| `contact_click` (`method: email` or `whatsapp`) | Clicked the email or WhatsApp link | No — opening an app is not an enquiry |
| `channel_click` | Clicked "Follow Jomovate on WhatsApp" | No |
| `enquiry_submitted` | **Netlify accepted the form submission** (2xx response) | **Yes — the only lead event** |
| `enquiry_failed` | Submission failed; visitor was shown an error | No |

`enquiry_submitted` fires only after a successful response, never on a click. The site does not create `dataLayer` itself.

## To connect Google Ads, GA4 or another platform later

1. Decide what you need consent for. Analytics and advertising cookies need opt-in consent in the UK (PECR/UK GDPR). Add a consent banner that defaults to "denied" (for Google, use Consent Mode v2) **before** loading any tag.
2. Create the accounts and get the real identifiers (GTM container `GTM-…`, Ads conversion ID/label). Do not use placeholders.
3. Add the tag-manager snippet to `<head>` in `src/layout.mjs`. Because the CSP blocks inline scripts, either load it as a file from `/js/` or add a CSP hash or nonce, and allow the tag domains in `netlify.toml` (`script-src`, `img-src`, `connect-src`).
4. In the tag manager, trigger the Ads conversion and GA4 `generate_lead` on the **`enquiry_submitted`** event only.
5. Update the privacy notice (`privacy()` in `src/pages.mjs`): it currently states that no cookies, analytics or pixels are used.
6. Re-run `npm test`. The test "no third-party scripts, pixels or font requests" will fail by design and must be updated deliberately with the approved domains.

Offline alternative without any tags: export enquiries from Netlify Forms, and upload those with a `gclid` to Google Ads as offline conversions.
