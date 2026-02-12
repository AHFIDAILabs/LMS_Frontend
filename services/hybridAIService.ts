// services/hybridAIService.ts
import { QuestionType } from '@/types/assessments';
import { aiService } from './aiService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'  

export const hybridAIService = {
  // Generate lesson content using AI or fallback
  async generateLessonContent(topic: string, duration: number, type: string) {
    try {
      const prompt = `Create a comprehensive ${type} lesson about "${topic}" that takes approximately ${duration} minutes to complete.

Include:
1. A clear title
2. An engaging description (2-3 sentences)
3. 4-5 specific learning objectives
4. Well-structured content with:
   - Introduction
   - 3-5 main sections with explanations
   - Code examples (if applicable)
   - Practice exercises
   - Summary
   - Additional resources

Format the response as a JSON object with these keys:
{
  "title": "lesson title",
  "description": "lesson description",
  "learningObjectives": ["objective 1", "objective 2", ...],
  "content": "markdown formatted content"
}`;

      const response = await fetch(`${API_URL}/aiAssistant/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 2048 }),
      });

      // Get response text first to see the actual error
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('AI API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`AI generation failed: ${response.status} - ${responseText}`);
      }

      // Parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid JSON response from AI service');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'AI generation failed');
      }

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(data.data);
        return {
          ...parsed,
          estimatedMinutes: duration,
          type,
        };
      } catch {
        // If not JSON, use the raw content
        return {
          title: topic,
          description: `A comprehensive lesson about ${topic}`,
          learningObjectives: [`Master ${topic} concepts`],
          content: data.data,
          estimatedMinutes: duration,
          type,
        };
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      // Fallback to local logic
      return aiService.generateLessonOutline(topic, duration, type);
    }
  },

  // Generate module structure
  async generateModuleStructure(courseName: string, moduleCount: number, courseDescription?: string) {
    try {
      const prompt = `Create a structured curriculum for a course titled "${courseName}". 
${courseDescription ? `Course description: ${courseDescription}` : ''}

Generate ${moduleCount} modules that progressively build knowledge.

Return a JSON array of modules, each with:
{
  "title": "Module X: Topic",
  "description": "What this module covers",
  "order": number,
  "type": "core",
  "estimatedMinutes": 120,
  "learningObjectives": ["objective 1", "objective 2", "objective 3"]
}`;

      const response = await fetch(`${API_URL}/aiAssistant/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1500 }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Module generation error:', responseText);
        throw new Error('Failed');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid response format');
      }
      
      if (!data.success) throw new Error(data.error);

      try {
        const parsed = JSON.parse(data.data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Using fallback for module generation:', error);
      return aiService.generateModuleStructure(courseName, moduleCount, courseDescription);
    }
  },

  // Generate quiz questions
// Generate quiz questions
// Generate quiz questions
async generateQuizQuestions(topic: string, count: number = 5) {
  try {
    // Validate count
    if (count < 1 || count > 50) {
      throw new Error('Question count must be between 1 and 50');
    }

    const prompt = `Create exactly ${count} multiple-choice quiz questions about "${topic}".

Return a JSON array where each question has:
{
  "question": "The question text",
  "type": "multiple-choice",
  "difficulty": "easy|medium|hard",
  "options": ["option 1", "option 2", "option 3", "option 4"],
  "correctAnswer": 0,
  "explanation": "Why this is the correct answer",
  "points": 1-3 based on difficulty
}

IMPORTANT: Return EXACTLY ${count} questions in a valid JSON array.
Make questions progressively harder.`;

    const response = await fetch(`${API_URL}/aiAssistant/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        maxTokens: Math.min(2048, 300 * count) // Scale tokens with question count
      }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Quiz generation error:', {
        status: response.status,
        body: responseText
      });
      throw new Error('API request failed');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response:', responseText);
      throw new Error('Invalid API response format');
    }
    
    if (!data.success) {
      console.error('API returned error:', data.error);
      throw new Error(data.error || 'API returned unsuccessful response');
    }

    // Clean potential markdown code blocks
    let rawContent = data.data.trim();
    if (rawContent.startsWith('```')) {
      rawContent = rawContent
        .replace(/^```json\n?/, '')
        .replace(/^```\n?/, '')
        .replace(/```$/, '')
        .trim();
    }

    try {
      const parsed = JSON.parse(rawContent);
      const questions = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate structure
      if (questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Warn if count doesn't match (but still return what we got)
      if (questions.length !== count) {
        console.warn(`Expected ${count} questions but got ${questions.length}`);
      }
      
      return questions;
    } catch (jsonError) {
      console.error('Failed to parse question data:', rawContent);
      console.error('Parse error:', jsonError);
      throw new Error('Could not parse question data from AI response');
    }
  } catch (error) {
    console.error('AI quiz generation failed, using fallback:', error);
    return aiService.generateQuizQuestions(topic, count);
  }
},

  // Improve existing content
  async improveContent(content: string, focusAreas?: string[]) {
    try {
      const focus = focusAreas?.length 
        ? `Focus on improving: ${focusAreas.join(', ')}`
        : 'Improve overall quality, clarity, and engagement';

      const prompt = `Improve this educational content. ${focus}

Original content:
${content}

Return the improved version in markdown format.`;

      const response = await fetch(`${API_URL}/aiAssistant/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 2048 }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Content improvement error:', responseText);
        throw new Error('Failed');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        return content;
      }
      
      if (!data.success) throw new Error(data.error);

      return data.data;
    } catch (error) {
      console.error('Content improvement failed:', error);
      return content; // Return original if failed
    }
  },


async generateAssessmentQuestions(topic: string, type: QuestionType, count: number = 5) {
    try {
      // Define specialized instructions based on question type
      const typeInstructions = {
        [QuestionType.MULTIPLE_CHOICE]: 'Provide 4 options and the index (0-3) of the correct one.',
        [QuestionType.TRUE_FALSE]: 'Provide ["True", "False"] as options and the correct string "True" or "False".',
        [QuestionType.SHORT_ANSWER]: 'No options needed. Provide a concise correct string answer.',
        [QuestionType.ESSAY]: 'No options. Provide a rubric or key points to look for in the "correctAnswer" field.',
        [QuestionType.CODING]: 'Provide a starter code template and the logic for the correct solution.'
      };

      const prompt = `Create ${count} ${type.replace('_', ' ')} questions about "${topic}".
      ${typeInstructions[type]}

      Return ONLY a JSON array where each object strictly matches this structure:
      {
        "question": "The question text",
        "type": "${type}",
        "options": ${type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.TRUE_FALSE ? '["opt1", "opt2", ...]' : 'null'},
        "correctAnswer": "The answer value",
        "points": 5,
        "explanation": "Brief reasoning",
        ${type === QuestionType.CODING ? '"codeTemplate": "function solution() {\\n\\n}"' : ''}
      }`;

      const response = await fetch(`${API_URL}/aiAssistant/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 2000 }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Clean markdown code blocks if AI included them
      let rawContent = data.data.trim();
      if (rawContent.startsWith('```')) {
        rawContent = rawContent.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(rawContent);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      // Fallback uses the topic and requested count
      return aiService.generateQuizQuestions(topic, count);
    }
  },

  // Local methods 
  suggestImprovements: aiService.suggestImprovements,
  getTemplates: () => aiService.templates,
  getTemplate: (type: keyof typeof aiService.templates, topic: string) => {
    return aiService.templates[type](topic);
  },
};