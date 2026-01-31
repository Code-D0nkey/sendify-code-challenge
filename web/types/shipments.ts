export interface Location {
    name: string;
    code: string;
    countryCode: string;
}

export interface TrackingEvent {
    code: string;
    date: string;
    createdAt: string;
    location: Location;
    comment: string;
    recipient: string | null;
    reasons: string[];
}

export interface PackageEvent {
    code: string;
    date: string;
    location: string;
    countryCode: string;
}

export interface Package {
    id: string;
    events: PackageEvent[];
}

export interface Address {
    postalCode: string;
    city: string;
    country: string;
    countryCode: string;
}

export interface Weight {
    value: number;
    unit: string;
}

export interface Volume {
    value: number;
    unit: string;
}

export interface PackageInfo {
    pieces: number;
    weight: Weight;
    volume: Volume;
    dimensions: any[];
    loadingMeters: Weight;
    chargeableWeight: Weight | null;
}

export interface DeliveryDate {
    estimated: string;
    agreed: string | null;
}

export interface ShipmentData {
    sttNumber: string;
    referenceNumbers: string[];
    transportMode: string;
    product: string;
    sender: Address;
    receiver: Address;
    package: PackageInfo;
    deliveryDate: DeliveryDate;
    trackingHistory: TrackingEvent[];
    packages: Package[];
}

export type NormalizedEvent = {
    key: string;
    code: string;
    label: string;
    dateISO: string | null;
    location: string | null;
    reason: string | null;
};
