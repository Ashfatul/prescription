import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    simulated?: boolean;
    error?: string;
}

export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth?: { user: string; pass: string };
    fromAddress: string;
    fromName: string;
    encryption?: string;
    enabled?: boolean;
}

/**
 * Clean environment variable values that may be string "null", "undefined", or quotes.
 */
function cleanEnv(val: string | undefined): string | null {
    if (!val) return null;
    const trimmed = val.trim().replace(/^["']|["']$/g, "");
    if (
        trimmed === "" ||
        trimmed.toLowerCase() === "null" ||
        trimmed.toLowerCase() === "undefined"
    ) {
        return null;
    }
    return trimmed;
}

export function getSmtpConfig(): SmtpConfig {
    const host =
        cleanEnv(process.env.MAIL_HOST) ||
        cleanEnv(process.env.SMTP_HOST) ||
        "127.0.0.1";
    const rawPort =
        cleanEnv(process.env.MAIL_PORT) ||
        cleanEnv(process.env.SMTP_PORT) ||
        "2525";
    const port = parseInt(rawPort, 10) || 2525;
    const username =
        cleanEnv(process.env.MAIL_USERNAME) || cleanEnv(process.env.SMTP_USER);
    const password =
        cleanEnv(process.env.MAIL_PASSWORD) || cleanEnv(process.env.SMTP_PASS);
    const encryption =
        cleanEnv(process.env.MAIL_ENCRYPTION) ||
        cleanEnv(process.env.SMTP_SECURE);
    const fromAddress =
        cleanEnv(process.env.MAIL_FROM_ADDRESS) || "hello@example.com";

    let fromName = cleanEnv(process.env.MAIL_FROM_NAME);
    if (!fromName || fromName.includes("${")) {
        fromName = cleanEnv(process.env.NEXT_PUBLIC_APP_NAME) || "Hospital System";
    }

    const secure = encryption === "ssl" || port === 465;

    return {
        host,
        port,
        secure,
        auth:
            username && password
                ? { user: username, pass: password }
                : undefined,
        fromAddress,
        fromName,
        encryption: encryption || undefined,
        enabled: true,
    };
}

/**
 * Resolves SMTP configuration dynamically from database system settings if available,
 * falling back to process.env variables.
 */
export async function getEffectiveSmtpConfig(): Promise<SmtpConfig> {
    try {
        const settings = await db.systemSetting.findMany({
            where: {
                key: {
                    in: [
                        "smtp_enabled",
                        "smtp_host",
                        "smtp_port",
                        "smtp_encryption",
                        "smtp_user",
                        "smtp_pass",
                        "smtp_from_address",
                        "smtp_from_name",
                    ],
                },
            },
        });

        const map = new Map<string, string>();
        for (const s of settings) {
            if (s.value) map.set(s.key, s.value);
        }

        const isExplicitlyDisabled = map.get("smtp_enabled") === "false";
        if (isExplicitlyDisabled) {
            const fallback = getSmtpConfig();
            return {
                ...fallback,
                enabled: false,
            };
        }

        if (map.get("smtp_host")) {
            const host = map.get("smtp_host")!;
            const port = parseInt(map.get("smtp_port") || "587", 10) || 587;
            const encryption = map.get("smtp_encryption") || "tls";
            const username = map.get("smtp_user");
            const password = map.get("smtp_pass");
            const fromAddress = map.get("smtp_from_address") || "hello@example.com";
            const fromName = map.get("smtp_from_name") || "Hospital System";
            const secure = encryption === "ssl" || port === 465;

            return {
                host,
                port,
                secure,
                auth:
                    username && password
                        ? { user: username, pass: password }
                        : undefined,
                fromAddress,
                fromName,
                encryption,
                enabled: true,
            };
        }
    } catch {
        // DB not available or unmigrated; proceed to env fallback
    }

    return getSmtpConfig();
}

export function createTransporter(customConfig?: SmtpConfig) {
    const config = customConfig || getSmtpConfig();

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        connectionTimeout: 6000,
        greetingTimeout: 4000,
        socketTimeout: 8000,
        tls: {
            rejectUnauthorized: false,
        },
    });
}

/**
 * Dispatches an email via SMTP.
 * If SMTP server is unreachable on 127.0.0.1:2525, logs email details to the console
 * and completes safely without crashing or hanging the user flow.
 */
export async function sendMail(
    options: SendEmailOptions,
    customConfig?: SmtpConfig,
): Promise<SendEmailResult> {
    const config = customConfig || (await getEffectiveSmtpConfig());

    if (config.enabled === false) {
        console.log(
            `[SMTP OFFLINE/DISABLED] Outgoing email to <${options.to}> safely simulated (offline mode).`,
        );
        return {
            success: true,
            simulated: true,
            error: "SMTP delivery is offline or disabled.",
        };
    }

    const from = options.from || `"${config.fromName}" <${config.fromAddress}>`;

    try {
        const transporter = createTransporter(config);
        const info = await transporter.sendMail({
            from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.subject,
        });

        console.log(
            `[SMTP SUCCESS] Email delivered to <${options.to}> via ${config.host}:${config.port} (Message ID: ${info.messageId})`,
        );
        return {
            success: true,
            messageId: info.messageId,
            simulated: false,
        };
    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(
            `[SMTP DISPATCH NOTICE] Could not connect to SMTP server at ${config.host}:${config.port} (${errMsg}). Falling back to safe server log.`,
        );
        console.log(
            `========================= OUTGOING EMAIL LOG =========================`,
        );
        console.log(`TO: ${options.to}`);
        console.log(`FROM: ${from}`);
        console.log(`SUBJECT: ${options.subject}`);
        console.log(`CONTENT (PREVIEW):`);
        console.log(options.text || options.html.slice(0, 300));
        console.log(
            `=====================================================================`,
        );

        return {
            success: true,
            simulated: true,
            error: errMsg,
        };
    }
}
