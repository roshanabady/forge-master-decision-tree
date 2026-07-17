// Cloudflare Worker: proxies OCR requests from the Forge Master tracker to Azure AI
// Vision's Image Analysis 4.0 "read" feature, so the Azure key never reaches the browser
// (the tracker is a public static site with no backend of its own to hide it in).
//
// Required secrets (set with `wrangler secret put <NAME>`):
//   AZURE_VISION_ENDPOINT  e.g. https://your-resource.cognitiveservices.azure.com
//   AZURE_VISION_KEY       the resource's subscription key
//   SHARED_TOKEN           any string you also paste into the tracker's OCR settings —
//                          stops randoms who find this Worker's URL from burning your
//                          Azure free-tier quota; not real auth, just a quota gate.

const AZURE_API_VERSION = '2024-02-01';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    if (!env.SHARED_TOKEN || request.headers.get('X-Auth-Token') !== env.SHARED_TOKEN) {
      return new Response('Unauthorized', { status: 401, headers: cors });
    }
    if (!env.AZURE_VISION_ENDPOINT || !env.AZURE_VISION_KEY) {
      return new Response('Worker is missing AZURE_VISION_ENDPOINT/AZURE_VISION_KEY secrets', { status: 500, headers: cors });
    }

    const imageBytes = await request.arrayBuffer();
    if (!imageBytes.byteLength) {
      return new Response('Empty request body — expected raw image bytes', { status: 400, headers: cors });
    }

    const endpoint = env.AZURE_VISION_ENDPOINT.replace(/\/+$/, '');
    const azureUrl = `${endpoint}/computervision/imageanalysis:analyze?api-version=${AZURE_API_VERSION}&features=read`;

    let azureRes;
    try {
      azureRes = await fetch(azureUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': env.AZURE_VISION_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBytes,
      });
    } catch (err) {
      return new Response('Could not reach Azure Vision: ' + err.message, { status: 502, headers: cors });
    }

    if (!azureRes.ok) {
      // Forward Azure's status/body for debugging, but never anything that could contain
      // the key (it's a header we send, never something Azure echoes back).
      const body = await azureRes.text();
      return new Response(`Azure Vision returned ${azureRes.status}: ${body.slice(0, 500)}`, {
        status: 502,
        headers: cors,
      });
    }

    const result = await azureRes.json();
    const blocks = (result.readResult && result.readResult.blocks) || [];
    const lines = [];
    for (const block of blocks) {
      for (const line of block.lines || []) {
        if (line.text) lines.push(line.text);
      }
    }

    return new Response(JSON.stringify({ text: lines.join('\n') }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
