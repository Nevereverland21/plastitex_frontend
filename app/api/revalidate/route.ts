
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Lista de tags válidos. Cualquier tag no listado se ignora silenciosamente.
// Mantener sincronizado con los tags usados en lib/api.ts y las signals de Django.
const VALID_TAGS = new Set([
  'products',
  'products-featured',
  'categories',
  'logo-surcharges',
]);

// Prefijos válidos para tags dinámicos (ej. "product:tomatodo-tornado")
const VALID_PREFIXES = ['product:'];

const MAX_TAGS_PER_REQUEST = 20;

export async function POST(request: NextRequest) {
  // ─── 1. Verificar autorización ────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    console.error('[revalidate] REVALIDATE_SECRET no está configurado');
    return NextResponse.json(
      { error: 'Server not configured' },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ─── 2. Parsear body ──────────────────────────────────────────────────────
  let body: { tags?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const tags = Array.isArray(body.tags) ? body.tags : [];

  if (tags.length === 0) {
    return NextResponse.json(
      { error: 'No tags provided' },
      { status: 400 },
    );
  }

  if (tags.length > MAX_TAGS_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many tags (max ${MAX_TAGS_PER_REQUEST})` },
      { status: 400 },
    );
  }

  // ─── 3. Validar y revalidar tags ──────────────────────────────────────────
  const revalidated: string[] = [];
  const ignored: string[] = [];

  for (const tag of tags) {
    if (typeof tag !== 'string' || !tag) {
      ignored.push(String(tag));
      continue;
    }

    const isValid =
      VALID_TAGS.has(tag) ||
      VALID_PREFIXES.some((prefix) => tag.startsWith(prefix));

    if (isValid) {
      revalidateTag(tag);
      revalidated.push(tag);
    } else {
      ignored.push(tag);
    }
  }

  // ─── 4. Responder ─────────────────────────────────────────────────────────
  return NextResponse.json({
    revalidated,
    ignored,
    now: Date.now(),
  });
}

// Rechazar otros métodos
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}