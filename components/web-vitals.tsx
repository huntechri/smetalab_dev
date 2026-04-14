'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
    useReportWebVitals((metric: { name: string; value: number; id: string; label?: string; startTime: number }) => {
        if (process.env.NODE_ENV === 'development') {
            switch (metric.name) {
                case 'FCP': {
                    console.log('FCP:', metric.value);
                    break;
                }
                case 'LCP': {
                    console.log('LCP:', metric.value);
                    break;
                }
                case 'CLS': {
                    console.log('CLS:', metric.value);
                    break;
                }
                case 'FID': {
                    console.log('FID:', metric.value);
                    break;
                }
                case 'TTFB': {
                    console.log('TTFB:', metric.value);
                    break;
                }
                case 'INP': {
                    console.log('INP:', metric.value);
                    break;
                }
            }
        }
    });

    return null;
}
