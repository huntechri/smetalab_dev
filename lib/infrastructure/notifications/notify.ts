import { toast as sonnerToast } from 'sonner';

export type NotifyIntent = 'success' | 'error' | 'info';
export type NotifyChannel = 'toast' | 'inbox' | 'both';

export interface NotifyInput {
    title: string;
    description?: string;
    intent?: NotifyIntent;
    channel?: NotifyChannel;
}

const notifyToast = ({ title, description, intent = 'success' }: NotifyInput) => {
    if (intent === 'error') {
        sonnerToast.error(title, { description });
        return;
    }

    if (intent === 'info') {
        sonnerToast(title, { description });
        return;
    }

    sonnerToast.success(title, { description });
};

const notifyInbox = (_input: NotifyInput) => {
    // TODO: add inbox event routing when unified inbox write API is finalized.
};

export function notify(input: NotifyInput) {
    const channel = input.channel ?? 'toast';

    if (channel === 'toast') {
        notifyToast(input);
        return;
    }

    if (channel === 'inbox') {
        notifyInbox(input);
        return;
    }

    notifyToast(input);
    notifyInbox(input);
}
