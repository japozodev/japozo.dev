// Imagen para compartir en redes (ver src/lib/og.ts)
import type { APIRoute } from 'astro';
import { ogPng } from '../lib/og';

export const GET: APIRoute = async () => new Response(await ogPng('es'), { headers: { 'Content-Type': 'image/png' } });
