import cors from "cors";
import express from "express";
import { getTracking } from "./schenker.js";

const app = express();
app.use(cors());

const PORT = 4001;

// Simple cache + inflight dedupe
const cache = new Map(); // ref -> { data, expiresAt }
const inflight = new Map(); // ref -> Promise
const TTL_MS = 60_000;

function getCached(ref) {
    const e = cache.get(ref);
    if (!e) return null;
    if (Date.now() > e.expiresAt) {
        cache.delete(ref);
        return null;
    }
    return e.data;
}

app.get("/track", async (req, res) => {
    const ref = String(req.query.ref || "").trim();
    if (!ref) return res.status(400).json({ error: "Missing ref" });

    const cached = getCached(ref);
    if (cached) return res.json({ source: "cache", data: cached });

    if (inflight.has(ref)) {
        try {
            const data = await inflight.get(ref);
            return res.json({ source: "deduped", data });
        } catch (e) {
            if (e.code === "NOT_FOUND") {
                return res
                    .status(404)
                    .json({ error: "Not found", message: e.message });
            }
            return res
                .status(502)
                .json({ error: "Tracking failed", message: e.message });
        }
    }

    const promise = getTracking(ref, { headless: true }).then((data) => {
        cache.set(ref, { data, expiresAt: Date.now() + TTL_MS });
        return data;
    });

    inflight.set(ref, promise);

    try {
        const data = await promise;
        res.json({ source: "live", data });
    } catch (e) {
        if (e?.code === "NOT_FOUND") {
            res.status(404).json({
                error: "Not found",
                message: String(e?.message || e),
            });
        } else {
            res.status(502).json({
                error: "Tracking failed",
                message: String(e?.message || e),
            });
        }
    } finally {
        inflight.delete(ref);
    }
});

app.listen(PORT, () => {
    console.log(`Tracker server listening on http://localhost:${PORT}`);
});
