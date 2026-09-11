# Editable AI ads

Reference implementation for the IMG.LY article "How to edit AI-generated designs without regenerating them".

The idea: generate the layers, not the picture. An ad is built from four parts (background, product cutout, headline, logo) that each become their own block in a [CE.SDK](https://img.ly/creative-sdk) scene. The user then edits the headline as text, moves the product, regenerates only the background, and resizes to three formats, with no second generation of the whole image.

Built on the [AI Editor starter kit](https://github.com/imgly/starterkit-ai-editor-react-web) (React, CE.SDK 1.81.1).

## Run it

Prerequisites: Node.js 22 or newer, a Chromium, Firefox or Safari release from the last two years.

```bash
git clone <this repo>
cd editable-ai-ads
npm install
```

Download the CE.SDK engine assets into `public/assets` (fonts, icons, the engine's WebAssembly core):

```bash
curl -O https://cdn.img.ly/packages/imgly/cesdk-js/1.81.1/imgly-assets.zip
unzip imgly-assets.zip -d public/
rm imgly-assets.zip
```

Create `.env` from the example and fill in the two keys:

```bash
cp .env.example .env
```

| Variable | What it is | Without it |
|---|---|---|
| `VITE_CESDK_LICENSE` | CE.SDK license key from the [IMG.LY dashboard](https://img.ly/dashboard) | The editor runs with a watermark |
| `VITE_AI_API_KEY` | IMG.LY AI Gateway key (`sk_...`) from the same dashboard | The "Generate parts" and "Regenerate background" buttons are disabled. "Use sample parts" still works, including real background removal |

Then:

```bash
npm run dev
```

Open http://localhost:5173.

## What to click

The panel on the right follows the article's steps.

1. **Generate the parts.** Fill in product, audience and a background prompt, optionally pick your own product photo, and click "Generate parts". That makes two model calls (background image, headline text) and runs background removal in the browser. Without an AI key, click "Use sample parts" instead. The first run downloads the background removal model, which takes a while.
2. **Compose scene.** The four parts become four named blocks on one page. Click the headline on the canvas and type to change it. Drag the product. Try to move the logo: it is locked.
3. **Swap the logo.** Two approved variants from the brand kit. The user cannot replace the logo with any other image; the app can swap it for another approved one.
4. **Regenerate background.** Enter a new prompt and click the button. One image-to-image call replaces the background block's image. Everything else stays where the user left it.
5. **Resize.** 1:1, 9:16 and 16:9 re-run the layout on the same blocks. The headline reflows because it is text.
6. **Export and save.** PNG or PDF of the current format, all three formats in one go, or the scene as JSON for later edits.

The log at the bottom records each step's time and model calls.

## Where the code is

| File | What it does |
|---|---|
| `src/generate.ts` | Step 1. Background (text to image), product (upload plus background removal), headline (text model), logo (brand kit). |
| `src/scene.ts` | Steps 2 and 3. Turns the parts into blocks, sets what is editable, swaps the logo between approved variants, lays out the page. |
| `src/regenerate-layer.ts` | Step 4. Image-to-image on the background block only. |
| `src/resize.ts` | Step 5. Page resize plus the layout rules. |
| `src/export.ts` | Step 6. PNG, PDF, all formats, scene save. |
| `src/gateway.ts` | Gateway client for generation outside the editor UI. |
| `src/brand.ts` | The brand kit: logo, typeface, headline color. |
| `src/formats.ts` | The three output sizes. |
| `src/app/AdPanel.tsx` | The panel that calls the steps. |
| `src/app/ai-credentials/` | Credential handling from the starter kit. |
| `src/imgly/` | Editor configuration from the starter kit, trimmed to design mode. |

## About the AI key in the browser

For local use the gateway key is handed to the browser through `{ dangerouslyExposeApiKey }`. Do not ship a public build that way. Mint short-lived tokens from a backend and return them from the `ly.img.ai.getToken` action instead; the pattern is in `src/app/ai-credentials/ai-credentials.ts` and in the [gateway provider docs](https://img.ly/docs/cesdk/js/user-interface/ai-integration/gateway-provider-06df22/).

Generated image URLs from the gateway are short-lived. A saved scene that still points at them stops rendering when they expire. A product should re-upload generated images to its own storage before saving; see `uploadMiddleware` in the docs above.

## Sample assets

`public/samples/` holds two Unsplash photos used by the no-key path. `public/brand/logo-dark.png` and `logo-light.png` are placeholder logo variants for a made-up brand.

## License

MIT, same as the starter kit it is built on.
