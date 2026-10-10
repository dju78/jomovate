# Issues in separately hosted applications

These belong to other repositories and were **not changed** in the jomovate.com work. None of them is fixed. "Observed" means seen during this review; "Reported" means raised by the owner and not re-tested here.

| Application | Issue | Evidence | Suggested fix |
|---|---|---|---|
| UKCalc (ukcalc.jomovate.com) | Old contact address `dju78@jomovate.com` still shown | Observed 11 Oct 2026 on `/about`, `/contact` and `/privacy` | Replace with `info@jomovate.com` (the old address still works as an alias) |
| Performance Insight Explorer | A −17.0% fall is labelled "Largest Improvement" | Reported by owner; not re-tested (needs a loaded dataset) | Choose the label from the KPI's direction (higher-/lower-is-better) and the sign of the change |
| Professional Speaking Trainer | Feedback scorecard shows scores before any speech (Confidence 34%, Clarity 45%, Structure 45%, Delivery 47% with 0 words) | Observed 11 Oct 2026 | Show "—" until a session has a transcript |
| Professional Speaking Trainer | Page title brands it "Daramola Digital Labs" | Observed | Align branding with Jomovate if intended |
| TaxMate UK | Page title brands it "Daramola Digital Labs" | Observed | Align branding if intended |
| CarePhrase | GitHub "Website" field is `carephrace.com`, which does not resolve | Observed | Change to `https://carephrase.com` |
| Care Quality Intelligence | Demo usernames and passwords are published on the login page and in the README | Observed | Acceptable for synthetic demo data only; rotate if the deployment ever holds real data |
| DEAP Tax Compliance | Browser tab title is "deab7"; app opens straight to sign-in with no public description | Observed | Set a proper title and add a short public landing page |
| GarageProof (car.jomovate.com) | Browser tab title is "garageproof-app"; opens at pilot sign-in | Observed | Set title to "GarageProof UK"; consider a public landing page explaining the pilot |
| PriceLab | Hosted demo requires an account and predates the 1.0 build | Observed; stated in its README | Redeploy the current build; provide demo access or a public walkthrough |
| Price Quality Explorer | Streamlit app reports "You do not have access to this app or it does not exist" | Observed | Restore or remove the hosted demo |
| Kogi Quest | Page title brands it "OMOYELE EDUVERSE" | Observed | Confirm intended branding |
| tax-report-ng (private) | README titled "TaxMate UK" but code is a Nigerian tax-reporting app; repo homepage points at the TaxMate domain | Observed | Correct the README and repository homepage |

The jomovate.com portfolio describes each application with its real status and access level (open, demo sign-in, account required, invited pilot users, or unavailable), and does not claim any of the issues above are resolved.
