import {google} from '@ai-sdk/google';
import {generateText, stepCountIs} from 'ai';
import {getSanityContext} from '@/lib/sanity-context';
import {buildSystemPrompt} from '@/lib/system-prompt';
import type {AskRequest, SystemProfile} from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_QUESTION_LENGTH = 4000;

function clean(value: unknown, max = 180) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizeProfile(value: unknown): SystemProfile {
  const profile = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    distro: clean(profile.distro),
    version: clean(profile.version),
    desktop: clean(profile.desktop),
    session: clean(profile.session),
    hardware: clean(profile.hardware, 500),
  };
}

export async function POST(request: Request) {
  let mcpClient: Awaited<ReturnType<typeof getSanityContext>>['client'] | undefined;

  try {
    const body = (await request.json()) as Partial<AskRequest>;
    const question = clean(body.question, MAX_QUESTION_LENGTH);

    if (!question) {
      return Response.json({error: 'Ask a troubleshooting question first.'}, {status: 400});
    }

    const profile = normalizeProfile(body.profile);
    const context = await getSanityContext();
    mcpClient = context.client;

    const modelName = process.env.AI_MODEL || 'gemini-3.8-flash';
    const result = await generateText({
      model: google(modelName),
      system: buildSystemPrompt(profile, context.initialContext),
      tools: context.tools,
      stopWhen: stepCountIs(8),
      prompt: question,
    });

    return Response.json({answer: result.text});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[Signpost]', error);
    return Response.json({error: message}, {status: 500});
  } finally {
    await mcpClient?.close().catch(() => undefined);
  }
}
