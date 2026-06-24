---
name: wire-formspree
description: Finish wiring the contact form to deliver email to elias.polovina@polovinascientific.com via Formspree. The form is built and styled but currently uses a placeholder endpoint — use this skill to replace it with a real one.
---

The contact form in `src/pages/contact.astro` is fully built but posts to a placeholder endpoint:
```
https://formspree.io/f/YOUR_FORM_ID
```
This skill walks through replacing it with a real Formspree endpoint.

## What you need from the user before starting

- Confirmation they have (or are willing to create) a Formspree account verified with
  `elias.polovina@polovinascientific.com`.
- The Formspree form ID (looks like `xpwzabcd` — 8 alphanumeric characters), obtainable after
  completing step 1 below.

## Step 1 — create the Formspree form (user action required)

Tell the user:
> Go to https://formspree.io, sign up or log in with `elias.polovina@polovinascientific.com`,
> click **New Form**, name it something like "PSA Website Contact", and copy the form ID from the
> endpoint URL shown (e.g. `https://formspree.io/f/xpwzabcd` → the ID is `xpwzabcd`).

Wait for the user to supply the form ID before continuing.

Validate the ID shape before editing:
- Accept pattern: `^[a-z0-9]{8}$` (example: `xpwzabcd`).
- If it fails this pattern, ask the user to copy the ID again from Formspree.

## Step 2 — replace the placeholder

Open `src/pages/contact.astro`. The placeholder is near the top of the frontmatter block:

```ts
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
```

Replace `YOUR_FORM_ID` with the real ID the user just provided:

```ts
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xpwzabcd";  // ← real ID here
```

That single constant is the only thing that needs to change — the `<form action={FORMSPREE_ENDPOINT}>`,
the fetch in the `<script>`, and the `_subject` hidden field are all already wired correctly.

## Step 3 — verify the endpoint is live

Run a quick request to confirm Formspree responds to the endpoint before deploying.

### macOS/Linux (bash)

```bash
REAL_ID="<REAL_ID>"
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST "https://formspree.io/f/$REAL_ID" \
  -H "Accept: application/json" \
  -d "email=test@test.com&message=ping"
```

### Windows (PowerShell)

```powershell
$realId = "<REAL_ID>"
$resp = Invoke-WebRequest -UseBasicParsing `
  -Method POST `
  -Uri "https://formspree.io/f/$realId" `
  -Headers @{ Accept = "application/json" } `
  -Body @{ email = "test@test.com"; message = "ping" } `
  -ContentType "application/x-www-form-urlencoded"
$resp.StatusCode
```
Expected response: `200`. A `404` means the form ID doesn't exist yet — confirm the user
completed step 1 fully (Formspree requires email verification before a form is active).

## Step 4 — test the full form flow

1. Run `npm run dev`.
2. Open http://localhost:4321/contact in a real browser (not headless — form submission requires
   real JS execution).
3. Fill in all required fields and submit.
4. Confirm the `#form-success` panel appears (the form JS swaps it in on a `200` response).
5. Check `elias.polovina@polovinascientific.com`'s inbox — Formspree sends a notification email
   for each submission.

## Formspree settings worth enabling (optional, but recommended)

Remind the user to log into Formspree and configure:
- **Reply-To** — the form already sends the submitter's email as `email`, which Formspree
  auto-maps as the reply-to address on the notification email.
- **Spam filtering** — enabled by default on all Formspree plans; no action needed.
- **Email notifications** — confirm the notification email is going to the right address.
- **Redirect URL** — leave blank; the form uses the JSON/AJAX path (the `Accept: application/json`
  header) so Formspree won't redirect; it returns JSON and the page handles the success state
  itself.

## Definition of done

- `FORMSPREE_ENDPOINT` uses a real `https://formspree.io/f/<id>` value.
- Endpoint returns `200` to a test POST.
- Local contact form submit shows the success panel and sends email to
  `elias.polovina@polovinascientific.com`.
