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

    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(parsedUrl.origin, {
            method: 'HEAD',
            signal: controller.signal,
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; StatusBot/1.0)'
            }
        })

        clearTimeout(timer)

        // Any HTTP response (200, 301, 403, 404, 500…) means the server is reachable
        return NextResponse.json({ status: 'online', code: response.status })
    } catch {
        return NextResponse.json({ status: 'offline' })
    }
}
