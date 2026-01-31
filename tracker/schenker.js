import { chromium } from "playwright";

const TRACKING_URL =
    "https://www.dbschenker.com/app/tracking-public/?language_region=en-US_US";

export function normalize(details) {
    const sender =
        details?.location?.collectFrom ??
        details?.location?.shipperPlace ??
        null;
    const receiver =
        details?.location?.deliverTo ??
        details?.location?.consigneePlace ??
        null;

    return {
        sttNumber: details?.sttNumber ?? null,
        referenceNumbers:
            details?.references?.waybillAndConsignementNumbers ?? [],
        transportMode: details?.transportMode ?? null,
        product: details?.product ?? null,

        sender: sender
            ? {
                  postalCode: sender.postCode ?? null,
                  city: sender.city ?? null,
                  country: sender.country ?? null,
                  countryCode: sender.countryCode ?? null,
              }
            : null,

        receiver: receiver
            ? {
                  postalCode: receiver.postCode ?? null,
                  city: receiver.city ?? null,
                  country: receiver.country ?? null,
                  countryCode: receiver.countryCode ?? null,
              }
            : null,

        package: {
            pieces: details?.goods?.pieces ?? null,
            weight: details?.goods?.weight ?? null,
            volume: details?.goods?.volume ?? null,
            dimensions: details?.goods?.dimensions ?? [],
            loadingMeters: details?.goods?.loadingMeters ?? null,
            chargeableWeight: details?.goods?.chargeableWeight ?? null,
        },

        deliveryDate: {
            estimated: details?.deliveryDate?.estimated ?? null,
            agreed: details?.deliveryDate?.agreed ?? null,
        },

        trackingHistory: (details?.events ?? []).map((e) => ({
            code: e.code ?? null,
            date: e.date ?? null,
            createdAt: e.createdAt ?? null,
            location: {
                name: e.location?.name ?? null,
                code: e.location?.code ?? null,
                countryCode: e.location?.countryCode ?? null,
            },
            comment: e.comment ?? null,
            recipient: e.recipient ?? null,
            reasons: e.reasons ?? [],
        })),

        packages: (details?.packages ?? []).map((p) => ({
            id: p.id ?? null,
            events: (p.events ?? []).map((ev) => ({
                code: ev.code ?? null,
                date: ev.date ?? null,
                location: ev.location ?? null,
                countryCode: ev.countryCode ?? null,
            })),
        })),
    };
}

/**
 * Get the actual tracking details.
 */
async function waitForTrackingDetails(page, timeoutMs) {
    const response = await page.waitForResponse(
        async (resp) => {
            try {
                if (!resp.ok()) return false;

                const url = resp.url();
                if (
                    !url.includes(
                        "/nges-portal/api/public/tracking-public/shipments/",
                    )
                )
                    return false;
                if (url.includes("?query=")) return false;

                const ct = (resp.headers()["content-type"] || "").toLowerCase();
                if (!ct.includes("application/json")) return false;

                const json = await resp.json();
                return !!json?.sttNumber && Array.isArray(json?.events);
            } catch {
                return false;
            }
        },
        { timeout: timeoutMs },
    );

    return await response.json();
}

/**
 * Wait for the initial search result to determine if shipment exists.
 */
async function waitForSearchResult(page, timeoutMs) {
    const response = await page.waitForResponse(
        (resp) => {
            const url = resp.url();

            const isWrongUrl = !url.includes(
                "/nges-portal/api/public/tracking-public/shipments?query=",
            );

            if (isWrongUrl) return false;

            // Ignore the 429 we get on each request
            if (resp.status() === 429) return false;

            //console.log("RETURNING STATUS: ", resp.status());

            return true; // accept other status such as 200, 404, 400, etc.
        },
        { timeout: timeoutMs },
    );

    await response.finished();

    const ct = (response.headers()["content-type"] || "").toLowerCase();
    const text = await response.text();

    if (!ct.includes("application/json") || !text.trim()) {
        throw new Error(
            `Expected JSON but got ${response.status()} content-type=${ct} bodyLen=${text.length}`,
        );
    }

    const body = JSON.parse(text);

    if (response.status() === 404) {
        const err = new Error(body?.message ?? "Shipment not found");
        err.code = "NOT_FOUND";
        err.httpStatus = 404;

        throw err;
    }

    if (!response.ok()) {
        throw new Error(
            `Search failed (${response.status()}): ${body?.message ?? "Unknown error"}`,
        );
    }

    return body;
}

/**
 * Scrape the tracking info from DB Schenker public tracking site.
 * Return normalized data.
 * @param {string} refNumber
 * @param {{ headless?: boolean, maxAttempts?: number }} [options]
 */
export async function getTracking(refNumber, options = {}) {
    const headless =
        typeof options.headless === "boolean" ? options.headless : false;

    const maxAttempts =
        typeof options.maxAttempts === "number" ? options.maxAttempts : 3;

    const browser = await chromium.launch({ headless });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    const url = `${TRACKING_URL}&refNumber=${encodeURIComponent(refNumber)}`;

    let detailsPayload = null;

    try {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await page.goto(url, {
                    waitUntil: "domcontentloaded",
                    timeout: 30000,
                });
                // 1) Wait for the "search" payload first
                const searchPayload = await waitForSearchResult(page, 1500);

                // 2) Treat no results as a 404
                if (
                    searchPayload &&
                    Array.isArray(searchPayload.result) &&
                    searchPayload.result.length === 0
                ) {
                    const err = new Error("Tracking reference not found");
                    err.code = "NOT_FOUND";
                    throw err;
                }

                // 3) Otherwise wait for the details payload
                detailsPayload = await waitForTrackingDetails(page, 30000);
                break;
            } catch (e) {
                if (e?.code === "NOT_FOUND") throw e;

                if (attempt === maxAttempts) throw e;
                await page.waitForTimeout(1500 * attempt);
            }
        }
    } finally {
        await browser.close();
    }

    if (!detailsPayload?.sttNumber || !Array.isArray(detailsPayload?.events)) {
        throw new Error(
            "Captured JSON does not match expected tracking schema (blocked, rate-limited, or site changed).",
        );
    }

    return normalize(detailsPayload);
}
