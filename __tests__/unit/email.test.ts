import { describe, it, expect, vi, type Mock } from 'vitest';
import { sendEmailVerificationEmail, sendInvitationEmail, sendPasswordResetEmail } from '@/lib/infrastructure/email/email';
import { Resend } from 'resend';

// Mock the Resend client
vi.mock('resend', () => {
    const Resend = vi.fn();
    Resend.prototype.emails = {
        send: vi.fn(),
    };
    return { Resend };
});

const resendInstance = new Resend();

describe('Email Sending Logic', () => {
    it('should call the Resend API with the correct parameters', async () => {
        const params = {
            to: 'test@example.com',
            teamName: 'Test Team',
            role: 'admin',
            inviteId: 123,
            inviterEmail: 'inviter@example.com',
        };

        (resendInstance.emails.send as Mock).mockResolvedValue({ error: null });

        await sendInvitationEmail(params);

        expect(resendInstance.emails.send).toHaveBeenCalledOnce();
        const callArgs = (resendInstance.emails.send as Mock).mock.calls[0][0];

        expect(callArgs.to).toEqual([params.to]);
        expect(callArgs.subject).toContain(params.teamName);
        expect(callArgs.html).toContain(params.teamName);
        expect(callArgs.html).toContain('Администратор');
        expect(callArgs.html).toContain(`/invitations?inviteId=${params.inviteId}`);
        expect(callArgs.html).toContain(params.inviterEmail);
    });

    it('should handle API errors gracefully', async () => {
        const params = { to: 'test@example.com', teamName: 'Test Team', role: 'admin', inviteId: 123 };
        const errorMessage = 'API Error';

        (resendInstance.emails.send as Mock).mockResolvedValue({ error: { message: errorMessage } });

        // Suppress console.error for this test
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await sendInvitationEmail(params);

        expect(result.success).toBe(false);
        consoleErrorSpy.mockRestore();
        expect(result.error).toContain(errorMessage);
    });


    it('should use hosted fallback URL instead of localhost in invite links', async () => {
        const originalBaseUrl = process.env.BASE_URL;
        const originalVercelUrl = process.env.VERCEL_URL;

        delete process.env.BASE_URL;
        delete process.env.VERCEL_URL;

        (resendInstance.emails.send as Mock).mockResolvedValue({ error: null });

        await sendInvitationEmail({
            to: 'test@example.com',
            teamName: 'Test Team',
            role: 'admin',
            inviteId: 987,
        });

        process.env.BASE_URL = originalBaseUrl;
        process.env.VERCEL_URL = originalVercelUrl;

        const callArgs = (resendInstance.emails.send as Mock).mock.calls.at(-1)?.[0];
        expect(callArgs?.html).toContain('https://smetalabv3.vercel.app/invitations?inviteId=987');
    });


    it('should ignore preview vercel URL and keep stable invitation host by default', async () => {
        const originalBaseUrl = process.env.BASE_URL;
        const originalInvitationBaseUrl = process.env.INVITATION_BASE_URL;
        const originalVercelUrl = process.env.VERCEL_URL;

        delete process.env.BASE_URL;
        delete process.env.INVITATION_BASE_URL;
        process.env.VERCEL_URL = 'smetalabv3-cg7cpncr2-smetalabs.vercel.app';

        (resendInstance.emails.send as Mock).mockResolvedValue({ error: null });

        await sendInvitationEmail({
            to: 'test@example.com',
            teamName: 'Test Team',
            role: 'admin',
            inviteId: 654,
        });

        process.env.BASE_URL = originalBaseUrl;
        process.env.INVITATION_BASE_URL = originalInvitationBaseUrl;
        process.env.VERCEL_URL = originalVercelUrl;

        const callArgs = (resendInstance.emails.send as Mock).mock.calls.at(-1)?.[0];
        expect(callArgs?.html).toContain('https://smetalabv3.vercel.app/invitations?inviteId=654');
    });

    it('should fail early when RESEND_API_KEY is missing', async () => {
        const originalApiKey = process.env.RESEND_API_KEY;
        delete process.env.RESEND_API_KEY;

        const result = await sendInvitationEmail({
            to: 'test@example.com',
            teamName: 'Test Team',
            role: 'admin',
            inviteId: 123,
        });

        process.env.RESEND_API_KEY = originalApiKey;

        expect(result.success).toBe(false);
        expect(result.error).toBe('RESEND_API_KEY is not configured');
    });

    it('should send email verification link', async () => {
        (resendInstance.emails.send as Mock).mockResolvedValue({ error: null });

        await sendEmailVerificationEmail({
            to: 'verify@example.com',
            token: 'verify-token',
        });

        const callArgs = (resendInstance.emails.send as Mock).mock.calls.at(-1)?.[0];
        expect(callArgs?.to).toEqual(['verify@example.com']);
        expect(callArgs?.subject).toContain('Подтверждение email');
        expect(callArgs?.html).toContain('/verify-email?token=verify-token');
    });

    it('should send password reset link', async () => {
        (resendInstance.emails.send as Mock).mockResolvedValue({ error: null });

        await sendPasswordResetEmail({
            to: 'reset@example.com',
            token: 'reset-token',
        });

        const callArgs = (resendInstance.emails.send as Mock).mock.calls.at(-1)?.[0];
        expect(callArgs?.to).toEqual(['reset@example.com']);
        expect(callArgs?.subject).toContain('Восстановление пароля');
        expect(callArgs?.html).toContain('/reset-password?token=reset-token');
    });
});
