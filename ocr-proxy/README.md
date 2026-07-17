# OCR proxy (optional)

The tracker's Scan Gear feature defaults to Tesseract, which runs free in your browser but
regularly misses small text (item level badges especially). This is an optional Cloudflare
Worker that swaps in Azure AI Vision's OCR instead — Azure is far more accurate on small
stylized text, and its free tier (5,000 scans/month) is more than enough for personal use.

The tracker is a public static site with no backend, so the Azure key can't live in the
page's JS — anyone viewing the page source (or the public git history) would see it. This
Worker sits in between: the tracker calls the Worker, the Worker calls Azure with the key,
and the key never reaches the browser.

You don't need this to use the tracker — it's entirely optional. Skip it and Tesseract keeps
working as the default.

## 1. Create an Azure AI Vision resource

1. In the [Azure Portal](https://portal.azure.com), create a new **Computer Vision** (or
   "Azure AI Vision") resource. The free **F0** tier works (5,000 transactions/month).
2. Pick a region that supports Image Analysis 4.0 — most major regions do (e.g. East US,
   West Europe, West US 2). Check the
   [region availability table](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-image-analysis#region-availability)
   if unsure.
3. Once created, open the resource's **Keys and Endpoint** page. You need:
   - **KEY 1** (or KEY 2)
   - **Endpoint** (looks like `https://your-resource-name.cognitiveservices.azure.com`)

## 2. Deploy the Worker

You need a (free) [Cloudflare account](https://dash.cloudflare.com/sign-up) and the
`wrangler` CLI (`npm install -g wrangler`, or `npx wrangler` for one-off use).

```bash
cd ocr-proxy
npx wrangler login          # opens a browser to authorize
npx wrangler secret put AZURE_VISION_ENDPOINT   # paste the endpoint from step 1
npx wrangler secret put AZURE_VISION_KEY        # paste KEY 1 from step 1
npx wrangler secret put SHARED_TOKEN            # make up any random string — this is
                                                  # NOT your Azure key, just a lightweight
                                                  # gate so randoms who find your Worker's
                                                  # URL can't burn your free-tier quota
npx wrangler deploy
```

`wrangler deploy` prints the Worker's URL, something like
`https://forge-master-ocr-proxy.<your-subdomain>.workers.dev`.

## 3. Point the tracker at it

In the tracker, open **Scan Gear** → click the small **"OCR engine: Tesseract (built-in)"**
link at the bottom of the capture screen → paste:
- **Proxy URL**: the Worker URL from step 2
- **Shared token**: the same random string you set as `SHARED_TOKEN`

Save. Scans now route through Azure. If the Worker is ever unreachable (wrong URL, Cloudflare
outage, quota exceeded), the tracker automatically falls back to Tesseract for that scan
rather than failing outright.

## Notes

- The `SHARED_TOKEN` is stored in your browser's IndexedDB (same place the rest of the
  tracker's data lives) — never committed to git, never sent anywhere but your own Worker.
- Nothing in this `ocr-proxy/` folder contains real secrets — they're only ever set via
  `wrangler secret put`, which stores them in Cloudflare's encrypted secret store, not in
  this repo.
- To roll back to Tesseract entirely, clear the Proxy URL field in OCR engine settings.
