---
name: verify-site
description: Build and visually verify the Polovina Scientific site. Runs a production build, starts the dev server, and takes headless-Chrome screenshots of all four pages. Use when asked to verify, QA, or visually check the site after a change.
---

Visual QA workflow for the Polovina Scientific Astro site. Follow each step; do not skip the
build step even if the change looks trivial.

## Step 1 — production build

```bash
npm run build
```

A clean build is the primary correctness signal. If this fails, fix the error before proceeding.
The four expected routes are: `/`, `/capabilities`, `/about`, `/contact`.

## Step 2 — start dev server

```bash
(nohup npm run dev -- --port 4321 > /tmp/psa-dev.log 2>&1 &)
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/
```

Confirm `200` before taking screenshots.

## Step 3 — screenshot all pages

Use the system Chrome installation:
```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p /tmp/psa-shots

"$CHROME" --headless=new --disable-gpu --no-sandbox \
  --screenshot=/tmp/psa-shots/home.png        --window-size=1440,1600 http://localhost:4321/
"$CHROME" --headless=new --disable-gpu --no-sandbox \
  --screenshot=/tmp/psa-shots/capabilities.png --window-size=1440,2400 http://localhost:4321/capabilities
"$CHROME" --headless=new --disable-gpu --no-sandbox \
  --screenshot=/tmp/psa-shots/about.png        --window-size=1440,1850 http://localhost:4321/about
"$CHROME" --headless=new --disable-gpu --no-sandbox \
  --screenshot=/tmp/psa-shots/contact.png      --window-size=1440,1300 http://localhost:4321/contact
```

Use the Read tool to view each screenshot and confirm layout, content, and navigation are correct.

## ⚠️ Known gotcha — entrance animation timing

Above-the-fold elements on the home page (hero headline, diligence panel) use the `.rise` CSS
animation class (`animation-delay` up to 0.15s, duration 0.7s). A headless screenshot captured
before the animation completes will show those elements as faint or entirely absent. This is a
**capture-timing artifact**, not a real rendering bug.

**If a rise-animated element looks missing or washed out:**
1. Wait ~2s and retake the screenshot before concluding there's a bug.
2. Or, to get a reliable screenshot without timing risk: temporarily patch `global.css`:
   ```css
   .rise { animation: none; opacity: 1; }
   ```
   Screenshot, read the result, then revert the file (`cp /tmp/global.css.bak src/styles/global.css`
   — take the backup before patching).

**Rapid edit-then-screenshot** can also catch Vite mid-HMR-reload, producing a stale/blank
result. Always wait ~2s after editing a file before capturing.

## Cropping for detail

If a region needs closer inspection, use Pillow (install if needed: `pip install --break-system-packages Pillow`):

```python
from PIL import Image
im = Image.open('/tmp/psa-shots/home.png')
w, h = im.size
# Adjust fractions to target the region of interest
crop = im.crop((int(w * 0.42), int(h * 0.03), w, int(h * 0.30)))
crop = crop.resize((crop.size[0] * 2, crop.size[1] * 2), Image.LANCZOS)
crop.save('/tmp/psa-shots/home_crop.png')
```

## Step 4 — clean up

```bash
pkill -f "astro dev"
rm -rf /tmp/psa-shots /tmp/psa-dev.log
```
