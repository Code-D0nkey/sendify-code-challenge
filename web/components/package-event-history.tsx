import { NormalizedEvent, PackageEvent, ShipmentData } from "@/types/shipments";
import { Card, CardContent } from "./ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import TrackingHistoryTable, { toLabel } from "./tracking-history-table";

function normalizePackageEvents(
    events: PackageEvent[] = [],
    packageId: string,
): NormalizedEvent[] {
    return [...events]
        .filter(Boolean)
        .sort((a, b) => (a?.date ?? "").localeCompare(b?.date ?? ""))
        .map((e, idx) => ({
            key: `${packageId}-${e.code ?? "evt"}-${e.date ?? idx}-${idx}`,
            code: (e.code ?? "").trim(),
            label: toLabel(e.code, null),
            dateISO: e.date ?? null,
            location: e.location ?? null,
            reason: null,
        }));
}

const PackageEventHistory = ({ shipment }: { shipment: ShipmentData }) => {
    const packages = shipment.packages ?? [];

    return (
        <Card className="p-0">
            <CardContent>
                <Accordion
                    type="single"
                    collapsible
                    defaultValue="shipment-history"
                >
                    {packages.length > 0 ? (
                        <AccordionItem value="package-history">
                            <AccordionTrigger className="cursor-pointer font-bold text-xl">
                                Package Event History
                            </AccordionTrigger>
                            <AccordionContent className="space-y-6">
                                {packages.map((p, idx) => {
                                    const id = p.id ?? `package-${idx + 1}`;
                                    const evts = normalizePackageEvents(
                                        p.events ?? [],
                                        id,
                                    );
                                    return (
                                        <div
                                            key={id}
                                            className="rounded-xl border p-4"
                                        >
                                            <TrackingHistoryTable
                                                title={`Package ${idx + 1} • ${id}`}
                                                events={evts}
                                            />
                                        </div>
                                    );
                                })}
                            </AccordionContent>
                        </AccordionItem>
                    ) : null}
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default PackageEventHistory;
