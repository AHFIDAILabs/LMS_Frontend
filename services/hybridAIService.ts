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

  // Generate assessment questions
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

  // Generate program structure 
  async generateProgramStructure(
    programTitle: string, 
    category?: string,
    description?: string,
    targetDuration?: number
  ) {
    try {
      const prompt = `Create a comprehensive educational program structure for "${programTitle}".
${category ? `Category: ${category}` : ''}
${description ? `Description: ${description}` : ''}
${targetDuration ? `Target Duration: ${targetDuration} weeks` : ''}

Generate a detailed program structure with:
1. A compelling program title (improve if needed)
2. An engaging 2-3 sentence description that sells the program
3. Recommended category (if not provided)
4. Estimated duration in weeks (8-24 weeks typical)
5. Suggested price in USD (based on duration and complexity)
6. 5-8 relevant, SEO-friendly tags
7. 4-6 clear learning outcomes
8. Brief curriculum overview

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Program title",
  "description": "Detailed, engaging description",
  "category": "Category name",
  "duration": number (weeks),
  "price": number (USD),
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "learningOutcomes": ["outcome1", "outcome2", "outcome3", "outcome4"],
  "curriculumOverview": "Brief overview of what the program covers"
}

Make it professional, market-ready, and compelling.`;

      const response = await fetch(`${API_URL}/aiAssistant/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1500 }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Program generation error:', {
          status: response.status,
          body: responseText
        });
        throw new Error('Failed to generate program structure');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response format');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'AI generation failed');
      }

      // Clean markdown code blocks if present
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
        
        // Validate required fields
        if (!parsed.name || !parsed.description) {
          throw new Error('Invalid program structure - missing required fields');
        }

        return parsed;
      } catch (jsonError) {
        console.error('Failed to parse program data:', rawContent);
        throw new Error('Could not parse program structure from AI response');
      }
    } catch (error) {
      console.error('AI program generation failed, using fallback:', error);
      return generateFallbackProgramStructure(programTitle, category, description, targetDuration);
    }
  },

  // Add this to hybridAIService.ts after generateProgramStructure

async generateCourseStructure(
  courseTitle: string,
  programContext?: string,
  description?: string,
  targetHours?: number
) {
  try {
    const prompt = `Create a comprehensive course structure for "${courseTitle}".
${programContext ? `Program Context: ${programContext}` : ''}
${description ? `Current Description: ${description}` : ''}
${targetHours ? `Target Duration: ${targetHours} hours` : ''}

Generate a detailed course structure with:
1. An improved course title (if needed)
2. A compelling 2-3 sentence description
3. Estimated hours (20-80 hours typical)
4. Clear target audience description
5. 4-8 specific learning objectives
6. 3-6 prerequisites

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Course title",
  "description": "Detailed, engaging description",
  "estimatedHours": number,
  "targetAudience": "Who this course is for",
  "objectives": ["objective1", "objective2", "objective3"],
  "prerequisites": ["prereq1", "prereq2"]
}

Make it professional and aligned with the program context.`;

    const response = await fetch(`${API_URL}/aiAssistant/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxTokens: 1200 }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Course generation error:', responseText);
      throw new Error('Failed to generate course structure');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error('Invalid response format');
    }
    
    if (!data.success) throw new Error(data.error);

    // Clean markdown code blocks
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
      
      if (!parsed.title || !parsed.description) {
        throw new Error('Invalid course structure');
      }

      return parsed;
    } catch {
      throw new Error('Could not parse course structure');
    }
  } catch (error) {
    console.error('AI course generation failed, using fallback:', error);
    return generateFallbackCourseStructure(courseTitle, description, targetHours);
  }
},

// Generate Module structure
async generateModuleStructure(
  courseName: string,
  moduleCount: number,
  courseDescription?: string
) {
  try {
    const prompt = `Create a structured curriculum for a course titled "${courseName}". 
${courseDescription ? `Course description: ${courseDescription}` : ''}

Generate ${moduleCount} modules that progressively build knowledge from beginner to advanced concepts.

Return ONLY a valid JSON array of modules. Each module must have this exact structure:
[
  {
    "title": "Module 1: Introduction to [Topic]",
    "description": "Detailed description of what this module covers (2-3 sentences)",
    "order": number (1 for first module, 2 for second, etc.),
    "type": "core",
    "estimatedMinutes": number (60-2400 minutes typical),
    "learningObjectives": [
      "Specific objective 1",
      "Specific objective 2",
      "Specific objective 3"
    ],
    "sequenceLabel": "Week 1",
    "weekNumber": 1
  }
]

Guidelines:
- title: Clear, descriptive name with module number
- description: 2-3 sentences explaining the module content
- order: Sequential number starting from 1
- type: One of: "core", "project", "assessment", "capstone"
  * Use "core" for regular content modules (most common)
  * Use "project" for hands-on project modules
  * Use "assessment" for quiz/test modules
  * Use "capstone" for final project module (only last one if applicable)
- estimatedMinutes: Realistic time estimate (60-240 minutes typical)
- learningObjectives: 3-5 specific, measurable learning outcomes
- sequenceLabel: "Week X" or "Unit X" format
- weekNumber: Number matching the sequence

Ensure logical progression and comprehensive coverage of ${courseName}.`;

    const response = await fetch(`${API_URL}/aiAssistant/generate`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxTokens: 2000 }),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Module generation error:', responseText);
      throw new Error('Failed to generate module structure');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error('Invalid response format');
    }
    
    if (!data.success) throw new Error(data.error || 'Generation failed');

    // Clean markdown code blocks
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
      
      // Validate structure
      const modules = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate each module has required fields
      const validModules = modules.filter(module => 
        module.title && 
        module.description && 
        typeof module.order === 'number' &&
        module.type &&
        Array.isArray(module.learningObjectives)
      );

      if (validModules.length === 0) {
        throw new Error('No valid modules in response');
      }

      // Ensure proper ordering
      const sortedModules = validModules
        .sort((a, b) => a.order - b.order)
        .map((module, index) => ({
          ...module,
          order: index + 1, // Ensure sequential ordering
          type: module.type || 'core', // Default to core if missing
          estimatedMinutes: module.estimatedMinutes || 120, // Default 2 hours
          learningObjectives: module.learningObjectives || [],
          weekNumber: module.weekNumber || (index + 1),
          sequenceLabel: module.sequenceLabel || `Week ${index + 1}`
        }));

      return sortedModules;
    } catch (parseError) {
      console.error('Could not parse module structure:', parseError);
      throw new Error('Could not parse module structure');
    }
  } catch (error) {
    console.error('AI module generation failed, using fallback:', error);
    return generateFallbackModuleStructure(courseName, moduleCount, courseDescription);
  }
},



  // Local methods 
  suggestImprovements: aiService.suggestImprovements,
  getTemplates: () => aiService.templates,
  getTemplate: (type: keyof typeof aiService.templates, topic: string) => {
    return aiService.templates[type](topic);
  },
};

// Fallback function for program generation 
function generateFallbackProgramStructure(
  programTitle: string,
  category?: string,
  description?: string,
  targetDuration?: number
) {
  // Determine duration based on program title keywords
  let estimatedDuration = targetDuration || 12;
  const titleLower = programTitle.toLowerCase();
  
  if (titleLower.includes('bootcamp') || titleLower.includes('intensive')) {
    estimatedDuration = 16;
  } else if (titleLower.includes('fundamentals') || titleLower.includes('intro')) {
    estimatedDuration = 8;
  } else if (titleLower.includes('advanced') || titleLower.includes('master')) {
    estimatedDuration = 20;
  }

  // Estimate price based on duration
  const basePrice = 199;
  const estimatedPrice = basePrice + (estimatedDuration * 15);

  // Generate tags from program title
  const titleWords = programTitle.toLowerCase().split(/\s+/);
  const baseTags = titleWords
    .filter(word => word.length > 3)
    .slice(0, 3)
    .map(word => word.replace(/[^a-z0-9]/g, ''));

  return {
    name: programTitle,
    description: description || 
      `A comprehensive ${programTitle} program designed to build expertise from fundamentals to advanced concepts. ` +
      `Learn through hands-on projects, real-world examples, and expert instruction. ` +
      `Perfect for beginners and professionals looking to advance their skills.`,
    category: category || 'Technology',
    duration: estimatedDuration,
    price: Math.round(estimatedPrice),
    tags: [
      ...baseTags,
      'beginner-friendly',
      'hands-on',
      'project-based',
      'career-focused',
      'online-learning'
    ].slice(0, 8),
    learningOutcomes: [
      `Master the core concepts and fundamentals of ${programTitle}`,
      'Build real-world projects and practical applications',
      'Develop professional-level skills and best practices',
      'Prepare for career opportunities and certifications',
      'Learn industry-standard tools and techniques',
      'Gain confidence through hands-on experience'
    ],
    curriculumOverview: 
      `This comprehensive program takes you from beginner to advanced level in ${programTitle}. ` +
      `You'll start with foundational concepts, progress through intermediate topics with practical projects, ` +
      `and finish with advanced techniques used by industry professionals. ` +
      `Each module builds on the previous one, ensuring a smooth learning journey.`
  };
}

// Fallback function for course generation

function generateFallbackCourseStructure(
  courseTitle: string,
  description?: string,
  targetHours?: number
) {
  const estimatedHours = targetHours || 40;

  return {
    title: courseTitle,
    description: description || 
      `A comprehensive ${courseTitle} course designed to provide hands-on experience and practical skills. ` +
      `Learn through real-world examples, interactive exercises, and expert guidance.`,
    estimatedHours,
    targetAudience: `Anyone interested in learning ${courseTitle}, from beginners to intermediate learners looking to enhance their skills`,
    objectives: [
      `Master the fundamentals of ${courseTitle}`,
      'Apply concepts through hands-on projects',
      'Develop practical skills for real-world applications',
      'Build confidence through progressive learning',
      'Understand best practices and industry standards'
    ],
    prerequisites: [
      'Basic computer literacy',
      'Willingness to learn and practice',
      'Access to a computer with internet connection'
    ]
  };
}

// Fallback module structure generator
function generateFallbackModuleStructure(
  courseName: string, 
  moduleCount: number,
  courseDescription?: string
): any[] {
  const modules = [];
  const topics = [
    'Introduction & Fundamentals',
    'Core Concepts',
    'Advanced Techniques',
    'Practical Applications',
    'Best Practices',
    'Project Work',
    'Final Assessment'
  ];

  for (let i = 0; i < moduleCount; i++) {
    const topicIndex = Math.min(i, topics.length - 1);
    modules.push({
      title: `Module ${i + 1}: ${topics[topicIndex]}`,
      description: `This module covers ${topics[topicIndex].toLowerCase()} for ${courseName}. ` +
                   `Students will learn key concepts and develop practical skills through hands-on exercises.`,
      order: i + 1,
      type: i === moduleCount - 1 ? 'capstone' : 
            i === Math.floor(moduleCount * 0.66) ? 'project' : 'core',
      estimatedMinutes: 120,
      learningObjectives: [
        `Understand the fundamentals of ${topics[topicIndex].toLowerCase()}`,
        `Apply concepts in practical scenarios`,
        `Develop skills through guided exercises`
      ],
      weekNumber: i + 1,
      sequenceLabel: `Week ${i + 1}`
    });
  }

  return modules;
}