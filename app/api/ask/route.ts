import {google} from '@ai-sdk/google';
import {createOpenAICompatible} from '@ai-sdk/openai-compatible';
import {generateText, stepCountIs} from 'ai';
import {getSanityContext} from '@/lib/sanity-context';
import {buildSystemPrompt} from '@/lib/system-prompt';
import type {AskRequest, SystemProfile} from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

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

function getModel() {
  const provider = (process.env.AI_PROVIDER || 'ollama').trim().toLowerCase();

  if (provider === 'gemini') {
    const modelName = process.env.AI_MODEL || 'gemini-3.8-flash';
    return {
      provider: 'gemini',
      modelName,
      model: google(modelName),
      local: false,
    };
  }

  if (provider !== 'ollama') {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}. Use "ollama" or "gemini".`);
  }

  const baseURL = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/v1').replace(/\/$/, '');
  const modelName = process.env.OLLAMA_MODEL || 'qwen3:8b';
  const ollama = createOpenAICompatible({
    name: 'ollama',
    baseURL,
  });

  return {
    provider: 'ollama',
    modelName,
    model: ollama.chatModel(modelName),
    local: true,
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

    const startedAt = performance.now();
    const contextStartedAt = performance.now();
    const context = await getSanityContext();
    const contextMs = performance.now() - contextStartedAt;
    mcpClient = context.client;

    const selected = getModel();
    const baseSystemPrompt = buildSystemPrompt(profile, context.initialContext);
    const systemPrompt = selected.local
      ? `${baseSystemPrompt}\n\n/no_think\nKeep tool use focused: retrieve only what you need to answer this specific question.`
      : baseSystemPrompt;

    const modelStartedAt = performance.now();
    const result = await generateText({
      model: selected.model,
      system: systemPrompt,
      tools: context.tools,
      stopWhen: stepCountIs(4),
      prompt: question,
    });

    const modelMs = performance.now() - modelStartedAt;
    const totalMs = performance.now() - startedAt;
    const toolCalls = result.steps.reduce((count, step) => count + step.toolCalls.length, 0);

    console.info('[Signpost timing]', {
      provider: selected.provider,
      model: selected.modelName,
      contextMs: Math.round(contextMs),
      modelMs: Math.round(modelMs),
      totalMs: Math.round(totalMs),
      steps: result.steps.length,
      toolCalls,
    });

    return Response.json({
      answer: result.text,
      meta: {
        provider: selected.provider,
        model: selected.modelName,
        contextMs: Math.round(contextMs),
        modelMs: Math.round(modelMs),
        totalMs: Math.round(totalMs),
        steps: result.steps.length,
        toolCalls,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[Signpost]', error);
    return Response.json({error: message}, {status: 500});
  } finally {
    await mcpClient?.close().catch(() => undefined);
  }
}
