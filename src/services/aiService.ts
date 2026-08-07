import type { ChartSpec } from '../types/chat';
import axios from 'axios';


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
  
  const finalMessage = await callChatbotAPI(userPrompt);

  // Chặt chuỗi ra để làm hiệu ứng gõ phím
  const words = finalMessage.split(/(\s+)/);
  let currentText = '';
  const totalWords = words.length;

  for (let i = 0; i < totalWords; i++) {
    if (signal?.aborted) {
      throw new Error('Generation aborted by user');
    }

    const token = words[i];
    if (!token) continue;

    currentText += token;

    const isLastChunk = i === totalWords - 1;
    const chunkSize = Math.max(1, Math.min(6, Math.ceil(totalWords / 18)));
    if (i % chunkSize === 0 || isLastChunk) {
      // Để chart là undefined vì backend mình chưa trả về biểu đồ
      onChunk(token, currentText, undefined); 
    }

    const delay = Math.floor(Math.random() * 22) + 10;
    await new Promise((res) => setTimeout(res, delay));
  }

  return {
    content: finalMessage,
    chart: undefined,
  };
}
export async function callChatbotAPI(message: string): Promise<string> {
  try {
    const response = await axios.post('http://localhost:3002/api/chat', { message });
    
    if (response.data.success && response.data.data) {
      const responseData = response.data.data;
      const tables = responseData.resp?.data?.Data;
      
      let finalMessage = responseData.message || "Không có thông báo.";
      
      if (tables) {
        const title = tables.Table?.[0]?.TITLE_NAME || "";
        const description = tables.Table1?.[0]?.DESCRIPTION || "";
        let suggest = tables.Table2?.[0]?.SUGGEST_NAME || "";
        
        if (suggest) {
          suggest = suggest
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<b>/gi, '**')
            .replace(/<\/b>/gi, '**');
            
          suggest = `> 💡 **Gợi ý hỗ trợ:**\n> \n> ${suggest.split('\n').map((line: string) => line.trim()).filter((line: string) => line).join('\n> ')}`;
        }
        
        finalMessage = `${title}\n\n${description}\n\n${suggest}`.trim();
      }
      
      // Chuyển đổi thẻ <Table> CSV thành Markdown Table chuẩn
      finalMessage = finalMessage.replace(/<Table>\n([\s\S]*?)\n<\/Table>/gi, (match, csvContent) => {
        const lines = csvContent.split('\n').filter((line: string) => line.trim() !== '');
        if (lines.length === 0) return match;

        const parseCsvLine = (line: string) => {
          return line.split(',').map(cell => {
            let val = cell.trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.substring(1, val.length - 1);
            }
            if (val === 'null' || !val) val = '-';
            return val;
          });
        };

        const headers = parseCsvLine(lines[0]);
        const markdownLines = [];
        
        // Header
        markdownLines.push('| ' + headers.join(' | ') + ' |');
        markdownLines.push('|' + headers.map(() => '---').join('|') + '|');
        
        // Rows
        const aoaData: string[][] = [headers];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCsvLine(lines[i]);
          markdownLines.push('| ' + cells.join(' | ') + ' |');
          aoaData.push(cells);
        }
        
        let downloadLink = '';
        if (typeof window !== 'undefined') {
          // @ts-ignore
          if (!window.__CHAT_FILES) window.__CHAT_FILES = {};
          const csvId = Math.random().toString(36).substring(2, 10);
          // @ts-ignore
          window.__CHAT_FILES[csvId] = aoaData;
          downloadLink = `\n\n[Bảng dữ liệu Excel](https://chat-csv.local/${csvId})\n\n`;
        }
        
        return markdownLines.join('\n') + downloadLink;
      });

      // Xử lý thẻ <File> chứa Base64 bằng indexOf để tránh lỗi regex trên chuỗi dài
      let fileStartIndex = finalMessage.indexOf('<File>');
      while (fileStartIndex !== -1) {
        const fileEndIndex = finalMessage.indexOf('</File>', fileStartIndex);
        if (fileEndIndex !== -1) {
          const fileContent = finalMessage.substring(fileStartIndex + 6, fileEndIndex);
          const nameMatch = fileContent.match(/file_name:\s*([^,]+)/i);
          const dataMatch = fileContent.match(/file_data:\s*([^,]+)/i);
          
          const fileName = nameMatch ? nameMatch[1].trim() : "Tài_liệu.pdf";
          const fileData = dataMatch ? dataMatch[1].trim().replace(/\s+/g, '') : "";
          
          let replacement = `\n\n📎 **Tệp đính kèm:** \`${fileName}\` *(Lỗi tải file)*\n\n`;
          
          if (fileData && typeof window !== 'undefined') {
            // @ts-ignore
            if (!window.__CHAT_FILES) window.__CHAT_FILES = {};
            const fileId = Math.random().toString(36).substring(2, 10);
            // @ts-ignore
            window.__CHAT_FILES[fileId] = fileData;
            replacement = `\n\n[${fileName}](https://chat-file.local/${fileId})\n\n`;
          }
          
          finalMessage = finalMessage.substring(0, fileStartIndex) + replacement + finalMessage.substring(fileEndIndex + 7);
          fileStartIndex = finalMessage.indexOf('<File>', fileStartIndex + replacement.length);
        } else {
          break;
        }
      }

      // Xử lý thẻ <Image> chứa Base64 siêu lớn bằng indexOf để tránh lỗi regex trên chuỗi quá dài
      let imgStartIndex = finalMessage.indexOf('<Image>');
      while (imgStartIndex !== -1) {
        const imgEndIndex = finalMessage.indexOf('</Image>', imgStartIndex);
        if (imgEndIndex !== -1) {
          const imageContent = finalMessage.substring(imgStartIndex + 7, imgEndIndex);
          const base64Data = imageContent.trim().replace(/\s+/g, '');
          
          let replacement = `*(Lỗi hiển thị hình ảnh)*`;
          if (base64Data && typeof window !== 'undefined') {
            // @ts-ignore
            if (!window.__CHAT_FILES) window.__CHAT_FILES = {};
            const imageId = Math.random().toString(36).substring(2, 10);
            // @ts-ignore
            window.__CHAT_FILES[imageId] = base64Data;
            replacement = `![Hình ảnh](https://chat-image.local/${imageId})`;
          }
          
          finalMessage = finalMessage.substring(0, imgStartIndex) + replacement + finalMessage.substring(imgEndIndex + 8);
          imgStartIndex = finalMessage.indexOf('<Image>', imgStartIndex + replacement.length);
        } else {
          break;
        }
      }

      return finalMessage;
    } else {
      return response.data.message || "Xin lỗi, mình chưa có dữ liệu cho câu hỏi này.";
    }
  } catch (error) {
    console.error("Lỗi khi gọi Chatbot API:", error);
    return "Đã xảy ra lỗi kết nối đến máy chủ. Vui lòng thử lại sau.";
  }
}
