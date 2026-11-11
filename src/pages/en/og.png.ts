// Social sharing image, English version (see src/lib/og.ts)
import type { APIRoute } from 'astro';
import { ogPng } from '../../lib/og';

export const GET: APIRoute = async () => new Response(await ogPng('en'), { headers: { 'Content-Type': 'image/png' } });
