#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const MCP_URL = 'https://signal402.persikos.com/mcp';

async function forwardCall(text) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'tools/call',
      params: { name: 'parse_signal', arguments: { text } },
    }),
  });
  const raw = await res.text();
  const dataLine = raw.split('\n').find(l => l.startsWith('data: '));
  if (!dataLine) throw new Error(`Bad response: ${raw.substring(0, 200)}`);
  const msg = JSON.parse(dataLine.slice(6));
  if (msg.error) throw new Error(msg.error.message || JSON.stringify(msg.error));
  return msg.result;
}

const server = new Server(
  { name: 'signal402-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'parse_signal',
    description: 'Parse a TradingView alert message into structured JSON: symbol, action, price, timeframe, indicator, timestamp, raw.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Raw TradingView alert text to parse.',
          minLength: 1,
        },
      },
      required: ['text'],
      additionalProperties: false,
    },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'parse_signal') {
    return { content: [{ type: 'text', text: 'Unknown tool' }], isError: true };
  }
  const { text } = request.params.arguments ?? {};
  if (!text || typeof text !== 'string') {
    return { content: [{ type: 'text', text: 'text is required' }], isError: true };
  }
  try {
    const result = await forwardCall(text);
    return { content: result?.content ?? [{ type: 'text', text: JSON.stringify(result) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: String(err.message) }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
