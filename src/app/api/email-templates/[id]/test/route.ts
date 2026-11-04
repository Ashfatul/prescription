import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import {
    getEmailTemplate,
    interpolateVariables,
} from "@/features/email-templates/email-template.service";
import { sendMail, getSmtpConfig } from "@/lib/email/mailer";
import { AppError } from "@/lib/errors";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    return withErrorHandling(req, async () => {
        await requireUser(req, [RoleName.SUPER_ADMIN]);
        const { id } = await context.params;
        const body = await req.json();
        const recipient = body.recipientEmail?.trim();

        if (!recipient || !recipient.includes("@")) {
            throw new AppError(
                "A valid recipient email address is required.",
                400,
            );
        }

        const template = await getEmailTemplate(id);
        if (!template) {
            throw new AppError("Template not found", 404);
        }

        const appName = process.env.NEXT_PUBLIC_APP_NAME || "CareFlow";
        const smtpConfig = getSmtpConfig();

        const mockVariables: Record<string, string> = {
            userName: "Dr. Jane Test",
            userEmail: recipient,
            appName,
            supportEmail: smtpConfig.fromAddress,
            verifyUrl: `http://localhost:3000/auth/verify-email?token=SAMPLE_TEST_TOKEN`,
            resetUrl: `http://localhost:3000/auth/reset-password?token=SAMPLE_RESET_TOKEN`,
            clinicName: "CareFlow",
            doctorName: "Dr. Jane Test",
            patientName: "John Doe",
            prescriptionUrl: `http://localhost:3000/prescriptions/sample-preview/print`,
            serialNumber: "42",
            appointmentDate: "Tomorrow at 10:00 AM",
            token: "SAMPLE_SECURITY_TOKEN",
            dashboardUrl: "http://localhost:3000/dashboard",
            planName: "Professional Polyclinic",
        };

        const subject = `[TEST] ${interpolateVariables(template.subject, mockVariables)}`;
        const html = interpolateVariables(template.bodyHtml, mockVariables);
        const text = template.bodyText
            ? interpolateVariables(template.bodyText, mockVariables)
            : undefined;

        const result = await sendMail({
            to: recipient,
            subject,
            html,
            text,
        });

        if (result.simulated) {
            return ok({
                success: true,
                message: `SMTP Host ${smtpConfig.host}:${smtpConfig.port} unreachable; test email was safely simulated & logged to server console.`,
                details: result,
            });
        }

        return ok({
            success: true,
            message: `Test email successfully dispatched to ${recipient} via SMTP (${smtpConfig.host}:${smtpConfig.port}).`,
            details: result,
        });
    });
}
