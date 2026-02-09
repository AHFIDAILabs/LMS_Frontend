// services/aiService.ts

export const aiService = {
  // Generate lesson outline
  generateLessonOutline: (topic: string, duration: number, type: string = 'reading') => {
    const sections = Math.ceil(duration / 15);
    
    return {
      title: `${topic}`,
      description: `A comprehensive ${type} lesson covering ${topic}. Learn the fundamentals and practical applications.`,
      learningObjectives: [
        `Understand the core concepts of ${topic}`,
        `Apply ${topic} principles in real-world scenarios`,
        `Build confidence in working with ${topic}`,
        `Master best practices and common patterns`,
      ],
      content: `# ${topic}

## Introduction

Welcome to this lesson on ${topic}. By the end of this lesson, you'll have a solid understanding of the key concepts and be ready to apply them in practice.

## Learning Objectives

After completing this lesson, you will be able to:
- Understand the fundamentals of ${topic}
- Identify key use cases and applications
- Implement solutions using ${topic}
- Follow best practices and avoid common pitfalls

${Array.from(
  { length: sections },
  (_, i) => `## Section ${i + 1}: Key Concept ${i + 1}

### Overview
This section covers important aspects of ${topic}.

### Main Points
- Key point 1
- Key point 2
- Key point 3

### Examples
\`\`\`
// Example code or content here
\`\`\`

### Practice Exercise
Try implementing what you've learned in this section.
`
).join('\n')}

## Summary

In this lesson, we covered:
- The fundamentals of ${topic}
- Practical applications and use cases
- Best practices and common patterns

## Next Steps

- Review the key concepts
- Complete the practice exercises
- Apply what you've learned in a real project

## Additional Resources

- Resource 1: Further reading
- Resource 2: Video tutorial
- Resource 3: Documentation
`,
      estimatedMinutes: duration,
      type: type,
    };
  },

  // Generate module structure
  generateModuleStructure: (courseName: string, moduleCount: number, courseDescription?: string) => {
    const moduleTopics = [
      'Introduction and Fundamentals',
      'Core Concepts',
      'Practical Applications',
      'Advanced Techniques',
      'Best Practices',
      'Real-world Projects',
      'Testing and Debugging',
      'Optimization and Performance',
      'Security Considerations',
      'Final Project and Review',
    ];

    return Array.from({ length: moduleCount }, (_, i) => ({
      title: `Module ${i + 1}: ${moduleTopics[i] || `Advanced ${courseName} Topics`}`,
      description: `Learn essential concepts and skills in ${moduleTopics[i]?.toLowerCase() || 'advanced topics'}. Build practical expertise through hands-on examples.`,
      order: i + 1,
      type: 'core',
      estimatedMinutes: 120,
      learningObjectives: [
        `Master key concepts in ${moduleTopics[i]?.toLowerCase()}`,
        'Apply learned skills to real-world scenarios',
        'Build confidence through practice exercises',
      ],
    }));
  },

  // Generate quiz questions
  generateQuizQuestions: (topic: string, count: number = 5) => {
    const questionTypes = [
      { type: 'multiple-choice', difficulty: 'easy' },
      { type: 'multiple-choice', difficulty: 'medium' },
      { type: 'true-false', difficulty: 'easy' },
      { type: 'multiple-choice', difficulty: 'hard' },
      { type: 'multiple-choice', difficulty: 'medium' },
    ];

    return Array.from({ length: count }, (_, i) => ({
      question: `Question ${i + 1}: What is an important concept in ${topic}?`,
      type: questionTypes[i]?.type || 'multiple-choice',
      difficulty: questionTypes[i]?.difficulty || 'medium',
      options: ['Option A - First answer', 'Option B - Second answer', 'Option C - Third answer', 'Option D - Fourth answer'],
      correctAnswer: 0,
      explanation: `This question tests your understanding of ${topic}. The correct answer demonstrates key knowledge of the topic.`,
      points: questionTypes[i]?.difficulty === 'hard' ? 3 : questionTypes[i]?.difficulty === 'medium' ? 2 : 1,
    }));
  },

  // Improve content suggestions
  suggestImprovements: (content: string) => {
    const suggestions = [];
    
    if (content.length < 100) {
      suggestions.push({
        type: 'length',
        message: 'Consider adding more detailed explanations (current: ' + content.length + ' chars)',
        priority: 'high',
      });
    }
    
    if (!content.includes('#')) {
      suggestions.push({
        type: 'structure',
        message: 'Add section headers (# ## ###) for better organization',
        priority: 'high',
      });
    }
    
    if (!content.includes('```')) {
      suggestions.push({
        type: 'examples',
        message: 'Include code examples or snippets to illustrate concepts',
        priority: 'medium',
      });
    }

    if (!content.toLowerCase().includes('example')) {
      suggestions.push({
        type: 'examples',
        message: 'Add practical examples to reinforce learning',
        priority: 'medium',
      });
    }

    if (!content.toLowerCase().includes('exercise') && !content.toLowerCase().includes('practice')) {
      suggestions.push({
        type: 'practice',
        message: 'Include practice exercises for hands-on learning',
        priority: 'medium',
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'quality',
        message: 'Content looks good! Consider adding more examples or exercises.',
        priority: 'low',
      });
    }
    
    return suggestions;
  },

  // Content templates
  templates: {
    videoLesson: (topic: string) => `# ${topic}

## Video Overview
[Video will be embedded here - Duration: X minutes]

### What You'll Learn
- Key concept 1
- Key concept 2
- Key concept 3

## Before You Start
Make sure you have:
- Prerequisite 1
- Prerequisite 2

## Key Points from the Video

### Timestamp 0:00 - Introduction
Brief overview of what this video covers.

### Timestamp X:XX - Main Concept 1
- Important point 1
- Important point 2

### Timestamp X:XX - Main Concept 2
- Important point 1
- Important point 2

### Timestamp X:XX - Practical Example
Working example demonstrating the concepts.

## Practice Exercise
Now it's your turn! Try implementing what you learned:

1. Step 1
2. Step 2
3. Step 3

## Additional Resources
- [Resource 1](link)
- [Resource 2](link)
- [Documentation](link)

## Next Steps
Continue to the next lesson or review this content if needed.
`,
    
    codingLesson: (topic: string) => `# ${topic}

## Learning Objectives
By the end of this lesson, you will be able to:
- Objective 1
- Objective 2
- Objective 3

## Prerequisites
Before starting, make sure you understand:
- Prerequisite concept 1
- Prerequisite concept 2

## Setup

### Installation
\`\`\`bash
# Install required packages
npm install package-name
# or
yarn add package-name
\`\`\`

### Project Structure
\`\`\`
project/
├── src/
│   ├── index.js
│   └── utils.js
└── package.json
\`\`\`

## Core Concepts

### Concept 1: [Name]
Explanation of the first concept...

\`\`\`javascript
// Example implementation
function example() {
  // Your code here
}
\`\`\`

### Concept 2: [Name]
Explanation of the second concept...

\`\`\`javascript
// Another example
const example = () => {
  // Implementation
}
\`\`\`

## Hands-On Exercise

### Task
Build a simple application that demonstrates these concepts.

### Requirements
1. Requirement 1
2. Requirement 2
3. Requirement 3

### Starter Code
\`\`\`javascript
// Start here
function starter() {
  // TODO: Implement your solution
}
\`\`\`

### Hints
- Hint 1
- Hint 2

## Solution

### Approach
Here's one way to solve this problem...

\`\`\`javascript
// Complete solution
function solution() {
  // Implementation
  return result;
}
\`\`\`

### Explanation
The solution works by...

## Best Practices
- Practice 1: Why it matters
- Practice 2: Why it matters
- Practice 3: Why it matters

## Common Mistakes to Avoid
- ❌ Mistake 1: Why to avoid
- ❌ Mistake 2: Why to avoid
- ✅ Correct approach instead

## Further Reading
- [Official Documentation](link)
- [Advanced Tutorial](link)
- [Community Resources](link)
`,

    readingLesson: (topic: string) => `# ${topic}

## Overview
This lesson provides a comprehensive introduction to ${topic}. You'll learn the fundamental concepts and how to apply them in practice.

## Estimated Reading Time
15-20 minutes

## What You'll Learn
- [ ] Concept 1
- [ ] Concept 2
- [ ] Concept 3
- [ ] Concept 4

---

## Introduction

${topic} is an important concept because...

### Why This Matters
Understanding ${topic} helps you:
1. Benefit 1
2. Benefit 2
3. Benefit 3

---

## Section 1: Fundamentals

### Key Concept 1
Detailed explanation of the first key concept...

**Important Note:** Remember that...

### Key Concept 2
Detailed explanation of the second key concept...

> 💡 **Pro Tip:** Here's a useful insight...

---

## Section 2: Practical Applications

### Real-World Example 1
Here's how ${topic} is used in real scenarios...

### Real-World Example 2
Another practical application...

---

## Section 3: Best Practices

### Do's
✅ Best practice 1
✅ Best practice 2
✅ Best practice 3

### Don'ts
❌ Common mistake 1
❌ Common mistake 2
❌ Common mistake 3

---

## Quick Reference

| Term | Definition |
|------|------------|
| Term 1 | Definition 1 |
| Term 2 | Definition 2 |
| Term 3 | Definition 3 |

---

## Summary

In this lesson, we covered:
- Summary point 1
- Summary point 2
- Summary point 3

### Key Takeaways
1. Main takeaway 1
2. Main takeaway 2
3. Main takeaway 3

---

## Check Your Understanding

Test yourself with these questions:

1. **Question 1:** What is...?
2. **Question 2:** Why is...?
3. **Question 3:** How does...?

<details>
<summary>Click to see answers</summary>

1. Answer to question 1
2. Answer to question 2
3. Answer to question 3
</details>

---

## Additional Resources

### Further Reading
- [Resource 1](link)
- [Resource 2](link)

### Video Tutorials
- [Video 1](link)
- [Video 2](link)

### Practice Exercises
- [Exercise 1](link)
- [Exercise 2](link)

---

## Next Steps
Ready to move on? Continue to the next lesson or review this content if needed.
`,

    assignment: (topic: string) => `# ${topic} - Assignment

## Objective
This assignment will test your understanding of ${topic} and your ability to apply what you've learned.

## Due Date
[Set due date]

## Estimated Time
2-3 hours

---

## Learning Outcomes
After completing this assignment, you will demonstrate:
- [ ] Outcome 1
- [ ] Outcome 2
- [ ] Outcome 3

---

## Instructions

### Part 1: [Task Name] (40 points)

#### Requirements
1. Requirement 1
2. Requirement 2
3. Requirement 3

#### Deliverables
- Deliverable 1
- Deliverable 2

---

### Part 2: [Task Name] (30 points)

#### Requirements
1. Requirement 1
2. Requirement 2

#### Deliverables
- Deliverable 1
- Deliverable 2

---

### Part 3: [Task Name] (30 points)

#### Requirements
1. Requirement 1
2. Requirement 2

#### Deliverables
- Deliverable 1

---

## Submission Guidelines

### Format
- Submit as: [PDF/ZIP/Link]
- File naming: [lastname_firstname_assignment1]

### What to Include
1. All source code files
2. README with instructions
3. Screenshots or demo video (if applicable)
4. Written reflection (200-300 words)

### Where to Submit
Upload to [LMS platform/email/repository]

---

## Grading Criteria

| Criteria | Points | Description |
|----------|--------|-------------|
| Functionality | 40 | Code works as expected |
| Code Quality | 20 | Clean, well-organized code |
| Documentation | 15 | Clear comments and README |
| Creativity | 15 | Original approach or features |
| Submission | 10 | On time, properly formatted |
| **Total** | **100** | |

---

## Tips for Success

✅ **Do:**
- Start early
- Test your code thoroughly
- Ask questions if stuck
- Document your work

❌ **Don't:**
- Wait until the last minute
- Copy code without understanding
- Skip the documentation
- Forget to test edge cases

---

## Resources

### Helpful Links
- [Documentation](link)
- [Tutorial](link)
- [Example Project](link)

### Need Help?
- Office hours: [Times]
- Discussion forum: [Link]
- Email: [instructor@email.com]

---

## Academic Integrity
Remember to:
- Write your own code
- Cite any resources used
- Collaborate ethically (if group work is allowed)

Plagiarism will result in a zero grade and academic consequences.

---

## Bonus Challenge (Optional, +10 points)
For extra credit, try implementing:
- Advanced feature 1
- Advanced feature 2

Good luck! 🚀
`,
  },
};