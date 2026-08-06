import type { ChartSpec } from '../types/chat';

export interface GeneratedAiResponse {
  content: string;
  chart?: ChartSpec;
}

const RESPONSES_WITH_CHARTS: { content: string; chart: ChartSpec }[] = [
  {
    content: `Here is a summary of service usage and customer satisfaction metrics:

### Overview
- **Enterprise**: Highest adoption with 94% customer satisfaction.
- **Professional**: Steady quarter-over-quarter expansion.
- **Standard**: Strong retention and engagement rates.

Please see the breakdown below:`,
    chart: {
      type: 'bar',
      title: 'Service Adoption & Satisfaction Rates',
      xKey: 'category',
      data: [
        { category: 'Enterprise', adoption: 88, satisfaction: 94 },
        { category: 'Professional', adoption: 76, satisfaction: 91 },
        { category: 'Standard', adoption: 65, satisfaction: 89 },
        { category: 'Starter', adoption: 50, satisfaction: 85 },
      ],
      series: [
        { dataKey: 'adoption', name: 'Adoption Rate (%)', color: '#2563eb' },
        { dataKey: 'satisfaction', name: 'Satisfaction Score', color: '#059669' },
      ],
    },
  },
  {
    content: `Here is the quarterly distribution of incoming support and inquiry topics:`,
    chart: {
      type: 'pie',
      title: 'Support Inquiry Categories',
      xKey: 'name',
      data: [
        { name: 'Product Info', value: 45 },
        { name: 'Technical Support', value: 30 },
        { name: 'Billing & Account', value: 15 },
        { name: 'General Feedback', value: 10 },
      ],
      series: [{ dataKey: 'value', name: 'Percentage', color: '#2563eb' }],
    },
  },
];

const CODE_RESPONSES = [
  `Here is how you can integrate the client SDK in your application:

\`\`\`typescript
import { createClient } from '@company/assistant-sdk';

const client = createClient({
  apiKey: process.env.ASSISTANT_API_KEY,
  environment: 'production',
});

export async function askAssistant(prompt: string) {
  try {
    const response = await client.query({ message: prompt });
    return response.text;
  } catch (error) {
    console.error('Error querying AI Assistant:', error);
    throw error;
  }
}
\`\`\`

### Integration Best Practices:
1. Ensure your API Key is kept secret in server-side or proxy environments.
2. Provide fallback messages for unexpected network delays.`,
];

const GENERAL_RESPONSES = [
  `I am here to help answer questions about our products, services, documentation, and technical support.

### Popular Assistance Topics:
1. **Products & Services**: Learn about feature details, solution guides, and options.
2. **Technical Support**: Troubleshooting steps, SDK documentation, and API integrations.
3. **Frequently Asked Questions**: Quick answers to common account and service questions.

Feel free to ask any specific question or describe what you need help with!`,

  `Thank you for reaching out! Here is how I can assist you:

- **Information Lookup**: Quickly find documentation, guides, or product specs.
- **Support & Inquiries**: Get guidance on common issues or contact procedures.
- **Custom Walkthroughs**: Request step-by-step instructions for specific features.

What can I help you explore today?`,
];

export async function simulateAiResponseStream(
  userPrompt: string,
  onChunk: (chunkText: string, fullText: string, chart?: ChartSpec) => void,
  signal?: AbortSignal
): Promise<GeneratedAiResponse> {
  const lower = userPrompt.toLowerCase();
  
  let targetResponse: GeneratedAiResponse;

  if (lower.includes('chart') || lower.includes('data') || lower.includes('revenue') || lower.includes('graph') || lower.includes('analytics') || lower.includes('metrics')) {
    const randomIndex = Math.floor(Math.random() * RESPONSES_WITH_CHARTS.length);
    targetResponse = RESPONSES_WITH_CHARTS[randomIndex];
  } else if (lower.includes('code') || lower.includes('typescript') || lower.includes('sdk') || lower.includes('api') || lower.includes('function')) {
    const randomIndex = Math.floor(Math.random() * CODE_RESPONSES.length);
    targetResponse = { content: CODE_RESPONSES[randomIndex] };
  } else {
    const randomIndex = Math.floor(Math.random() * GENERAL_RESPONSES.length);
    targetResponse = { content: GENERAL_RESPONSES[randomIndex] };
  }

  const words = targetResponse.content.split(/(\s+)/);
  let currentText = '';
  const totalWords = words.length;

  for (let i = 0; i < totalWords; i++) {
    if (signal?.aborted) {
      throw new Error('Generation aborted by user');
    }

    const token = words[i];
    if (!token) {
      continue;
    }

    currentText += token;

    const isLastChunk = i === totalWords - 1;
    const chunkSize = Math.max(1, Math.min(6, Math.ceil(totalWords / 18)));
    if (i % chunkSize === 0 || isLastChunk) {
      onChunk(token, currentText, isLastChunk ? targetResponse.chart : undefined);
    }

    const delay = Math.floor(Math.random() * 22) + 10;
    await new Promise((res) => setTimeout(res, delay));
  }

  return {
    content: targetResponse.content,
    chart: targetResponse.chart,
  };
}
