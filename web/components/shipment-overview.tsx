import { cn } from "@/lib/utils";
import { TrackingEvent } from "@/types/shipments";
import {
    CheckCircle2,
    ClipboardList,
    Package,
    Truck,
    MapPin,
} from "lucide-react";

type ShipmentStatus =
    | "DELIVERED"
    | "OUT_FOR_DELIVERY"
    | "IN_TRANSIT"
    | "PICKED_UP"
    | "BOOKED"
    | "UNKNOWN";

const CODE_TO_STATUS: Record<string, ShipmentStatus> = {
    DLV: "DELIVERED",
    DOT: "OUT_FOR_DELIVERY",
    MAN: "IN_TRANSIT",
    ENM: "IN_TRANSIT",
    COL: "PICKED_UP",
    ENT: "BOOKED",
};

function resolveStatus(
    trackingHistory?: TrackingEvent[] | null,
): ShipmentStatus {
    const events = Array.isArray(trackingHistory) ? trackingHistory : [];
    if (!events.length) return "UNKNOWN";

    const latest = latestEvent(events);
    if (!latest) return "UNKNOWN";

    const code = (latest.code ?? "").trim().toUpperCase();
    return (
        CODE_TO_STATUS[code] ??
        ((latest.comment ?? "").toLowerCase().includes("delivered")
            ? "DELIVERED"
            : "UNKNOWN")
    );
}

function latestEvent(events: TrackingEvent[]): TrackingEvent | undefined {
    // pick max timestamp among date/createdAt; fallback to last if none parse
    let best = events[events.length - 1];
    let bestTs =
        isoToDate(best.date) ??
        isoToDate(best.createdAt) ??
        Number.NEGATIVE_INFINITY;
    let anyParsed = bestTs !== Number.NEGATIVE_INFINITY;

    for (const e of events) {
        const t = isoToDate(e.date) ?? isoToDate(e.createdAt);
        if (t == null) continue;
        anyParsed = true;
        if (t > bestTs) {
            bestTs = t;
            best = e;
        }
    }

    return anyParsed ? best : events[events.length - 1];
}

function isoToDate(iso?: string | null): number | null {
    if (!iso) return null;
    const n = Date.parse(iso);
    return Number.isFinite(n) ? n : null;
}

function statusMessage(status: ShipmentStatus) {
    switch (status) {
        case "DELIVERED":
            return "Your shipment is delivered!";
        case "OUT_FOR_DELIVERY":
            return "Your shipment is out for delivery!";
        case "IN_TRANSIT":
            return "Your shipment is on the way!";
        case "PICKED_UP":
            return "Your shipment has been picked up!";
        case "BOOKED":
            return "Your shipment is booked!";
        default:
            return "We’re tracking your shipment.";
    }
}

const steps = [
    { key: "BOOKED", label: "Booked", Icon: ClipboardList },
    { key: "IN_TRANSIT", label: "In transportation", Icon: Truck },
    { key: "AT_CENTER", label: "At dispatch center", Icon: MapPin },
    { key: "OUT_FOR_DELIVERY", label: "In delivery", Icon: Package },
    { key: "DELIVERED", label: "Delivered", Icon: CheckCircle2 },
] as const;

function activeStepIndex(
    status: ShipmentStatus,
    trackingHistory: TrackingEvent[],
) {
    if (status === "DELIVERED") return 4;
    if (status === "OUT_FOR_DELIVERY") return 3;
    if (status === "IN_TRANSIT") {
        const hasArrivedScan = trackingHistory?.some(
            (e) => (e.code ?? "").toUpperCase() === "ENM",
        );
        return hasArrivedScan ? 2 : 1;
    }
    if (status === "PICKED_UP" || status === "BOOKED") return 0;
    return 0;
}

const ShipmentOverview = ({
    trackingHistory,
}: {
    trackingHistory: TrackingEvent[];
}) => {
    if (!trackingHistory) return null;

    const status = resolveStatus(trackingHistory);
    const msg = statusMessage(status);
    const idx = activeStepIndex(status, trackingHistory);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-6xl font-extralight">Hello!</h1>
                <h2 className="text-xl font-bold">{msg}</h2>
            </div>
            <ol className="flex flex-wrap justify-between gap-3">
                {steps.map((s, i) => {
                    const active = i === idx;
                    const done = i < idx;
                    const Icon = s.Icon;

                    return (
                        <li
                            key={s.key}
                            className={cn(
                                "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
                                done && "opacity-70",
                                active && "border-foreground",
                            )}
                            aria-current={active ? "step" : undefined}
                        >
                            <Icon
                                className={cn("h-4 w-4", active && "scale-110")}
                            />
                            <span className={cn(active && "font-semibold")}>
                                {s.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default ShipmentOverview;
