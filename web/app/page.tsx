"use client";

import Image from "next/image";
import TruckImage from "@/public/truck.jpg";
import { SearchForm } from "@/components/search-form";
import { useRouter, useSearchParams } from "next/navigation";
import {
    startTransition,
    useActionState,
    useEffect,
    useMemo,
    useState,
} from "react";
import { trackShipment } from "@/actions/trackShipment";
import { searchSchema } from "@/validation/search";
import z from "zod";
import Shipment from "@/components/shipment";
import { Button } from "@/components/ui/button";
import { ShipmentData } from "@/types/shipments";
import { FaArrowLeftLong } from "react-icons/fa6";

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchFromUrl = searchParams.get("search") ?? "";

    const [searchState, action, isPending] = useActionState(trackShipment, {
        success: false,
        data: null,
    });

    const [shipment, setShipment] = useState<ShipmentData>();
    // A nonce used to always trigger the fetch upon form submission
    // Covers the edge-case where a user queries a non-existent shipment twice.
    const [submitNonce, setSubmitNonce] = useState(0);

    const searchQuery = useMemo(() => searchFromUrl.trim(), [searchFromUrl]);

    function onSubmit(data: z.infer<typeof searchSchema>) {
        const value = data.search.trim();
        router.push(`.?search=${encodeURIComponent(value)}`);
        setSubmitNonce((n) => n + 1);
    }

    useEffect(() => {
        if (!searchQuery) return;

        const formData = new FormData();
        formData.append("search", searchQuery);

        startTransition(() => {
            action(formData);
        });
    }, [searchQuery, submitNonce, action]);

    useEffect(() => {
        if (searchState.success && searchState.data)
            setShipment(searchState.data);
    }, [searchState]);

    const resetShipment = () => {
        setShipment(undefined);
        router.push("./");
    };

    return (
        <>
            {shipment ? (
                <div className="flex flex-col items-center space-y-4 px-4 py-12 w-full">
                    <div className="w-full max-w-4xl space-y-4">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={resetShipment}
                        >
                            <FaArrowLeftLong />
                            Tillbaka
                        </Button>
                        <Shipment {...shipment} />
                    </div>
                </div>
            ) : (
                <div className="grid min-h-svh lg:grid-cols-2">
                    <div className="flex flex-col gap-4 p-6 md:p-10">
                        <div className="flex flex-1 items-center justify-center">
                            <SearchForm
                                onSubmit={onSubmit}
                                isPending={isPending}
                                searchFromUrl={searchFromUrl}
                                searchState={searchState}
                            />
                        </div>
                    </div>
                    <div className="relative hidden lg:block">
                        <Image
                            className="object-cover"
                            src={TruckImage}
                            alt="Hero image"
                            fill
                            sizes="(max-width: 2000px) 100vw, 50vw"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
