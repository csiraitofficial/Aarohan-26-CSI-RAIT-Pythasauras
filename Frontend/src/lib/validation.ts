import { z } from "zod";

/* ── Common password blocklist (top 20) ── */
const COMMON_PASSWORDS = new Set([
    "password1234", "123456789012", "qwerty123456",
    "letmein12345", "welcome12345", "admin1234567",
    "iloveyou1234", "monkey1234567", "dragon12345!",
    "master123456", "password!234", "abc123456789",
    "trustno1!234", "sunshine1234", "princess1234",
    "football1234", "shadow123456", "michael12345",
    "passw0rd1234", "1234567890ab",
]);

/* ── Password policy ── */
const passwordSchema = z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")
    .refine((val) => !COMMON_PASSWORDS.has(val.toLowerCase()), {
        message: "This password is too common",
    });

/* ── Login ── */
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
    twoFactorCode: z.string().optional(),
});
export type LoginFormData = z.infer<typeof loginSchema>;

/* ── Registration ── */
export const registrationSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: passwordSchema,
        confirmPassword: z.string(),
        firstName: z.string().min(1, "First name is required").max(50),
        lastName: z.string().min(1, "Last name is required").max(50),
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(30)
            .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
        dateOfBirth: z.string().optional(),
        agreeToTerms: z.literal(true, {
            errorMap: () => ({ message: "You must agree to the terms" }),
        }),
        marketingConsent: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export type RegistrationFormData = z.infer<typeof registrationSchema>;

/* ── Profile ── */
export const profileGeneralSchema = z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    bio: z.string().max(280).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url().or(z.literal("")).optional(),
});

export const profileProfessionalSchema = z.object({
    jobTitle: z.string().max(100).optional(),
    company: z.string().max(100).optional(),
    experience: z.string().optional(),
    skills: z.array(z.string()).max(20).optional(),
    linkedin: z.string().url().or(z.literal("")).optional(),
    github: z.string().url().or(z.literal("")).optional(),
});

/* ── Password change ── */
export const passwordChangeSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

/* ── Password reset request ── */
export const passwordResetSchema = z.object({
    email: z.string().email("Invalid email address"),
});

/* ── Password strength calculator ── */
export function getPasswordStrength(password: string): {
    score: number; // 0–5
    label: string;
    color: string;
} {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#10b981"];

    return { score, label: labels[score]!, color: colors[score]! };
}
