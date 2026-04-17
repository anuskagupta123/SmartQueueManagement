import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "SmartQueue AI <onboarding@resend.dev>";

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0d9488;padding:24px 32px;text-align:center;">
              <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                ⚡ SmartQueue<span style="font-weight:400;">AI</span>
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                SmartQueue AI · Intelligent Virtual Queue Management<br/>
                You received this email because you joined a queue.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTokenJoinedEmail(opts: {
  to: string;
  name: string;
  tokenNumber: string;
  queueName: string;
  location: string;
  position: number;
  estimatedWaitMinutes: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const waitText =
    opts.estimatedWaitMinutes < 60
      ? `${Math.round(opts.estimatedWaitMinutes)} minutes`
      : `${Math.floor(opts.estimatedWaitMinutes / 60)}h ${Math.round(opts.estimatedWaitMinutes % 60)}m`;

  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f172a;">You're in the queue! 🎉</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hi ${opts.name}, you've successfully joined <strong>${opts.queueName}</strong>.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#16a34a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Token Number</p>
          <p style="margin:0;font-size:52px;font-weight:900;color:#0d9488;letter-spacing:-2px;line-height:1.1;">${opts.tokenNumber}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:12px;background:#f8fafc;border-radius:8px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Position</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#0f172a;">#${opts.position}</p>
        </td>
        <td width="8px"></td>
        <td width="50%" style="padding:12px;background:#f8fafc;border-radius:8px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Est. Wait</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#0d9488;">${waitText}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px;background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#64748b;">📍 <strong style="color:#0f172a;">${opts.location}</strong></p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
      We'll send you another email when it's your turn. You can also check your live position anytime in the app.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `✅ Token ${opts.tokenNumber} — You're #${opts.position} in ${opts.queueName}`,
    html: baseTemplate("Queue Confirmation", body),
  });
}

export async function sendTokenCalledEmail(opts: {
  to: string;
  name: string;
  tokenNumber: string;
  queueName: string;
  location: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f172a;">It's your turn! 🔔</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hi ${opts.name}, you've been called at <strong>${opts.queueName}</strong>. Please proceed to the counter now.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:2px solid #fbbf24;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#d97706;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Now Serving</p>
          <p style="margin:0;font-size:60px;font-weight:900;color:#d97706;letter-spacing:-2px;line-height:1.1;">${opts.tokenNumber}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px;background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#64748b;">📍 <strong style="color:#0f172a;">${opts.location}</strong></p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600;">⚠️ Important: If you don't show up promptly, you may be marked as a no-show and lose your place in the queue.</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
      Please bring your token number <strong>${opts.tokenNumber}</strong> and show it at the counter.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `🔔 NOW SERVING ${opts.tokenNumber} — Please come to the counter!`,
    html: baseTemplate("It's Your Turn!", body),
  });
}

export async function sendTokenSkippedEmail(opts: {
  to: string;
  name: string;
  tokenNumber: string;
  queueName: string;
  location: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f172a;">Your token was skipped</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hi ${opts.name}, token <strong>${opts.tokenNumber}</strong> at <strong>${opts.queueName}</strong> was skipped because you weren't present when called.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#dc2626;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Token Skipped</p>
          <p style="margin:0;font-size:52px;font-weight:900;color:#dc2626;letter-spacing:-2px;line-height:1.1;">${opts.tokenNumber}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px;background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#64748b;">📍 <strong style="color:#0f172a;">${opts.location}</strong></p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
      If you'd still like to be served, please visit <strong>${opts.location}</strong> and ask a staff member to re-add you to the queue, or join again from the SmartQueue AI app.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `⚠️ Token ${opts.tokenNumber} was skipped at ${opts.queueName}`,
    html: baseTemplate("Token Skipped", body),
  });
}
