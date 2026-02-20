// app/dashboard/instructor/assessments/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import InstructorSidebar from "@/components/dashboard/InstructorSide";

import { 
  ArrowLeft, Edit3, Trash2, AlertCircle, 
  RefreshCw, Clock, Target, CheckCircle2, 
  XCircle, Send, Eye, BarChart3, Users
} from "lucide-react";
import Link from "next/link";

export default function ViewAssessmentPage() {
  const router = useRouter();
  const params = useParams();
const assessmentId = params.assessmentId as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }
    fetchAssessment();
  }, [authLoading, isAuthenticated, assessmentId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const res = await assessmentService.getById(assessmentId);
      if (res.success) {
        setAssessment(res.data);
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

  const handleTogglePublish = async () => {
    setPublishing(true);
    setError(null);

    try {
      const res = await assessmentService.admin.togglePublish(assessmentId);
      if (res.success) {
        setAssessment(res.data);
        setSuccessMessage(
          res.data.isPublished 
            ? "Assessment published successfully!" 
            : "Assessment unpublished."
        );
      } else {
        setError(res.message || "Failed to toggle publish status.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle publish status.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await assessmentService.admin.delete(assessmentId);
      if (res.success) {
        setSuccessMessage("Assessment deleted successfully!");
        setTimeout(() => router.push("/dashboard/instructor/assessments"), 1500);
      } else {
        setError(res.message || "Failed to delete assessment.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete assessment.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const totalPoints = assessment?.questions?.reduce((acc: number, q: any) => acc + (q.points || 0), 0) || 0;

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <RefreshCw className="animate-spin text-emerald-400" size={32} />
    </div>
  );

  if (!assessment) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <div className="flex-1 lg:ml-64 overflow-y-auto relative">
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-gray-800 px-8 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/instructor/assessments" 
                className="p-2 hover:bg-slate-800 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{assessment.title}</h1>
                <p className="text-xs text-gray-500">
                  {assessment.isPublished ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Published
                    </span>
                  ) : (
                    <span className="text-yellow-400 flex items-center gap-1">
                      <XCircle size={12} /> Draft
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePublish}
                disabled={publishing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold shadow-lg ${
                  assessment.isPublished
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {publishing ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : assessment.isPublished ? (
                  <Eye size={16} />
                ) : (
                  <Send size={16} />
                )}
                {assessment.isPublished ? 'Unpublish' : 'Publish'}
              </button>

              <Link
                href={`/dashboard/instructor/assessments/${assessmentId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-blue-500/20"
              >
                <Edit3 size={16} />
                Edit
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-red-500/20"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
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

        {/* Content */}
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/40 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BarChart3 size={20} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{assessment.questions?.length || 0}</p>
              <p className="text-xs text-gray-500 uppercase">Questions</p>
            </div>

            <div className="bg-slate-800/40 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Target size={20} className="text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{totalPoints}</p>
              <p className="text-xs text-gray-500 uppercase">Total Points</p>
            </div>

            <div className="bg-slate-800/40 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock size={20} className="text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{assessment.duration || 0}</p>
              <p className="text-xs text-gray-500 uppercase">Minutes</p>
            </div>

            <div className="bg-slate-800/40 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-yellow-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{assessment.passingScore}%</p>
              <p className="text-xs text-gray-500 uppercase">To Pass</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-800/40 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">{assessment.title}</h2>
            <p className="text-gray-400 mb-6">
              {assessment.description || "No description provided."}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-gray-300">
                {assessment.type?.toUpperCase()}
              </span>
              <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-gray-300">
                Course: {assessment.courseId?.title || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Questions Preview</h3>
            
            {assessment.questions?.map((q: any, i: number) => (
              <div key={i} className="bg-slate-800/20 border border-gray-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 text-xs font-bold uppercase">
                    Question {i+1} of {assessment.questions.length}
                  </p>
                  <span className="text-xs font-bold text-emerald-400">
                    {q.points} {q.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
                
                <h3 className="text-xl text-white font-medium mb-8">
                  {q.questionText}
                </h3>
                
                <div className="space-y-3">
                  {q.options?.map((opt: string, oIdx: number) => (
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
                      <span className="text-gray-300">{opt}</span>
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Delete Assessment?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This action cannot be undone. All questions and student submissions will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}