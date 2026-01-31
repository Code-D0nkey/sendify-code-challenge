import { NormalizedEvent } from "@/types/shipments";

export const EVENT_LABELS: Record<string, string> = {
    ENT: "Booked",
    COL: "Collected",
    ENM: "Arrived",
    MAN: "Departed",
    DOT: "Out for delivery",
    DLV: "Delivered",
};

export function toLabel(code?: string | null, fallback?: string | null) {
    const c = (code ?? "").trim();
    if (c && EVENT_LABELS[c]) return EVENT_LABELS[c];

    if (fallback && fallback.trim()) return fallback.trim();
    return c || "—";
}

function formatDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;

    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}/${mm}/${dd}, ${hh}:${min}`;
}

const TrackingHistoryTable = ({
    title,
    events,
}: {
    title?: string;
    events: NormalizedEvent[];
}) => {
    const hasReason = events.some((e) => (e.reason ?? "").trim().length > 0);

    return (
        <div className="space-y-3">
            {title ? <h3 className="font-semibold text-lg">{title}</h3> : null}
            <div className="overflow-x-auto">
                <table className="w-full text-sm ">
                    <thead className="text-muted-foreground">
                        <tr className="border-b">
                            <th className="py-2 text-left">Event</th>
                            <th className="py-2 text-left">Date</th>
                            <th className="py-2 text-left">Location</th>
                        </tr>
                    </thead>

                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={hasReason ? 5 : 4}
                                    className="py-4 text-muted-foreground"
                                >
                                    No tracking events available.
                                </td>
                            </tr>
                        ) : (
                            events.map((e, idx) => (
                                <tr
                                    key={e.key}
                                    className={`border-b last:border-b-0 ${idx === 3 ? "bg-muted/40" : ""}`}
                                >
                                    <td className="py-2 font-medium">
                                        {e.label}
                                    </td>
                                    <td className="py-2">
                                        {formatDate(e.dateISO)}
                                    </td>
                                    <td className="py-2">
                                        {e.location ?? "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrackingHistoryTable;
