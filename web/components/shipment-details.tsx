import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

type Shipment = {
    sender?: {
        postalCode?: string;
        city?: string;
        country?: string;
    };
    receiver?: {
        postalCode?: string;
        city?: string;
        country?: string;
    };
    package?: {
        pieces?: number | null;
        weight?: { value?: number | null; unit?: string | null } | null;
        volume?: { value?: number | null; unit?: string | null } | null;
        loadingMeters?: { value?: number | null; unit?: string | null } | null;
        dimensions?: any[];
    };
};

const ShipmentDetailsContent = ({ shipment }: { shipment: Shipment }) => {
    const sender = shipment.sender;
    const receiver = shipment.receiver;
    const pkg = shipment.package;

    const row = (label: string, value?: string | number | null) => (
        <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value ?? "—"}</span>
        </div>
    );

    const measure = (value?: number | null, unit?: string | null) =>
        value != null ? `${value} ${unit ?? ""}` : "—";

    return (
        <div className="flex justify-between">
            {/* Sender */}
            <div className="flex ">
                <section className="sm:w-42">
                    <h3 className="mb-2 font-semibold">Sender</h3>
                    {row("Postal code", sender?.postalCode)}
                    {row("City", sender?.city)}
                    {row("Country", sender?.country)}
                </section>
            </div>
            {/* Receiver */}
            <section className="sm:w-42">
                <h3 className="mb-2 font-semibold">Receiver</h3>
                {row("Postal code", receiver?.postalCode)}
                {row("City", receiver?.city)}
                {row("Country", receiver?.country)}
            </section>
            <Separator orientation="vertical" />

            {/* Package */}
            <section className="sm:w-42">
                <h3 className="mb-2 font-semibold">Package</h3>
                {row("Pieces", pkg?.pieces)}
                {row("Weight", measure(pkg?.weight?.value, pkg?.weight?.unit))}
                {row("Volume", measure(pkg?.volume?.value, pkg?.volume?.unit))}
                {row(
                    "Loading meters",
                    measure(
                        pkg?.loadingMeters?.value,
                        pkg?.loadingMeters?.unit,
                    ),
                )}
                {row(
                    "Dimensions",
                    pkg?.dimensions && pkg.dimensions.length > 0
                        ? "Available"
                        : "—",
                )}
            </section>
        </div>
    );
};

const ShipmentDetails = ({ shipment }: { shipment: Shipment }) => {
    return (
        <Card className="p-0">
            <CardContent>
                <Accordion
                    type="single"
                    collapsible
                    defaultValue="shipment-details"
                >
                    <AccordionItem value="shipment-details">
                        <AccordionTrigger className="cursor-pointer font-bold text-xl">
                            Shipment Details
                        </AccordionTrigger>
                        <AccordionContent>
                            <ShipmentDetailsContent shipment={shipment} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default ShipmentDetails;
