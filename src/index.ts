
/**
 * Cloudflare Worker: Apps Script Proxy for WykiesAutomation
 * Routes: wykiesautomation.co.za/api*
 *
 * Features:
 * - Health check at /api/health
 * - Proxies all other /api/* requests to Google Apps Script (exec) with deployment ID
 * - Preserves method, headers, body, and query params
 * - CORS support for apex and www domains
 * - Timeout + optional retry for upstream fetch
 * - Basic structured logging
 */

export interface Env {
  APPS_SCRIPT_DEPLOYMENT_ID: string;
}

const ALLOWED_ORIGINS = new Set<string>([
  "https://wykiesautomation.co.za",
  "https://www.wykiesautomation.co.za",
]);

// Tune these as needed
const UPSTREAM_TIMEOUT_MS = 25000; // Apps Script can be slow; 25s is safe
const ENABLE_RETRY = true;
const RETRY_COUNT = 1; // one retry on network errors/timeouts
const RETRY_DELAY_MS = 300; // small backoff

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Only handle /api route (Worker is routed for /api*, but safeguard anyway)
      if (!url.pathname.startsWith("/api")) {
        return json({ error: "Not Found" }, 404, corsHeaders(request));
      }

      // Health check
      if (url.pathname === "/api/health") {
        return json(
          {
            status: "ok",
            time: new Date().toISOString(),
            deploymentId: env.APPS_SCRIPT_DEPLOYMENT_ID ? "present" : "missing",
          },
          200,
          corsHeaders(request)
        );
      }

      // CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      }

      // Build upstream Apps Script URL
      const upstream = buildAppsScriptUrl(url, env.APPS_SCRIPT_DEPLOYMENT_ID);

      // Prepare upstream request init
      const init = await buildUpstreamInit(request);

      // Fetch with timeout + retry
      const response = await fetchWithTimeoutAndRetry(
        upstream, init, UPSTREAM_TIMEOUT_MS, ENABLE_RETRY ? RETRY_COUNT : 0, RETRY_DELAY_MS
      );

      // Relay response
      const contentType = response.headers.get("Content-Type") || "text/plain";
      const body = await response.text();

      // Structured log
      ctx.waitUntil(
        logEvent("proxy", {
          method: request.method,
          path: url.pathname,
          query: url.search,
          status: response.status,
          upstream: upstream,
        })
      );

      return new Response(body, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          ...corsHeaders(request),
        },
      });
    } catch (err: any) {
      const url = new URL(request.url);
      const message = typeof err?.message === "string" ? err.message : String(err);
      console.error("[worker-error]", { path: url.pathname, message });

      return json(
        {
          error: "Upstream request failed",
          message,
        },
        502,
        corsHeaders(request)
      );
    }
  },
};

/* -------------------------- Helper Functions -------------------------- */

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  } else {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

function buildAppsScriptUrl(workerUrl: URL, deploymentId: string): string {
  const pathAfterApi = workerUrl.pathname.replace(/^\/api\/?/, "");
  const base = `https://script.google.com/macros/s/${deploymentId}/exec`;

  if (!pathAfterApi || pathAfterApi.length === 0) {
    return `${base}${workerUrl.search}`;
  }

  const suffix = encodeURI(pathAfterApi);
  const query = workerUrl.search;
  return `${base}/${suffix}${query}`;
}

async function buildUpstreamInit(request: Request): Promise<RequestInit> {
  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers: filterHeaders(request.headers, ["content-type", "authorization", "accept"]),
  };

  if (!["GET", "HEAD"].includes(method)) {
    init.body = await request.text();
  }

  return init;
}

function filterHeaders(headers: Headers, allowListLower: string[]): HeadersInit {
  const out: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    const k = key.toLowerCase();
    if (allowListLower.includes(k)) {
      out[key] = value;
    }
  }
  return out;
}

async function fetchWithTimeoutAndRetry(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  retries: number,
  retryDelayMs: number
): Promise<Response> {
  let attempt = 0;
  let lastError: any;

  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      const resp = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(t);
      return resp;
    } catch (err: any) {
      lastError = err;
      const isAbort = err?.name === "AbortError";
      const isNetwork = err?.message?.toLowerCase?.().includes("network");
      if (attempt < retries && (isAbort || isNetwork)) {
        await sleep(retryDelayMs);
        attempt++;
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("Unknown upstream failure");
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function logEvent(type: string, data: Record<string, unknown>): Promise<void> {
  console.log(`[${type}]`, JSON.stringify(data));
}

function json(payload: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(extraHeaders || {}),
    },
  });
}
