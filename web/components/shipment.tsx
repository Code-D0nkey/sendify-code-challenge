import ShipmentOverview from "./shipment-overview";
import ShipmentDetails from "./shipment-details";
import ShipmentStatusHistory from "./shipment-status-history";
import { ShipmentData } from "@/types/shipments";
import PackageEventHistory from "./package-event-history";

const Shipment = (shipment: ShipmentData) => {
    return (
        <>
            <ShipmentOverview trackingHistory={shipment.trackingHistory} />
            <ShipmentDetails shipment={shipment} />
            <ShipmentStatusHistory shipment={shipment} />
            <PackageEventHistory shipment={shipment} />
        </>
    );
};

export default Shipment;
