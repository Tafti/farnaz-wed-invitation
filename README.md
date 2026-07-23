# Wedding Invitation Card

Interactive, mobile-first wedding invitation with:
- Scratch-to-reveal circular center image
- Clickable venue address (opens Maps)
- Native share + WhatsApp share button

## Quick Customize

Edit these files:
- `index.html`
  - Names, date/time, venue text
  - Maps address URL in the venue link
- `script.js`
  - `cardData` values for share text
- `assets/couple.svg`
  - Replace with your own image if you want

If you replace image with a photo, keep it square for best circular crop.

## Run Locally

Open `index.html` in your browser.

For phone testing on same Wi-Fi:
1. In this folder run: `python3 -m http.server 8080`
2. On your phone open: `http://YOUR_COMPUTER_IP:8080`

## Publish (Public Link for WhatsApp)

### Option A: Netlify Drop (fastest)
1. Go to https://app.netlify.com/drop
2. Drag this folder into the page
3. Copy generated public link
4. Send that link in WhatsApp

### Option B: GitHub Pages
1. Push this folder to a GitHub repository
2. In repository settings, enable Pages from main branch root
3. Copy the Pages URL
4. Send URL in WhatsApp

## WhatsApp Sharing

Once hosted on a public URL, the `Share on WhatsApp` button automatically sends that URL.
