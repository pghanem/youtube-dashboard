import type { Metadata } from 'next';
import { JSX, ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
    title: 'Hire Me :)',
    description: 'A little YouTube dashboard for Supademo.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>): JSX.Element {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
