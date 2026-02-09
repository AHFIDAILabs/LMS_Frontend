// components/AIAssistant.tsx
'use client'

import { useState } from 'react'
import { Sparkles, X, Lightbulb, FileText, Code, CheckSquare, Loader2, Wand2 } from 'lucide-react'
import { hybridAIService } from '@/services/hybridAIService'

interface AIAssistantProps {
  context: 'lesson' | 'module' | 'course' | 'quiz'
  onApplySuggestion: (suggestion: any) => void
  contextData?: {
    topic?: string
    duration?: number
    type?: string
    courseName?: string
    moduleCount?: number
    content?: string
  }
}

export default function AIAssistant({ context, onApplySuggestion, contextData }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'generate' | 'improve' | 'templates'>('generate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateContent = async (type: string) => {
    setLoading(true)
    setError(null)

    try {
      let suggestion;
      
      switch (type) {
        case 'lesson-ai':
          if (!contextData?.topic || !contextData?.duration || !contextData?.type) {
            setError('Please fill in topic, duration, and type first');
            return;
          }
          suggestion = await hybridAIService.generateLessonContent(
            contextData.topic,
            contextData.duration,
            contextData.type
          );
          break;

        case 'lesson-template':
          suggestion = {
            title: contextData?.topic || 'Sample Topic',
            description: 'A comprehensive lesson',
            learningObjectives: ['Objective 1', 'Objective 2'],
            content: hybridAIService.getTemplate('readingLesson', contextData?.topic || 'Topic'),
            estimatedMinutes: contextData?.duration || 30,
            type: contextData?.type || 'reading',
          };
          break;

        case 'quiz':
          if (!contextData?.topic) {
            setError('Please provide a topic first');
            return;
          }
          const questions = await hybridAIService.generateQuizQuestions(contextData.topic, 5);
          suggestion = { questions };
          break;

        case 'module':
          if (!contextData?.courseName || !contextData?.moduleCount) {
            setError('Please provide course name and module count');
            return;
          }
          const modules = await hybridAIService.generateModuleStructure(
            contextData.courseName,
            contextData.moduleCount
          );
          suggestion = { modules };
          break;

        default:
          return;
      }
      
      onApplySuggestion(suggestion);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleImproveContent = async () => {
    if (!contextData?.content) {
      setError('No content to improve');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const improved = await hybridAIService.improveContent(contextData.content);
      onApplySuggestion({ content: improved });
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to improve content');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (templateType: string) => {
    const template = hybridAIService.getTemplate(
      templateType as any,
      contextData?.topic || 'Your Topic'
    );
    onApplySuggestion({ content: template });
    setIsOpen(false);
  };

  const suggestions = contextData?.content 
    ? hybridAIService.suggestImprovements(contextData.content)
    : [];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 rounded-full shadow-lg hover:shadow-xl transition-all z-50 hover:scale-110"
        title="AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-slate-900 border border-gray-800 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
            <Sparkles className="w-4 h-4 text-slate-900" />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-400">Powered by Groq</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'generate'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Wand2 className="w-4 h-4 mx-auto mb-1" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 mx-auto mb-1" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('improve')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'improve'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4 mx-auto mb-1" />
          Improve
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="ml-3 text-gray-400">Generating content...</span>
          </div>
        )}

        {!loading && activeTab === 'generate' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-4">
              🤖 AI-powered content generation
            </p>
            
            {context === 'lesson' && (
              <>
                <button
                  onClick={() => handleGenerateContent('lesson-ai')}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 hover:from-emerald-400/20 hover:to-cyan-400/20 border border-emerald-400/20 rounded-lg transition-all text-left disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">AI Generated Lesson</p>
                    <p className="text-xs text-gray-400">Complete lesson with AI</p>
                  </div>
                </button>

                <button
                  onClick={() => handleGenerateContent('lesson-template')}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Quick Template</p>
                    <p className="text-xs text-gray-400">Instant structured outline</p>
                  </div>
                </button>
              </>
            )}

            {context === 'quiz' && (
              <button
                onClick={() => handleGenerateContent('quiz')}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 hover:from-emerald-400/20 hover:to-cyan-400/20 border border-emerald-400/20 rounded-lg transition-all text-left disabled:opacity-50"
              >
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Generate Quiz</p>
                  <p className="text-xs text-gray-400">5 AI-generated questions</p>
                </div>
              </button>
            )}

            {context === 'course' && (
              <button
                onClick={() => handleGenerateContent('module')}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 hover:from-emerald-400/20 hover:to-cyan-400/20 border border-emerald-400/20 rounded-lg transition-all text-left disabled:opacity-50"
              >
                <Lightbulb className="w-5 h-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Course Structure</p>
                  <p className="text-xs text-gray-400">AI-powered curriculum</p>
                </div>
              </button>
            )}
          </div>
        )}

        {!loading && activeTab === 'templates' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-4">
              📝 Ready-to-use templates
            </p>
            
            {Object.entries(hybridAIService.getTemplates()).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleApplyTemplate(key)}
                className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <Code className="w-5 h-5 text-cyan-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-gray-400">Instant structure</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && activeTab === 'improve' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-4">
              ✨ Content suggestions
            </p>

            {contextData?.content && (
              <button
                onClick={handleImproveContent}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-400/10 to-pink-400/10 hover:from-purple-400/20 hover:to-pink-400/20 border border-purple-400/20 rounded-lg transition-all text-left disabled:opacity-50 mb-4"
              >
                <Wand2 className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">AI Improve Content</p>
                  <p className="text-xs text-gray-400">Enhance with AI</p>
                </div>
              </button>
            )}

            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    suggestion.priority === 'high'
                      ? 'bg-red-400/10 border-red-400/20'
                      : suggestion.priority === 'medium'
                      ? 'bg-yellow-400/10 border-yellow-400/20'
                      : 'bg-blue-400/10 border-blue-400/20'
                  }`}
                >
                  <p className="text-sm text-gray-300">{suggestion.message}</p>
                  <span
                    className={`text-xs font-medium ${
                      suggestion.priority === 'high'
                        ? 'text-red-400'
                        : suggestion.priority === 'medium'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {suggestion.type.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  {contextData?.content
                    ? 'Content looks great! ✨'
                    : 'Add content to get improvement suggestions'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 bg-slate-800/50">
        <p className="text-xs text-center text-gray-500">
          💡 Tip: Fill in the form first for better AI suggestions
        </p>
      </div>
    </div>
  );
}