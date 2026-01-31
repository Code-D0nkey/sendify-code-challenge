import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "./ui/card";
import {
    NormalizedEvent,
    ShipmentData,
    TrackingEvent,
} from "@/types/shipments";
import TrackingHistoryTable, {
    EVENT_LABELS,
    toLabel,
} from "./tracking-history-table";

function normalizeShipmentHistory(
    events: TrackingEvent[] = [],
): NormalizedEvent[] {
    return [...events]
        .filter(Boolean)
        .sort((a, b) => (a?.date ?? "").localeCompare(b?.date ?? ""))
        .map((e, idx) => ({
            key: `${e.code ?? "evt"}-${e.date ?? idx}-${idx}`,
            code: (e.code ?? "").trim(),
            label: toLabel(e.code, e.comment ?? null),
            dateISO: e.date ?? e.createdAt ?? null,
            location: e.location?.name ?? null,
            reason:
                (e.reasons && e.reasons.length > 0
                    ? e.reasons.join(", ")
                    : null) ??
                (e.comment && !EVENT_LABELS[(e.code ?? "").trim()]
                    ? e.comment
                    : null) ??
                null,
        }));
}

const ShipmentStatusHistory = ({ shipment }: { shipment: ShipmentData }) => {
    const shipmentEvents = normalizeShipmentHistory(
        shipment.trackingHistory ?? [],
    );

    return (
        <Card className="p-0">
            <CardContent>
                <Accordion type="single" collapsible>
                    <AccordionItem value="shipment-history">
                        <AccordionTrigger className="cursor-pointer font-bold text-xl">
                            Shipment Status History
                        </AccordionTrigger>
                        <AccordionContent>
                            <TrackingHistoryTable events={shipmentEvents} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default ShipmentStatusHistory;
