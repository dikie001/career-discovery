import { ChatOption } from "@/components/dashboard/chat-options";

export interface ParsedAiResponse {
  text: string;
  options?: ChatOption[];
}

export function parseAiResponse(response: string): ParsedAiResponse {
  // Try to find a JSON block in the response
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1];
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.options && Array.isArray(parsed.options)) {
        // Extract the text before the JSON block
        const textBeforeJson = response.substring(0, jsonMatch.index || 0).trim();
        
        return {
          text: textBeforeJson || parsed.message || "",
          options: parsed.options.map((opt: any) => ({
            id: opt.id || opt.label.toLowerCase().replace(/\s+/g, "_"),
            label: opt.label,
            description: opt.description,
          })),
        };
      }
    } catch (e) {
      // If JSON parsing fails, just return the full text
      console.error("Failed to parse JSON from AI response:", e);
    }
  }
  
  return {
    text: response,
    options: undefined,
  };
}
