---
name: verify-site
description: Build and visually verify the Polovina Scientific site. Runs a production build, starts the dev server, and takes headless-Chrome screenshots of all four pages. Use when asked to verify, QA, or visually check the site after a change.
---

Visual QA workflow for the Polovina Scientific Astro site. Follow each step; do not skip the
build step even if the change looks trivial.

## Step 0 — preflight dependencies

If the build fails because Astro is missing, install dependencies first:

```bash
npm ci
```

```powershell
npm ci
```

## Step 1 — production build

```bash
npm run build
```

```powershell
npm run build
```

A clean build is the primary correctness signal. If this fails, fix the error before proceeding.
The four expected routes are: `/`, `/capabilities`, `/about`, `/contact`.

## Step 2 — start dev server

### macOS/Linux (bash)

Run the dev server in the background and write logs under `./logs/`:

```bash
mkdir -p ./logs
npm run dev -- --host 127.0.0.1 --port 4321 > ./logs/psa-dev.log 2> ./logs/psa-dev.err.log &
DEV_PID=$!
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4321/
```

Confirm the status code is `200` before taking screenshots, and keep `$DEV_PID` for cleanup.

### Windows (PowerShell)

Run the dev server in a detached process and write logs under `logs/`:

```powershell
$repo = (Get-Location).Path
New-Item -ItemType Directory -Force -Path ".\logs" | Out-Null
$proc = Start-Process -FilePath "npm.cmd" `
  -ArgumentList "run","dev","--","--host","127.0.0.1","--port","4321" `
  -PassThru -WindowStyle Hidden `
  -RedirectStandardOutput ".\logs\psa-dev.log" `
  -RedirectStandardError ".\logs\psa-dev.err.log"
Start-Sleep -Seconds 3
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4321/).StatusCode
```

Confirm the status code is `200` before taking screenshots, and keep `$proc.Id` for cleanup.

## Step 3 — screenshot all pages

### macOS/Linux (bash)

Use Chrome if installed; otherwise fall back to Edge:

```bash
repo="$(pwd)"
shots="$repo/logs/psa-shots"
mkdir -p "$shots"

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -x "$chrome" ]; then
  chrome="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
fi
if [ ! -x "$chrome" ]; then
  echo "No Chrome or Edge binary found for headless screenshots." >&2
  exit 1
fi

"$chrome" --headless=new --disable-gpu --no-sandbox --window-size=1440,1600 --screenshot="$shots/home.png"         http://127.0.0.1:4321/
"$chrome" --headless=new --disable-gpu --no-sandbox --window-size=1440,2400 --screenshot="$shots/capabilities.png" http://127.0.0.1:4321/capabilities
"$chrome" --headless=new --disable-gpu --no-sandbox --window-size=1440,1850 --screenshot="$shots/about.png"        http://127.0.0.1:4321/about
"$chrome" --headless=new --disable-gpu --no-sandbox --window-size=1440,1300 --screenshot="$shots/contact.png"      http://127.0.0.1:4321/contact
```

### Windows (PowerShell)

Use the installed Chrome binary (or Edge if Chrome is unavailable):

```powershell
$repo = (Get-Location).Path
$shots = Join-Path $repo "logs\psa-shots"
New-Item -ItemType Directory -Force -Path $shots | Out-Null

$chrome = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
  $chrome = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chrome)) {
  $chrome = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
}
if (-not (Test-Path $chrome)) {
  throw "No Chrome or Edge binary found for headless screenshots."
}

& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1600 --screenshot="$shots\home.png"         http://127.0.0.1:4321/
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,2400 --screenshot="$shots\capabilities.png" http://127.0.0.1:4321/capabilities
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1850 --screenshot="$shots\about.png"        http://127.0.0.1:4321/about
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1300 --screenshot="$shots\contact.png"      http://127.0.0.1:4321/contact
```

Use the `view` tool to open each screenshot and confirm layout, content, and navigation are correct.

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
   Screenshot, read the result, then revert the file (for example on bash:
   `cp src/styles/global.css src/styles/global.css.bak` then
   `mv -f src/styles/global.css.bak src/styles/global.css`; on PowerShell:
   `Copy-Item src\styles\global.css src\styles\global.css.bak` then
   `Move-Item -Force src\styles\global.css.bak src\styles\global.css`).

**Rapid edit-then-screenshot** can also catch Vite mid-HMR-reload, producing a stale/blank
result. Always wait ~2s after editing a file before capturing.

## Cropping for detail

If a region needs closer inspection, use Pillow (install if needed: `pip install Pillow`):

```python
from PIL import Image
import os
repo = os.getcwd()
im = Image.open(os.path.join(repo, "logs", "psa-shots", "home.png"))
w, h = im.size
# Adjust fractions to target the region of interest
crop = im.crop((int(w * 0.42), int(h * 0.03), w, int(h * 0.30)))
crop = crop.resize((crop.size[0] * 2, crop.size[1] * 2), Image.LANCZOS)
crop.save(os.path.join(repo, "logs", "psa-shots", "home_crop.png"))
```

## Step 4 — clean up

### macOS/Linux (bash)

```bash
if [ -n "${DEV_PID:-}" ]; then kill "$DEV_PID"; fi
rm -rf ./logs/psa-shots
```

### Windows (PowerShell)

```powershell
if ($proc -and $proc.Id) { Stop-Process -Id $proc.Id }
Remove-Item -Recurse -Force ".\logs\psa-shots" -ErrorAction SilentlyContinue
```

## Definition of done

- `npm run build` succeeds and includes the four expected routes.
- Dev server returns `200` on `/`.
- Fresh screenshots exist for `/`, `/capabilities`, `/about`, and `/contact`.
