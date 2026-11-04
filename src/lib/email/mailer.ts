import nodemailer from "nodemailer";

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

export function getSmtpConfig() {
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
        fromName = cleanEnv(process.env.NEXT_PUBLIC_APP_NAME) || "CareFlow";
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
        encryption,
    };
}

export function createTransporter() {
    const config = getSmtpConfig();

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        connectionTimeout: 4000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
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
): Promise<SendEmailResult> {
    const config = getSmtpConfig();
    const from = options.from || `"${config.fromName}" <${config.fromAddress}>`;

    try {
        const transporter = createTransporter();
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
