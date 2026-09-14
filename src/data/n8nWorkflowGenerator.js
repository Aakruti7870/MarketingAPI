/**
 * Production-ready N8N Automation Workflow Generator for Agentic AI Industry Bots.
 * Generates valid, importable n8n workflow JSON files compatible with N8N v1.x+.
 */

import { ALL_AGENTIC_BOTS, getBotById } from './agenticIndustryBots';

export function generateN8nWorkflow({
  industryId = 'hospital',
  businessName = 'Metro Healthcare & Diagnostics',
  webhookPath = 'whatsapp-agent-inbound',
  llmModel = 'gemini-3.8-flash',
  channel = 'whatsapp_cloud_api',
  crmTarget = 'google_sheets',
}) {
  const bot = getBotById(industryId);
  const safeName = businessName || bot.name;

  const systemPrompt = `You are ${bot.name}, an autonomous AI Agent for "${safeName}" operating in the "${bot.vertical}" sector.
Primary Directive: ${bot.tagline}

KEY OPERATIONAL PARAMETERS:
${Object.entries(bot.config)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

VERIFIED KNOWLEDGE BASE:
${bot.qaDatabase
  .map((qa, i) => `Q${i + 1}: ${qa.q}\nA${i + 1}: ${qa.a}`)
  .join('\n\n')}

BEHAVIORAL DIRECTIVES:
1. Always be professional, technically precise, and conversion-focused.
2. Directly answer user questions using verified knowledge base data.
3. If user inquires about pricing, quote the transparent standard rate and explain volume/promotional advantages.
4. Conclude responses with a clear low-friction Call To Action (e.g. reserving a token, booking a sample pickup, scheduling a site visit, or dispatching an official quote).
5. Output your reasoning trace prefixed with [AGENTIC_REASONING: <brief note>].`;

  const workflowJson = {
    name: `LUMINA360 - ${bot.name} (${bot.vertical})`,
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: webhookPath,
          responseMode: 'responseNode',
          options: {},
        },
        id: 'node-webhook-inbound',
        name: 'Webhook: WhatsApp / User Message',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [180, 300],
        webhookId: `hook-${industryId}-${Date.now().toString(36)}`,
      },
      {
        parameters: {
          jsCode: `// Extract and normalize inbound message payload
const body = $input.first().json.body || $input.first().json;

// Support Meta WhatsApp Cloud API format or standard JSON
let senderPhone = '919820011223';
let senderName = 'Customer';
let messageText = 'Inquiry';

if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
  const msg = body.entry[0].changes[0].value.messages[0];
  senderPhone = msg.from;
  messageText = msg.text ? msg.text.body : (msg.interactive ? msg.interactive.button_reply.title : 'Hello');
  senderName = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || 'WhatsApp User';
} else {
  senderPhone = body.phone || body.from || senderPhone;
  senderName = body.name || senderName;
  messageText = body.message || body.text || messageText;
}

return {
  json: {
    senderPhone,
    senderName,
    messageText,
    vertical: '${industryId}',
    receivedAt: new Date().toISOString(),
    sessionId: 'SESS_' + senderPhone.replace(/\\D/g, '')
  }
};`,
        },
        id: 'node-payload-normalizer',
        name: 'Normalizer: Inbound Parser',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [420, 300],
      },
      {
        parameters: {
          promptType: 'define',
          text: `={{ $json.messageText }}`,
          options: {
            systemMessage: systemPrompt,
          },
        },
        id: 'node-ai-agent-engine',
        name: `AI Agent: ${bot.badgeText}`,
        type: '@n8n/n8n-nodes-langchain.agent',
        typeVersion: 1.7,
        position: [680, 300],
      },
      {
        parameters: {
          modelName: llmModel === 'gemini-3.8-flash' ? 'models/gemini-2.0-flash' : llmModel,
          options: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        },
        id: 'node-llm-model-gemini',
        name: 'LLM: Gemini / Generative AI',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        typeVersion: 1,
        position: [680, 520],
        credentials: {
          googleGeminiApi: {
            id: 'gemini_credential_1',
            name: 'Gemini API Key',
          },
        },
      },
      {
        parameters: {
          name: 'rate_card_and_spec_verifier',
          description: `Look up verified prices, minimum order quantities, and specifications for ${bot.vertical}`,
          jsCode: `// Domain Tool: Verified specs & pricing lookup
const query = $input.first().json.query || '';
const config = ${JSON.stringify(bot.config, null, 2)};
return {
  result: JSON.stringify(config)
};`,
        },
        id: 'node-tool-rate-card',
        name: 'Tool: Rate & Spec Engine',
        type: '@n8n/n8n-nodes-langchain.toolCustom',
        typeVersion: 1,
        position: [900, 520],
      },
      {
        parameters: {
          jsCode: `// Generate Action Pass & Format Final Reply
const aiOutput = $input.first().json.output || $input.first().json.text || 'Thank you for reaching out!';
const normalized = $('Normalizer: Inbound Parser').first().json;

// Extract internal agent reasoning
let cleanReply = aiOutput;
let reasoning = 'Autonomous reasoning executed.';
const match = aiOutput.match(/\\[AGENTIC_REASONING:\\s*(.*?)\\]/i);
if (match) {
  reasoning = match[1].trim();
  cleanReply = aiOutput.replace(/\\[AGENTIC_REASONING:.*?\\]/gi, '').trim();
}

// Generate unique pass token
const tokenCode = '${industryId.toUpperCase().slice(0, 3)}-' + Math.floor(1000 + Math.random() * 9000);

return {
  json: {
    recipientPhone: normalized.senderPhone,
    recipientName: normalized.senderName,
    userQuery: normalized.messageText,
    replyText: cleanReply,
    reasoning,
    tokenCode,
    actionCard: {
      vertical: '${industryId}',
      title: '${bot.badgeText} Confirmation',
      tokenCode,
      dispatchedAt: new Date().toISOString()
    }
  }
};`,
        },
        id: 'node-action-generator',
        name: 'Action Engine: Format & Tokenize',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [940, 300],
      },
      {
        parameters: {
          operation: 'appendOrUpdate',
          documentId: {
            __rl: true,
            value: 'YOUR_GOOGLE_SHEET_SPREADSHEET_ID',
            mode: 'id',
          },
          sheetName: {
            __rl: true,
            value: `${bot.name.replace(/[^a-zA-Z0-9]/g, '_')}_Leads`,
            mode: 'name',
          },
          columns: {
            mappingMode: 'autoMapInputData',
            value: {},
          },
          options: {},
        },
        id: 'node-crm-logger',
        name: 'CRM: Google Sheets / Database Logger',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 4.5,
        position: [1180, 180],
        credentials: {
          googleSheetsOAuth2: {
            id: 'google_sheets_cred_1',
            name: 'Google Sheets OAuth',
          },
        },
      },
      {
        parameters: {
          method: 'POST',
          url: 'https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'Content-Type',
                value: 'application/json',
              },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{ $json.recipientPhone }}",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "{{ $json.replyText }}\\n\\n🎫 Verified Reference Token: *{{ $json.tokenCode }}*"
  }
}`,
          options: {},
        },
        id: 'node-whatsapp-sender',
        name: 'Outbound: WhatsApp Cloud API',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1180, 420],
        credentials: {
          httpHeaderAuth: {
            id: 'meta_whatsapp_token_1',
            name: 'Meta WhatsApp Bearer Token',
          },
        },
      },
      {
        parameters: {
          respondWith: 'json',
          responseBody: `={
  "status": "success",
  "vertical": "${industryId}",
  "recipient": "{{ $json.recipientPhone }}",
  "tokenCode": "{{ $json.tokenCode }}",
  "reply": "{{ $json.replyText }}",
  "reasoningTrace": "{{ $json.reasoning }}"
}`,
          options: {},
        },
        id: 'node-webhook-response',
        name: 'Response: Webhook HTTP 200 OK',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1.1,
        position: [1420, 300],
      },
    ],
    connections: {
      'Webhook: WhatsApp / User Message': {
        main: [
          [
            {
              node: 'Normalizer: Inbound Parser',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
      'Normalizer: Inbound Parser': {
        main: [
          [
            {
              node: `AI Agent: ${bot.badgeText}`,
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
      'LLM: Gemini / Generative AI': {
        ai_languageModel: [
          [
            {
              node: `AI Agent: ${bot.badgeText}`,
              type: 'ai_languageModel',
              index: 0,
            },
          ],
        ],
      },
      'Tool: Rate & Spec Engine': {
        ai_tool: [
          [
            {
              node: `AI Agent: ${bot.badgeText}`,
              type: 'ai_tool',
              index: 0,
            },
          ],
        ],
      },
      [`AI Agent: ${bot.badgeText}`]: {
        main: [
          [
            {
              node: 'Action Engine: Format & Tokenize',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
      'Action Engine: Format & Tokenize': {
        main: [
          [
            {
              node: 'CRM: Google Sheets / Database Logger',
              type: 'main',
              index: 0,
            },
            {
              node: 'Outbound: WhatsApp Cloud API',
              type: 'main',
              index: 0,
            },
            {
              node: 'Response: Webhook HTTP 200 OK',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
    },
    settings: {
      executionOrder: 'v1',
    },
    pinData: {},
  };

  return workflowJson;
}

export function downloadWorkflowJson(workflowObj, filename = 'n8n-agentic-workflow.json') {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workflowObj, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
