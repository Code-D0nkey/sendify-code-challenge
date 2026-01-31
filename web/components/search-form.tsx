"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaArrowRightLong } from "react-icons/fa6";
import { searchSchema } from "@/validation/search";
import { useEffect } from "react";
import { actionResponse } from "@/actions/trackShipment";
import { Spinner } from "./ui/spinner";
import { ShipmentData } from "@/types/shipments";

interface SearchFormProps {
    onSubmit: (data: z.infer<typeof searchSchema>) => void;
    isPending: boolean;
    searchFromUrl: string;
    searchState: actionResponse<ShipmentData | null>;
}

export function SearchForm({
    onSubmit,
    isPending,
    searchFromUrl,
    searchState,
}: SearchFormProps) {
    const form = useForm<z.infer<typeof searchSchema>>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: searchFromUrl,
        },
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.log("Form errors:", form.formState.errors);
        }
    }, [form.formState.errors]);

    // FORM ERROR HANDLING SERVER SIDE
    useEffect(() => {
        console.log(searchState);

        if (!searchState.success && searchState.message) {
            form.setError("search", { message: searchState.message });
        }
    }, [searchState]);

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Spåra försändelse</CardTitle>
                <CardDescription>
                    Ange din försändelses referensnummer i fältet nedan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="search"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-title">
                                        Referensnummer
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-demo-title"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Ange ditt referensnummer"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                    <FieldDescription>
                                        Referensnumret är 10 siffor.
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button
                        type="submit"
                        form="form-rhf-demo"
                        className="w-full cursor-pointer"
                        disabled={isPending}
                    >
                        Sök
                        {isPending ? <Spinner /> : <FaArrowRightLong />}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
