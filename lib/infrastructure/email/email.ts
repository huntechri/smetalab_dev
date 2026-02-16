import { Resend } from 'resend';
import { getBaseUrl } from '@/lib/utils/url';

// Email from address - use your verified domain or Resend's test address
const FROM_EMAIL = process.env.EMAIL_FROM || 'Smetalab <onboarding@resend.dev>';
const INVITATION_BASE_URL_FALLBACK = 'https://smetalabv3.vercel.app';

interface SendInvitationEmailParams {
  to: string;
  teamName: string;
  role: string;
  inviteId: number;
  inviterEmail?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  estimator: 'Сметчик',
  manager: 'Менеджер',
};

export async function sendInvitationEmail({
  to,
  teamName,
  role,
  inviteId,
  inviterEmail,
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured',
    };
  }

  const resend = new Resend(apiKey);
  const resolvedBaseUrl = process.env.BASE_URL || getBaseUrl();
  const baseUrl = resolvedBaseUrl.includes('localhost')
    ? INVITATION_BASE_URL_FALLBACK
    : resolvedBaseUrl;
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const inviteUrl = `${normalizedBaseUrl}/invitations?inviteId=${inviteId}`;
  const roleLabel = ROLE_LABELS[role] || role;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Приглашение в команду "${teamName}" — Smetalab`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Приглашение в команду</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 480px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px;">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
                  📐 Smetalab
                </h1>
              </div>

              <!-- Content -->
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">
                Вас пригласили в команду
              </h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b; text-align: center;">
                ${inviterEmail ? `<strong>${inviterEmail}</strong> приглашает вас` : 'Вас приглашают'} 
                присоединиться к команде <strong>"${teamName}"</strong> в качестве <strong>${roleLabel}</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${inviteUrl}" 
                   style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                  Принять приглашение
                </a>
              </div>

              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #71717a; text-align: center;">
                Или скопируйте эту ссылку в браузер:<br>
                <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">

              <!-- Footer -->
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                Если вы не ожидали это письмо, просто проигнорируйте его.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin-top: 24px; font-size: 12px; color: #a1a1aa;">
          © ${new Date().getFullYear()} Smetalab. Все права защищены.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
Приглашение в команду "${teamName}"

${inviterEmail ? `${inviterEmail} приглашает вас` : 'Вас приглашают'} присоединиться к команде "${teamName}" в качестве ${roleLabel}.

Для принятия приглашения перейдите по ссылке:
${inviteUrl}

Если вы не ожидали это письмо, просто проигнорируйте его.

© ${new Date().getFullYear()} Smetalab
      `.trim(),
    });

    if (error) {
      console.error('Email send error:', error);
      const errorMessage = error.message ?? 'Unknown Resend error';
      const onboardingHint =
        FROM_EMAIL.includes('onboarding@resend.dev')
          ? ' Для onboarding@resend.dev Resend принимает письма только на проверенный email аккаунта.'
          : '';
      const domainVerificationHint = errorMessage.toLowerCase().includes('domain is not verified')
        ? ' Проверьте, что RESEND_API_KEY принадлежит тому же аккаунту Resend, где верифицирован домен отправителя.'
        : '';

      return { success: false, error: `${errorMessage}${onboardingHint}${domainVerificationHint}` };
    }

    return { success: true };
  } catch (err) {
    console.error('Email send exception:', err);
    return { success: false, error: 'Failed to send email' };
  }
}
