import { z } from "zod";
export const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export type SignUpFromValues = z.infer<typeof signUpSchema>;


export const signInSchema = z.object({
  email: z.string().email({ message: "Email address Required" }),
  password: z
    .string()
    .min(6, { message: "Password Required" }),
});

export type SignInFromValues = z.infer<typeof signInSchema>;

export const codeSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }),
});

export type CodeFromValues = z.infer<typeof codeSchema>;
