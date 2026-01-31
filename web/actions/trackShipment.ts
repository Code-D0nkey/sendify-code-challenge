"use server";

import { ShipmentData } from "@/types/shipments";
import { searchSchema } from "@/validation/search";

const TRACKER_URL = "http://localhost:4001";

export interface actionResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

export async function trackShipment(
    prevState: actionResponse<ShipmentData | null>,
    formData: FormData,
): Promise<actionResponse<ShipmentData | null>> {
    const raw = formData.get("search");
    const ref = typeof raw === "string" ? raw : "";

    const validatedSearch = searchSchema.safeParse({ search: ref });
    if (!validatedSearch.success) {
        return { success: false, message: "Felaktig inmatning", data: null };
    }

    const url = `${TRACKER_URL}/track?ref=${encodeURIComponent(ref.trim())}`;

    try {
        console.log("FETCHING");

        const res = await fetch(url, { method: "GET", cache: "no-store" });

        if (res.status === 404) {
            return {
                success: false,
                message: "Ingen försändelse hittades",
                data: null,
            };
        }

        if (!res.ok) {
            let message = "Tracker request failed";
            try {
                const body = await res.json();
                message = body?.message ?? body?.error ?? message;
            } catch {}
            return { success: false, message, data: null };
        }

        const json = await res.json();
        return { success: true, message: "OK", data: json.data };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "An error occurred",
            data: null,
        };
    }
}
