import {getSanityContext} from '@/lib/sanity-context';

export const runtime = 'nodejs';

export async function GET() {
  let client: Awaited<ReturnType<typeof getSanityContext>>['client'] | undefined;

  try {
    const context = await getSanityContext();
    client = context.client;

    return Response.json({
      ok: true,
      message: 'Sanity Context is connected.',
      initialContextCharacters: context.initialContext.length,
      tools: Object.keys(context.tools),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Context error';

    return Response.json(
      {
        ok: false,
        message,
      },
      {status: 500},
    );
  } finally {
    await client?.close().catch(() => undefined);
  }
}
