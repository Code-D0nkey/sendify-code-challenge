import * as z from "zod";

export const searchSchema = z.object({
    search: z
        .string()
        .regex(/^\d{10}$/, "Referensnumret måste vara exakt 10 siffror."),
});
