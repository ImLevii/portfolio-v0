import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
        parsedUrl = new URL(url)
    } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Only allow http/https (SSRF protection)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: "Invalid protocol" }, { status: 400 })
    }

    // Block private IP ranges (SSRF protection)
    const hostname = parsedUrl.hostname
    if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('169.254.') ||
        hostname === '0.0.0.0' ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    ) {
        return NextResponse.json({ error: "Private address not allowed" }, { status: 400 })
    }

    // HEAD is cheapest, but some servers drop it, so fall back to GET before calling a site offline
    const result = (await ping(parsedUrl.origin, 'HEAD')) ?? (await ping(parsedUrl.origin, 'GET'))

    // Let the CDN share results briefly so every homepage view doesn't re-ping the sites
    const headers = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

    // Any HTTP response (200, 301, 403, 404, 500…) means the server is reachable
    return result
        ? NextResponse.json({ status: 'online', code: result.status }, { headers })
        : NextResponse.json({ status: 'offline' }, { headers })
}

// Must not start with "Mozilla/": bot-protection layers (e.g. SiteGround's) drop connections from
// non-browser clients that claim to be a browser, which made live sites show as offline.
const USER_AGENT = 'levik.dev-status/1.0 (+https://levik.dev)'

/** Returns the response status, or null if the request failed (DNS, refused, reset, TLS, timeout). */
async function ping(url: string, method: 'HEAD' | 'GET'): Promise<{ status: number } | null> {
    try {
        const response = await fetch(url, {
            method,
            redirect: 'follow',
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': USER_AGENT },
        })
        // Only the status matters; don't download the page body
        await response.body?.cancel().catch(() => {})
        return { status: response.status }
    } catch {
        return null
    }
}
