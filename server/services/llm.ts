import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const FLASH_MODEL_ENDPOINT = process.env.FLASH_MODEL_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY is not defined in environment variables');
}

interface GenerateContentRequest {
  contents: {
    role: string;
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
}

interface GenerateContentResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

export async function generateTaskPlan(goal: string, constraints?: string): Promise<string> {
  try {
    const prompt = `You are a professional task planner AI. The user has provided the following goal: "${goal}"${constraints ? `\nWith these constraints: ${constraints}` : ''}
    
Create a detailed, professional task plan specifically for this goal. DO NOT create a generic weekend trip plan or any default plan. Focus ONLY on the user's specific input.

CRITICAL INSTRUCTIONS FOR DESCRIPTIONS:
1. Write descriptions in SIMPLE, EVERYDAY language that anyone can understand
2. Use SHORT sentences (maximum 15 words each)
3. Start each sentence with an ACTION VERB (Review, Create, Check, Write, Find, Look, etc.)
4. Avoid jargon, technical terms, and business speak
5. Break complex ideas into simple steps separated by periods
6. Write as if explaining to someone who has never done this before
7. Use everyday words instead of fancy vocabulary

EXAMPLE OF GOOD DESCRIPTION:
"Look at how much money you earn each month. Write down all your bills and expenses. Find areas where you can save money. Create a simple budget plan."

EXAMPLE OF BAD DESCRIPTION:
"Analyze current income, expenses, assets, and liabilities to determine net worth and identify areas for improvement."

Return ONLY a valid JSON array with NO additional text, NO markdown formatting, NO code blocks, NO explanations.

Use this exact structure:
[
  {
    "name": "Short, clear task name (under 50 characters)",
    "description": "Simple step-by-step description using everyday language. Break into 2-4 short sentences with periods.",
    "priority": "high",
    "estimated_hours": 2,
    "phase": "Phase name"
  }
]

IMPORTANT RULES:
- Include 5-10 tasks that are specific, actionable, and directly relevant to "${goal}"
- Organize tasks into 2-4 logical phases (e.g., "Getting Started", "Main Work", "Final Steps")
- Use simple phase names that anyone can understand
- Each task MUST have: name, description, priority (high/medium/low), estimated_hours (number), phase (string)
- DO NOT include deadline field - users will set their own deadlines
- Dependencies is optional (array of task names)
- Task names should be action-oriented and under 50 characters
- Descriptions MUST be simple, with short sentences separated by periods
- Avoid words like: utilize, implement, establish, facilitate, ascertain, comprehensive, objective
- Use words like: use, set up, create, help, find out, complete, goal
- Return ONLY the JSON array, nothing else`;
    
    const requestData: GenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3048
      }
    };

    console.log('=== AI Service: Sending request for goal:', goal);
    
    const response = await axios.post<GenerateContentResponse>(
      FLASH_MODEL_ENDPOINT,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GOOGLE_API_KEY
        }
      }
    );

    console.log('=== AI Service: Received response');

    if (response.data.candidates && response.data.candidates.length > 0) {
      const responseText = response.data.candidates[0].content.parts[0].text;
      console.log('=== AI Service: Raw response text:');
      console.log(responseText);
      console.log('=== End of raw response ===');
      
      // Try different methods to extract JSON
      try {
        const parsedJson = JSON.parse(responseText);
        if (Array.isArray(parsedJson)) {
          console.log('✅ Successfully parsed JSON directly. Task count:', parsedJson.length);
          // Process to ensure descriptions are simple and remove any deadlines AI might have added
          const processedTasks = parsedJson.map(task => {
            const { deadline, ...taskWithoutDeadline } = task;
            return {
              ...taskWithoutDeadline,
              description: simplifyDescription(task.description)
            };
          });
          return JSON.stringify(processedTasks);
        }
      } catch (e) {
        console.log('⚠️ Direct parsing failed, trying extraction methods...');
      }
      
      try {
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (jsonMatch) {
          const parsedMatch = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully extracted JSON from text. Task count:', parsedMatch.length);
          const processedTasks = parsedMatch.map((task: any) => {
            const { deadline, ...taskWithoutDeadline } = task;
            return {
              ...taskWithoutDeadline,
              description: simplifyDescription(task.description)
            };
          });
          return JSON.stringify(processedTasks);
        }
      } catch (e) {
        console.log('⚠️ Regex extraction failed:', e);
      }
      
      try {
        const codeBlockMatch = responseText.match(/``````/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          const parsedCodeBlock = JSON.parse(codeBlockMatch[1].trim());
          console.log('✅ Successfully extracted JSON from code block. Task count:', parsedCodeBlock.length);
          const processedTasks = parsedCodeBlock.map((task: any) => {
            const { deadline, ...taskWithoutDeadline } = task;
            return {
              ...taskWithoutDeadline,
              description: simplifyDescription(task.description)
            };
          });
          return JSON.stringify(processedTasks);
        }
      } catch (e) {
        console.log('⚠️ Code block extraction failed:', e);
      }
      
      // Fallback without deadline
      console.error('❌ All parsing methods failed. Using fallback task array for goal:', goal);
      return JSON.stringify([
        {
          name: "Plan Your First Step",
          description: "Think about what you want to achieve. Write down your main goal. Break it into smaller, easier tasks. Start with the easiest one first.",
          priority: "high",
          estimated_hours: 2,
          phase: "Getting Started"
        }
      ]);
    } else {
      throw new Error('No response generated from the model');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Axios error generating task plan:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } else {
      console.error('❌ Error generating task plan:', error);
    }
    
    // Return fallback without deadline
    return JSON.stringify([
      {
        name: "Plan Your First Step",
        description: "Think about what you want to achieve. Write down your main goal. Break it into smaller, easier tasks. Start with the easiest one first.",
        priority: "high",
        estimated_hours: 2,
        phase: "Getting Started"
      }
    ]);
  }
}

/**
 * Helper function to simplify complex task descriptions
 */
function simplifyDescription(description: string): string {
  if (!description) return description;
  
  let simplified = description
    .replace(/\butilize\b/gi, 'use')
    .replace(/\bimplement\b/gi, 'set up')
    .replace(/\bestablish\b/gi, 'create')
    .replace(/\bdetermine\b/gi, 'find out')
    .replace(/\banalyze\b/gi, 'look at')
    .replace(/\bevaluate\b/gi, 'check')
    .replace(/\bfacilitate\b/gi, 'help')
    .replace(/\bascertain\b/gi, 'figure out')
    .replace(/\bidentify\b/gi, 'find')
    .replace(/\bconducting\b/gi, 'doing')
    .replace(/\bproceed\b/gi, 'go ahead')
    .replace(/\bsubsequently\b/gi, 'then')
    .replace(/\bfurthermore\b/gi, 'also')
    .replace(/\bcomprehensive\b/gi, 'complete')
    .replace(/\bobjective\b/gi, 'goal')
    .replace(/\bmethodology\b/gi, 'method')
    .replace(/\bstrategy\b/gi, 'plan')
    .replace(/\bframework\b/gi, 'structure')
    .replace(/\bparameters\b/gi, 'limits')
    .replace(/\bcriteria\b/gi, 'requirements')
    .replace(/in order to/gi, 'to')
    .replace(/with regard to/gi, 'about')
    .replace(/with the exception of/gi, 'except')
    .replace(/due to the fact that/gi, 'because')
    .replace(/in the event that/gi, 'if')
    .replace(/at this point in time/gi, 'now');
  
  const sentences = simplified.split(/\.\s+/)
    .filter(s => s.trim().length > 0)
    .map(s => {
      if (s.length > 100) {
        return s.split(/\s+and\s+|,\s+/)
          .filter(part => part.trim().length > 10)
          .join('. ');
      }
      return s;
    });
  
  simplified = sentences.map(s => s.trim()).join('. ');
  
  if (!simplified.endsWith('.')) {
    simplified += '.';
  }
  
  return simplified;
}

export async function suggestTaskImprovements(taskDescription: string): Promise<string> {
  try {
    const prompt = `Improve this task description to make it clearer and more actionable.

Original task: ${taskDescription}

Rewrite it using:
- Simple, everyday language
- Short sentences (under 15 words each)
- Action verbs at the start of each sentence
- No jargon or technical terms
- 2-4 clear steps separated by periods

Return ONLY the improved description, nothing else.`;
    
    const requestData: GenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512
      }
    };

    console.log('Requesting task improvements for:', taskDescription);

    const response = await axios.post<GenerateContentResponse>(
      `${FLASH_MODEL_ENDPOINT}?key=${GOOGLE_API_KEY}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.candidates && response.data.candidates.length > 0) {
      const improvement = response.data.candidates[0].content.parts[0].text;
      return simplifyDescription(improvement);
    } else {
      throw new Error('No response generated from the model');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error suggesting task improvements:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } else {
      console.error('Error suggesting task improvements:', error);
    }
    throw new Error('Failed to suggest task improvements');
  }
}
