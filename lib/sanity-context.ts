import {createMCPClient} from '@ai-sdk/mcp';

function requireEnv(name: 'SANITY_CONTEXT_MCP_URL' | 'SANITY_ORGANIZATION_TOKEN') {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function getSanityContext() {
  const url = requireEnv('SANITY_CONTEXT_MCP_URL');
  const token = requireEnv('SANITY_ORGANIZATION_TOKEN');
  const headers = {Authorization: `Bearer ${token}`};

  // Append to the URL path so any MCP query parameters are preserved.
  const initialContextUrl = new URL(url);
  initialContextUrl.pathname = `${initialContextUrl.pathname.replace(/\/$/, '')}/initial-context`;

  const contextResponse = await fetch(initialContextUrl, {
    headers,
    cache: 'no-store',
  });

  if (!contextResponse.ok) {
    const details = await contextResponse.text().catch(() => '');
    throw new Error(
      `Sanity initial context failed (${contextResponse.status})${details ? `: ${details.slice(0, 300)}` : ''}`,
    );
  }

  const initialContext = await contextResponse.text();
  const client = await createMCPClient({
    transport: {type: 'http', url, headers},
  });

  try {
    const allTools = await client.tools();
    const {initial_context: _initialContextTool, ...tools} = allTools;
    return {client, initialContext, tools};
  } catch (error) {
    await client.close().catch(() => undefined);
    throw error;
  }
}
