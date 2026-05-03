'use client';

import { useActionState } from 'react';
import { Loader2, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FormLayout } from '@/shared/ui/form-layout';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { deleteAccount, updatePassword } from '@/app/(login)/actions';

type PasswordState = { currentPassword?: string; newPassword?: string; confirmPassword?: string; error?: string; success?: string };
type DeleteState = { password?: string; error?: string; success?: string };

function FormStatusMessage({ error, success }: { error?: string; success?: string }) {
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (success) return <p className="text-sm text-success">{success}</p>;
  return null;
}

export function AdminSecuritySettingsScreen() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<PasswordState, FormData>(updatePassword, {});
  const [deleteState, deleteAction, isDeletePending] = useActionState<DeleteState, FormData>(deleteAccount, {});

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-foreground mb-6">Security Settings</h1>

      <Card className="mb-8">
        <CardHeader><CardTitle>Password</CardTitle></CardHeader>
        <CardContent>
          <FormLayout action={passwordAction}>
            <div><Label htmlFor="current-password" className="mb-2">Current Password</Label><Input size="default" id="current-password" name="currentPassword" type="password" autoComplete="current-password" required minLength={8} maxLength={100} defaultValue={passwordState.currentPassword} /></div>
            <div><Label htmlFor="new-password" className="mb-2">New Password</Label><Input size="default" id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={100} defaultValue={passwordState.newPassword} /></div>
            <div><Label htmlFor="confirm-password" className="mb-2">Confirm New Password</Label><Input size="default" id="confirm-password" name="confirmPassword" type="password" required minLength={8} maxLength={100} defaultValue={passwordState.confirmPassword} /></div>
            <FormStatusMessage error={passwordState.error} success={passwordState.success} />
            <Button type="submit" variant="brand" size="default" disabled={isPasswordPending}>{isPasswordPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : <><Lock className="mr-2 h-4 w-4" />Update Password</>}</Button>
          </FormLayout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Delete Account</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Account deletion is non-reversable. Please proceed with caution.</p>
          <FormLayout action={deleteAction}>
            <div><Label htmlFor="delete-password" className="mb-2">Confirm Password</Label><Input size="default" id="delete-password" name="password" type="password" required minLength={8} maxLength={100} defaultValue={deleteState.password} /></div>
            <FormStatusMessage error={deleteState.error} success={deleteState.success} />
            <Button type="submit" variant="destructive" disabled={isDeletePending}>{isDeletePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : <><Trash2 className="mr-2 h-4 w-4" />Delete Account</>}</Button>
          </FormLayout>
        </CardContent>
      </Card>
    </section>
  );
}
