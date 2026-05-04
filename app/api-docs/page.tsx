'use client';

import dynamic from 'next/dynamic';
import { Surface } from '@/shared/ui/surface';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    return (
        <Surface variant="card" className="min-h-screen">
            <SwaggerUI url="/api/docs" />
        </Surface>
    );
}
