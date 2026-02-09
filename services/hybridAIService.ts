// services/hybridAIService.ts
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
  async generateQuizQuestions(topic: string, count: number = 5) {
    try {
      const prompt = `Create ${count} multiple-choice quiz questions about "${topic}".

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

Make questions progressively harder.`;

      const response = await fetch(`${API_URL}/aiAssistant/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1500 }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Quiz generation error:', responseText);
        throw new Error('Failed');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid format');
      }
      
      if (!data.success) throw new Error(data.error);

      try {
        const parsed = JSON.parse(data.data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error('Invalid format');
      }
    } catch (error) {
      console.error('Using fallback for quiz generation:', error);
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

  // Local methods 
  suggestImprovements: aiService.suggestImprovements,
  getTemplates: () => aiService.templates,
  getTemplate: (type: keyof typeof aiService.templates, topic: string) => {
    return aiService.templates[type](topic);
  },
};