// app/dashboard/instructor/assessments/[id]/edit/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import { instructorService } from "@/services/instructorService";
import { hybridAIService } from "@/services/hybridAIService";
import InstructorSidebar from "@/components/dashboard/InstructorSide";

import { 
  ICreateAssessment, 
  QuestionType, 
  AssessmentType, 
  IQuestion 
} from "@/types/assessments";

import { 
  ArrowLeft, Save, Sparkles, Plus, Trash2, 
  AlertCircle, RefreshCw, Eye, Edit3, 
  Clock, Target, Wand2, CheckCircle2, Send
} from "lucide-react";
import Link from "next/link";

export default function EditAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuestionCount, setAIQuestionCount] = useState(5);

  const [formData, setFormData] = useState<ICreateAssessment & { isPublished?: boolean }>({
    courseId: "",
    title: "",
    description: "",
    type: AssessmentType.QUIZ,
    passingScore: 70,
    duration: 60,
    questions: [],
  });

  const totalPoints = useMemo(() => 
    formData.questions.reduce((acc, q) => acc + (q.points || 0), 0), 
  [formData.questions]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [authLoading, isAuthenticated, assessmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, assessmentRes] = await Promise.all([
        instructorService.getCourses(),
        assessmentService.getById(assessmentId)
      ]);

      if (coursesRes.success) setCourses(coursesRes.data);
      
      if (assessmentRes.success) {
        const assessment = assessmentRes.data;
        setFormData({
          courseId: assessment.courseId?._id || assessment.courseId || "",
          title: assessment.title,
          description: assessment.description || "",
          type: assessment.type,
          passingScore: assessment.passingScore,
          duration: assessment.duration || 60,
          questions: assessment.questions || [],
          isPublished: assessment.isPublished
        });
      } else {
        setError("Assessment not found");
        setTimeout(() => router.push("/dashboard/instructor/assessments"), 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAIGenerate = async (mode: 'replace' | 'append' = 'replace') => {
    if (!formData.title) {
      setError("Enter a title first to guide the AI.");
      return;
    }
    
    if (aiQuestionCount < 1 || aiQuestionCount > 50) {
      setError("Please select between 1 and 50 questions.");
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      setShowAIModal(false);
      
      const aiQuestions = await hybridAIService.generateQuizQuestions(
        formData.title, 
        aiQuestionCount
      );
      
      const formatted: IQuestion[] = aiQuestions.map((q: any) => ({
        questionText: q.question,
        type: QuestionType.MULTIPLE_CHOICE, 
        points: q.points || 5,
        options: q.options || ["", "", "", ""],
        correctAnswer: String(q.correctAnswer || "0"),
        explanation: q.explanation || ""
      }));

      if (mode === 'append') {
        setFormData(prev => ({ 
          ...prev, 
          questions: [...prev.questions, ...formatted] 
        }));
        setSuccessMessage(`Added ${formatted.length} AI-generated questions!`);
      } else {
        setFormData(prev => ({ ...prev, questions: formatted }));
        setSuccessMessage(`Generated ${formatted.length} new questions!`);
      }
      
    } catch (err: any) {
      console.error('AI generation error:', err);
      setError(err.message || "AI was unable to generate content for this topic.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: IQuestion = { 
      questionText: "", 
      type: QuestionType.MULTIPLE_CHOICE, 
      points: 5, 
      options: ["", "", "", ""], 
      correctAnswer: "0", 
      explanation: "" 
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, field: keyof IQuestion, value: any) => {
    const updated = [...formData.questions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...formData.questions];
    const options = [...(updated[qIndex].options || [])];
    options[oIndex] = value;
    updated[qIndex].options = options;
    setFormData({ ...formData, questions: updated });
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length === 1) {
      setError("Assessment must have at least one question.");
      return;
    }
    setFormData({
      ...formData, 
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseId) {
      setError("Please link this to a course.");
      return;
    }

    const hasEmptyQuestions = formData.questions.some(q => !q.questionText.trim());
    if (hasEmptyQuestions) {
      setError("Please fill in all question texts.");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Remove isPublished from update payload
      const { isPublished, ...updateData } = formData;
      
      const res = await assessmentService.admin.update(assessmentId, updateData);
      if (res.success) {
        setSuccessMessage("Assessment updated successfully!");
        setTimeout(() => router.push("/dashboard/instructor/assessments"), 1500);
      } else {
        setError(res.message || "Failed to update assessment.");
      }
    } catch (err: any) {
      setError(err.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

// In both view and edit pages, update handleTogglePublish:

const handleTogglePublish = async () => {
  // Check if we have questions
  if (!formData.questions || formData.questions.length === 0) {
    setError("Cannot publish an assessment without questions.");
    return;
  }

  // Check if all questions are complete
  const hasEmptyQuestions = formData.questions.some((q: any) => !q.questionText?.trim());
  if (hasEmptyQuestions) {
    setError("Please complete all questions before publishing.");
    return;
  }

  setPublishing(true);
  setError(null);

  try {
    const res = await assessmentService.admin.togglePublish(assessmentId);
    
    console.log('Publish response:', res); // Debug log
    
    if (res.success) {
      // Update local state
      setFormData(prev => ({ ...prev, isPublished: res.data.isPublished }));
      
      setSuccessMessage(
        res.data.isPublished 
          ? "Assessment published successfully! Students can now access it." 
          : "Assessment unpublished. Students can no longer access it."
      );
    } else {
      // Show the actual error from backend
      setError( res.message || "Failed to toggle publish status.");
    }
  } catch (err: any) {
    console.error('Publish error:', err);
    setError(err.message || "Failed to toggle publish status.");
  } finally {
    setPublishing(false);
  }
};

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <RefreshCw className="animate-spin text-emerald-400" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <div className="flex-1 lg:ml-64 overflow-y-auto relative">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-gray-800 px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/instructor/assessments" 
              className="p-2 hover:bg-slate-800 rounded-full text-gray-400 hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Edit Assessment</h1>
              <p className="text-xs text-gray-500">
                {formData.isPublished ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Published
                  </span>
                ) : (
                  <span className="text-yellow-400">Draft</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={publishing || submitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold shadow-lg ${
                formData.isPublished
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {publishing ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : formData.isPublished ? (
                <Eye size={16} />
              ) : (
                <Send size={16} />
              )}
              {formData.isPublished ? 'Unpublish' : 'Publish'}
            </button>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
            >
              {viewMode === 'edit' ? <Eye size={16} /> : <Edit3 size={16} />}
              {viewMode === 'edit' ? 'Preview' : 'Edit'}
            </button>

            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold shadow-lg shadow-purple-500/20"
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              AI Generate
            </button>
          </div>
        </div>

        {/* Messages */}
        {(error || successMessage) && (
          <div className="max-w-5xl mx-auto px-8 pt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 text-red-400 animate-in slide-in-from-top">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 flex items-center gap-3 text-emerald-400 animate-in slide-in-from-top">
                <CheckCircle2 size={20} />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
          </div>
        )}

        <div className="max-w-5xl mx-auto p-8">
          {viewMode === 'edit' ? (
            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <section className="bg-slate-800/40 border border-gray-800 rounded-2xl p-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Basic Info
                    </label>
                    <input
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Assessment Title"
                      className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-700 focus:outline-none mb-4"
                    />
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Add instructions or description..."
                      className="w-full bg-transparent text-gray-400 resize-none focus:outline-none border-l-2 border-gray-800 pl-4"
                      rows={3}
                    />
                  </section>

                  {/* Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold text-lg">
                        Questions ({formData.questions.length})
                      </h3>
                      <div className="text-gray-500 text-sm font-medium">
                        Total Points: <span className="text-emerald-400 font-bold">{totalPoints}</span>
                      </div>
                    </div>

                    {formData.questions.map((q, idx) => (
                      <div key={idx} className="bg-slate-800/30 border border-gray-800 rounded-2xl p-6 group relative hover:border-gray-700 transition-all">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400 border border-gray-800">
                              {idx + 1}
                            </span>
                            <input 
                              type="number"
                              min="1"
                              max="100"
                              value={q.points}
                              onChange={e => updateQuestion(idx, 'points', Number(e.target.value))}
                              className="w-16 bg-slate-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-300 text-center"
                              title="Points"
                            />
                            <span className="text-xs text-gray-500">pts</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeQuestion(idx)}
                            className="text-gray-600 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <input 
                          value={q.questionText}
                          onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                          placeholder="Enter question text..."
                          className="w-full bg-transparent text-lg text-white font-medium mb-6 focus:outline-none border-b border-gray-800 pb-2 focus:border-emerald-500/50 transition-all"
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {q.options?.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                q.correctAnswer === String(oIdx) 
                                  ? 'bg-emerald-500/10 border-emerald-500/50' 
                                  : 'bg-slate-900/50 border-gray-800 hover:border-gray-700'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name={`correct-${idx}`}
                                checked={q.correctAnswer === String(oIdx)}
                                onChange={() => updateQuestion(idx, 'correctAnswer', String(oIdx))}
                                className="accent-emerald-500 w-4 h-4 cursor-pointer"
                              />
                              <input 
                                value={opt}
                                onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                className="bg-transparent text-sm text-gray-300 w-full focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        <textarea
                          value={q.explanation || ''}
                          onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
                          placeholder="Explanation (optional)"
                          className="w-full bg-slate-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 resize-none focus:outline-none focus:border-gray-700 transition-all"
                          rows={2}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      <Plus size={20} /> Add Question Manually
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-slate-800/40 border border-gray-800 rounded-2xl p-6 space-y-6 sticky top-24">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Target size={18} className="text-emerald-400" /> 
                      Settings
                    </h4>
                    
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                        Course
                      </label>
                      <select
                        required
                        value={formData.courseId}
                        onChange={e => setFormData({...formData, courseId: e.target.value})}
                        className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                      >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                          <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                          Passing %
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={formData.passingScore} 
                          onChange={e => setFormData({...formData, passingScore: Number(e.target.value)})}
                          className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                          Duration (min)
                        </label>
                        <input 
                          type="number" 
                          min="1"
                          value={formData.duration} 
                          onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                          className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || publishing}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* PREVIEW MODE - Same as create page */
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-slate-800/40 border border-gray-800 rounded-3xl p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {formData.title || "Untitled Assessment"}
                </h2>
                <p className="text-gray-400 mb-6">
                  {formData.description || "No description provided."}
                </p>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Clock size={16}/> {formData.duration} Minutes
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Target size={16}/> {formData.passingScore}% to Pass
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sparkles size={16}/> {totalPoints} Total Points
                  </div>
                </div>
              </div>

              {formData.questions.map((q, i) => (
                <div key={i} className="bg-slate-800/20 border border-gray-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500 text-xs font-bold uppercase">
                      Question {i+1} of {formData.questions.length}
                    </p>
                    <span className="text-xs font-bold text-emerald-400">
                      {q.points} {q.points === 1 ? 'point' : 'points'}
                    </span>
                  </div>
                  <h3 className="text-xl text-white font-medium mb-8">
                    {q.questionText || "Question text"}
                  </h3>
                  <div className="space-y-3">
                    {q.options?.map((opt, oIdx) => (
                      <div 
                        key={oIdx} 
                        className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                          q.correctAnswer === String(oIdx)
                            ? 'border-emerald-500/50 bg-emerald-500/5'
                            : 'border-gray-800 bg-slate-900/30'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-gray-300">{opt || `Option ${oIdx + 1}`}</span>
                        {q.correctAnswer === String(oIdx) && (
                          <span className="ml-auto text-xs font-bold text-emerald-400">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/30 rounded-lg">
                      <p className="text-xs font-bold text-blue-400 uppercase mb-2">Explanation</p>
                      <p className="text-sm text-gray-400">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Modal - Same as create page */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Question Generator</h3>
                <p className="text-sm text-gray-400">Generate quiz questions automatically</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">
                  How many questions?
                </label>
                <input 
                  type="number"
                  min="1"
                  max="50"
                  value={aiQuestionCount}
                  onChange={e => setAIQuestionCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg font-bold text-center focus:border-purple-500/50 focus:outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Between 1 and 50 questions</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAIGenerate('replace')}
                  disabled={isGenerating}
                  className="flex-1 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  Replace All
                </button>
                <button
                  onClick={() => handleAIGenerate('append')}
                  disabled={isGenerating}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  Add to Existing
                </button>
              </div>

              <button
                onClick={() => setShowAIModal(false)}
                className="w-full py-2 text-gray-400 hover:text-white transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}