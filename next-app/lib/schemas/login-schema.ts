import { z } from "zod";

const loginSchema = z.object({
    email: z.string()
        .email({ message: "Enter your valid email address" })
        .min(5, { message: "Enter your valid email address" })
        .max(50, { message: "Enter your valid email address" }),
    password: z.string()
        .min(6, { message: "Password should be atleast 6 characters long" })
        .max(50, { message: "Password cannot exceed 50 characters" })
})

export default loginSchema;