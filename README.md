# signal402-mcp

[![Glama](https://glama.ai/mcp/servers/signal402-mcp/badge)](https://glama.ai/mcp/servers/signal402-mcp)

MCP server for [signal402](https://signal402.persikos.com) — parse raw TradingView alert text into structured JSON signals.

## Tool: `parse_signal`

**Input:** `text` (string) — raw TradingView alert message

**Output:** structured JSON with fields:
- `symbol` — trading pair (e.g. `BTCUSDT`)
- `action` — `buy` | `sell` | `close` | `null`
- `price` — numeric price or `null`
- `timeframe` — e.g. `15m`, `1h`, `4h` or `null`
- `indicator` — name of the indicator/strategy or `null`
- `timestamp` — ISO 8601 UTC string
- `raw` — original input text

## Usage

```json
{
  "mcpServers": {
    "signal402": {
      "command": "npx",
      "args": ["-y", "signal402-mcp"]
    }
  }
}
```

## Powered by

[signal402](https://signal402.persikos.com) — x402 pay-per-call TradingView signal normalizer on Base mainnet.
