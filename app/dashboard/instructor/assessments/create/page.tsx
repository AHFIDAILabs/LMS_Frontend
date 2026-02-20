"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import { instructorService } from "@/services/instructorService";
import { hybridAIService } from "@/services/hybridAIService";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { ICreateAssessment, QuestionType, AssessmentType, IQuestion } from "@/types/assessments";

import {
  ArrowLeft, Save, Sparkles, Plus, Trash2,
  AlertCircle, RefreshCw, Eye, Edit3, Clock,
  Target, Wand2, CheckSquare, FileText, Code,
  Award, AlignLeft, BookOpen, Braces, ToggleLeft,
  Calendar, Github, Upload, Star, Layers, Package,
  Milestone, BadgeCheck, Users, Globe, X, ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────
// EXTENDED TYPES
// ─────────────────────────────────────────────────────────

interface IProjectOption {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  techStack: string[];
  deliverables: string[];
}

interface ICapstoneMilestone {
  id: string;
  title: string;
  description: string;
  dueWeek: number;
  points: number;
  deliverables: string[];
}

interface IRubricCriterion {
  id: string;
  criterion: string;
  description: string;
  maxPoints: number;
  levels: { label: string; points: number; description: string }[];
}

interface IExtendedFormData extends ICreateAssessment {
  projectOptions?: IProjectOption[];
  allowCustomProject?: boolean;
  submissionType?: "github" | "url" | "file" | "all";
  rubric?: IRubricCriterion[];
  milestones?: ICapstoneMilestone[];
  capstoneBrief?: string;
  presentationRequired?: boolean;
  endDate?: Date;
}

// ─────────────────────────────────────────────────────────
// CONFIGS
// ─────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  [AssessmentType.QUIZ]: {
    icon: CheckSquare,
    label: "Quiz",
    tagline: "Timed test, auto-graded",
    accent: "#3b82f6",
    accentBg: "rgba(59,130,246,0.07)",
    accentBorder: "rgba(59,130,246,0.25)",
    description: "Multiple choice and true/false questions graded instantly on submission.",
    allowedQTypes: [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE],
    defaultQ: (): IQuestion => ({
      questionText: "", type: QuestionType.MULTIPLE_CHOICE, points: 5,
      options: ["", "", "", ""], correctAnswer: "0", explanation: "",
    }),
    showDuration: true, showAttempts: true, showDeadline: false,
  },
  [AssessmentType.ASSIGNMENT]: {
    icon: FileText,
    label: "Assignment",
    tagline: "Written tasks, manually graded",
    accent: "#a855f7",
    accentBg: "rgba(168,85,247,0.07)",
    accentBorder: "rgba(168,85,247,0.25)",
    description: "Short answer and essay questions reviewed and graded by the instructor.",
    allowedQTypes: [QuestionType.SHORT_ANSWER, QuestionType.ESSAY, QuestionType.MULTIPLE_CHOICE],
    defaultQ: (): IQuestion => ({
      questionText: "", type: QuestionType.SHORT_ANSWER, points: 10,
      correctAnswer: "", explanation: "",
    }),
    showDuration: false, showAttempts: false, showDeadline: true,
  },
  [AssessmentType.PROJECT]: {
    icon: Code,
    label: "Project",
    tagline: "Build a real deliverable",
    accent: "#f97316",
    accentBg: "rgba(249,115,22,0.07)",
    accentBorder: "rgba(249,115,22,0.25)",
    description: "Students choose a project to build and submit a GitHub repo, live URL, or file.",
    allowedQTypes: [] as QuestionType[],
    defaultQ: (): IQuestion => ({ questionText: "", type: QuestionType.CODING, points: 0 }),
    showDuration: false, showAttempts: false, showDeadline: true,
  },
  [AssessmentType.CAPSTONE]: {
    icon: Award,
    label: "Capstone",
    tagline: "Culminating mastery project",
    accent: "#f43f5e",
    accentBg: "rgba(244,63,94,0.07)",
    accentBorder: "rgba(244,63,94,0.25)",
    description: "A milestone-based final project that demonstrates full program mastery.",
    allowedQTypes: [] as QuestionType[],
    defaultQ: (): IQuestion => ({ questionText: "", type: QuestionType.ESSAY, points: 0 }),
    showDuration: false, showAttempts: false, showDeadline: true,
  },
} as const;

const QTYPE_META: Record<QuestionType, { label: string; icon: React.ElementType }> = {
  [QuestionType.MULTIPLE_CHOICE]: { label: "Multiple Choice", icon: CheckSquare },
  [QuestionType.TRUE_FALSE]: { label: "True / False", icon: ToggleLeft },
  [QuestionType.SHORT_ANSWER]: { label: "Short Answer", icon: AlignLeft },
  [QuestionType.ESSAY]: { label: "Essay", icon: BookOpen },
  [QuestionType.CODING]: { label: "Coding", icon: Braces },
};

const DIFF_CONFIG = {
  beginner: { label: "Beginner", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  intermediate: { label: "Intermediate", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  advanced: { label: "Advanced", color: "#f43f5e", bg: "rgba(244,63,94,0.1)" },
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const newProjectOption = (): IProjectOption => ({
  id: uid(), title: "", description: "", difficulty: "intermediate",
  techStack: [], deliverables: [""],
});

const newMilestone = (week: number): ICapstoneMilestone => ({
  id: uid(), title: "", description: "", dueWeek: week, points: 25, deliverables: [""],
});

const newCriterion = (): IRubricCriterion => ({
  id: uid(), criterion: "", description: "", maxPoints: 25,
  levels: [
    { label: "Excellent", points: 25, description: "" },
    { label: "Good", points: 18, description: "" },
    { label: "Satisfactory", points: 12, description: "" },
    { label: "Needs Work", points: 5, description: "" },
  ],
});

// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────

export default function CreateAssessmentPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [showAI, setShowAI] = useState(false);
  const [aiCount, setAiCount] = useState(5);

  const [form, setForm] = useState<IExtendedFormData>({
    courseId: "", title: "", description: "",
    type: AssessmentType.QUIZ, passingScore: 70,
    duration: 60, attempts: 2, isPublished: false,
    isRequiredForCompletion: true,
    questions: [TYPE_CONFIG[AssessmentType.QUIZ].defaultQ()],
    projectOptions: [newProjectOption()],
    allowCustomProject: false,
    submissionType: "github",
    rubric: [newCriterion()],
    milestones: [newMilestone(2), newMilestone(4), newMilestone(6)],
    capstoneBrief: "",
    presentationRequired: false,
  });

  const cfg = TYPE_CONFIG[form.type];
  const TypeIcon = cfg.icon;
  const isProjectLike = form.type === AssessmentType.PROJECT || form.type === AssessmentType.CAPSTONE;

  const totalPoints = useMemo(() => {
    if (form.type === AssessmentType.PROJECT) return (form.rubric || []).reduce((s, r) => s + r.maxPoints, 0);
    if (form.type === AssessmentType.CAPSTONE) return (form.milestones || []).reduce((s, m) => s + m.points, 0);
    return form.questions.reduce((s, q) => s + (q.points || 0), 0);
  }, [form]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") { router.push("/dashboard"); return; }
    instructorService.getCourses().then(r => { if (r.success) setCourses(r.data); }).finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 6000); return () => clearTimeout(t); } }, [error]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(null), 6000); return () => clearTimeout(t); } }, [success]);

  const handleTypeChange = (t: AssessmentType) => {
    const c = TYPE_CONFIG[t];
    setForm(p => ({
      ...p, type: t,
      duration: t === AssessmentType.QUIZ ? 60 : 0,
      attempts: t === AssessmentType.QUIZ ? 2 : 1,
      questions: [c.defaultQ()],
    }));
  };

  const handleAIGenerate = async (mode: "replace" | "append") => {
    if (!form.title) { setError("Enter a title first."); return; }
    try {
      setIsGenerating(true); setError(null); setShowAI(false);
      const raw = await hybridAIService.generateQuizQuestions(`${form.title} (${cfg.label})`, aiCount);
      const allowed = (cfg as any).allowedQTypes as QuestionType[];
      const formatted: IQuestion[] = raw.map((q: any, i: number) => {
        const t = allowed[i % allowed.length];
        if (t === QuestionType.MULTIPLE_CHOICE) return {
          questionText: q.question || "", type: t, points: q.points || 5,
          options: q.options || ["", "", "", ""], correctAnswer: String(q.correctAnswer ?? "0"),
          explanation: q.explanation || "",
        };
        if (t === QuestionType.TRUE_FALSE) return {
          questionText: q.question || "", type: t, points: q.points || 3,
          options: ["True", "False"], correctAnswer: "True", explanation: q.explanation || "",
        };
        return { questionText: q.question || "", type: t, points: q.points || 10, correctAnswer: q.explanation || "" };
      });
      setForm(p => ({ ...p, questions: mode === "append" ? [...p.questions, ...formatted] : formatted }));
      setSuccess(`${mode === "append" ? "Added" : "Generated"} ${formatted.length} questions.`);
    } catch (err: any) { setError(err.message || "AI generation failed."); }
    finally { setIsGenerating(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) { setError("Please link to a course."); return; }
    if (!form.description?.trim()) { setError("Please add a description."); return; }
    if (!isProjectLike && form.questions.some(q => !q.questionText.trim())) { setError("All questions need text."); return; }
    if (form.type === AssessmentType.PROJECT && !(form.projectOptions || []).length) { setError("Add at least one project option."); return; }

    setSubmitting(true); setError(null);
    try {
      const payload: ICreateAssessment = { ...form };
      if (isProjectLike) {
        payload.questions = [{
          questionText: form.type === AssessmentType.PROJECT ? "Project Submission" : "Capstone Submission",
          type: QuestionType.ESSAY,
          points: totalPoints,
          correctAnswer: JSON.stringify({
            projectOptions: form.projectOptions,
            rubric: form.rubric,
            milestones: form.milestones,
            capstoneBrief: form.capstoneBrief,
            allowCustomProject: form.allowCustomProject,
            submissionType: form.submissionType,
            presentationRequired: form.presentationRequired,
          }),
          explanation: "Structured project/capstone metadata",
        }];
      }
      const res = await assessmentService.admin.create(payload);
      if (res.success) router.push("/dashboard/instructor/assessments");
      else setError(res.message || "Save failed.");
    } catch (err: any) { setError(err.message || "Save failed."); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <RefreshCw className="animate-spin text-emerald-400" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <div className="flex-1 lg:ml-64 overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/instructor/assessments" className="p-2 hover:bg-slate-800 rounded-full text-gray-400 hover:text-white transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <TypeIcon size={18} style={{ color: cfg.accent }} />
                New {cfg.label}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{cfg.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setViewMode(v => v === "edit" ? "preview" : "edit")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-all text-sm font-medium">
              {viewMode === "edit" ? <Eye size={16} /> : <Edit3 size={16} />}
              {viewMode === "edit" ? "Preview" : "Edit"}
            </button>
            {!isProjectLike && (
              <button type="button" onClick={() => setShowAI(true)} disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 transition-all text-sm font-bold">
                {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                AI Generate
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {(error || success) && (
          <div className="max-w-5xl mx-auto px-8 pt-4 space-y-2">
            {error && <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm"><AlertCircle size={16} />{error}</div>}
            {success && <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-lg p-3 flex items-center gap-2 text-emerald-400 text-sm"><Wand2 size={16} />{success}</div>}
          </div>
        )}

        <div className="max-w-5xl mx-auto p-8">
          {viewMode === "edit" ? (
            <form onSubmit={handleSubmit} className="space-y-8 pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title & Desc */}
                  <section className="rounded-2xl p-6 border" style={{ background: cfg.accentBg, borderColor: cfg.accentBorder }}>
                    <div className="flex items-center gap-2 mb-4">
                      <TypeIcon size={14} style={{ color: cfg.accent }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.accent }}>{cfg.label}</span>
                    </div>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder={
                        form.type === AssessmentType.PROJECT ? "e.g. Build a Full-Stack Todo App" :
                        form.type === AssessmentType.CAPSTONE ? "e.g. Capstone: Production-Ready SaaS Application" :
                        `${cfg.label} title...`
                      }
                      className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-700 focus:outline-none mb-4" />
                    <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder={
                        form.type === AssessmentType.PROJECT ? "What will students build? What real-world problem does it solve? What are the non-negotiable requirements?" :
                        form.type === AssessmentType.CAPSTONE ? "Describe the capstone brief — the real-world scenario the student is solving. What does mastery look like?" :
                        "Instructions for students..."
                      }
                      className="w-full bg-transparent text-gray-400 resize-none focus:outline-none border-l-2 pl-4"
                      style={{ borderColor: cfg.accentBorder }} rows={4} />
                  </section>

                  {form.type === AssessmentType.PROJECT && <ProjectBuilder form={form} setForm={setForm} cfg={cfg} />}
                  {form.type === AssessmentType.CAPSTONE && <CapstoneBuilder form={form} setForm={setForm} cfg={cfg} />}
                  {!isProjectLike && <QuestionsBuilder form={form} setForm={setForm} cfg={cfg} />}
                </div>

                {/* Sidebar */}
                <div>
                  <div className="bg-slate-800/40 border border-gray-800 rounded-2xl p-6 space-y-5 sticky top-24">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Target size={16} style={{ color: cfg.accent }} /> Settings
                    </h4>

                    {/* Type */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(AssessmentType).map(t => {
                          const c = TYPE_CONFIG[t]; const Icon = c.icon; const sel = form.type === t;
                          return (
                            <button key={t} type="button" onClick={() => handleTypeChange(t)}
                              className="p-3 rounded-xl border-2 transition-all text-left"
                              style={sel ? { borderColor: c.accent, background: c.accentBg } : { borderColor: "rgba(75,85,99,0.4)" }}>
                              <Icon size={15} style={{ color: sel ? c.accent : "#6b7280" }} />
                              <div className="text-xs font-bold mt-1 text-white">{c.label}</div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-gray-600 mt-2 leading-snug">{cfg.description}</p>
                    </div>

                    {/* Course */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Course *</label>
                      <select required value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}
                        className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Passing Score %</label>
                      <input type="number" min="0" max="100" value={form.passingScore}
                        onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
                    </div>

                    {cfg.showDuration && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Clock size={11} /> Duration (min)</label>
                        <input type="number" min="0" value={form.duration}
                          onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                          placeholder="0 = no limit"
                          className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
                      </div>
                    )}

                    {cfg.showAttempts && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Max Attempts</label>
                        <input type="number" min="1" max="10" value={form.attempts}
                          onChange={e => setForm({ ...form, attempts: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
                      </div>
                    )}

                    {cfg.showDeadline && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Calendar size={11} /> Due Date</label>
                        <input type="datetime-local"
                          onChange={e => setForm({ ...form, endDate: e.target.value ? new Date(e.target.value) : undefined } as any)}
                          className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
                      </div>
                    )}

                    <div className="rounded-xl p-3 border" style={{ background: cfg.accentBg, borderColor: cfg.accentBorder }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Total Points</span>
                        <span className="text-xl font-bold" style={{ color: cfg.accent }}>{totalPoints}</span>
                      </div>
                    </div>

                    <ToggleRow label="Publish Immediately" value={form.isPublished ?? false} accent={cfg.accent}
                      onChange={() => setForm({ ...form, isPublished: !form.isPublished })} />
                    <ToggleRow label="Required for Completion" value={form.isRequiredForCompletion ?? false} accent={cfg.accent}
                      onChange={() => setForm({ ...form, isRequiredForCompletion: !form.isRequiredForCompletion })} />

                    <button type="submit" disabled={submitting}
                      className="w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-white transition-all"
                      style={{ background: cfg.accent }}>
                      {submitting ? <><RefreshCw className="animate-spin" size={16} />Saving...</> : <><Save size={16} />{form.isPublished ? `Publish ${cfg.label}` : "Save as Draft"}</>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <PreviewMode form={form} cfg={cfg} TypeIcon={TypeIcon} totalPoints={totalPoints} />
          )}
        </div>
      </div>

      {/* AI Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-gray-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Generator</h3>
                <p className="text-xs text-gray-400">For: <span style={{ color: cfg.accent }}>{cfg.label}</span></p>
              </div>
            </div>
            <label className="text-sm font-bold text-gray-300 mb-2 block">Questions to generate</label>
            <input type="number" min="1" max="50" value={aiCount} onChange={e => setAiCount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-xl font-bold text-center focus:outline-none mb-4" />
            <div className="flex gap-3 mb-3">
              <button onClick={() => handleAIGenerate("replace")} className="flex-1 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-sm">Replace All</button>
              <button onClick={() => handleAIGenerate("append")} className="flex-1 py-2.5 bg-slate-700 text-white font-bold rounded-xl text-sm">Add to Existing</button>
            </div>
            <button onClick={() => setShowAI(false)} className="w-full text-gray-500 text-sm py-2 hover:text-gray-300">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PROJECT BUILDER
// ─────────────────────────────────────────────────────────

function ProjectBuilder({ form, setForm, cfg }: { form: IExtendedFormData; setForm: any; cfg: any }) {
  const options = form.projectOptions || [];
  const rubric = form.rubric || [];

  const addOption = () => setForm((p: any) => ({ ...p, projectOptions: [...(p.projectOptions || []), newProjectOption()] }));
  const removeOption = (id: string) => setForm((p: any) => ({ ...p, projectOptions: p.projectOptions.filter((o: IProjectOption) => o.id !== id) }));
  const updateOption = (id: string, f: keyof IProjectOption, v: any) =>
    setForm((p: any) => ({ ...p, projectOptions: p.projectOptions.map((o: IProjectOption) => o.id === id ? { ...o, [f]: v } : o) }));

  const addCriterion = () => setForm((p: any) => ({ ...p, rubric: [...(p.rubric || []), newCriterion()] }));
  const removeCriterion = (id: string) => setForm((p: any) => ({ ...p, rubric: p.rubric.filter((r: IRubricCriterion) => r.id !== id) }));
  const updateCriterion = (id: string, f: keyof IRubricCriterion, v: any) =>
    setForm((p: any) => ({ ...p, rubric: p.rubric.map((r: IRubricCriterion) => r.id === id ? { ...r, [f]: v } : r) }));

  return (
    <div className="space-y-8">
      {/* Project Options */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Package size={17} style={{ color: cfg.accent }} /> Project Options
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Students pick one to build. Offer 2–4 options at varied difficulties.</p>
          </div>
          <button type="button" onClick={addOption}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
            style={{ color: cfg.accent, borderColor: cfg.accentBorder, background: cfg.accentBg }}>
            <Plus size={13} /> Add Option
          </button>
        </div>
        <div className="space-y-4">
          {options.map((opt, i) => (
            <ProjectOptionCard key={opt.id} option={opt} index={i} cfg={cfg}
              onUpdate={(f, v) => updateOption(opt.id, f, v)}
              onRemove={() => removeOption(opt.id)} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-slate-800/20">
          <div>
            <p className="text-sm text-white font-medium">Allow custom project proposals</p>
            <p className="text-xs text-gray-500 mt-0.5">Students can propose their own project for your approval</p>
          </div>
          <ToggleRow label="" value={form.allowCustomProject || false} accent={cfg.accent}
            onChange={() => setForm((p: any) => ({ ...p, allowCustomProject: !p.allowCustomProject }))} />
        </div>
      </section>

      {/* Submission Type */}
      <section>
        <h3 className="text-white font-bold text-base flex items-center gap-2 mb-3">
          <Upload size={17} style={{ color: cfg.accent }} /> Accepted Submissions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: "github", icon: Github, label: "GitHub Repo", sub: "Code + README" },
            { v: "url", icon: Globe, label: "Live URL", sub: "Deployed app" },
            { v: "file", icon: Upload, label: "File Upload", sub: "ZIP / PDF" },
            { v: "all", icon: Layers, label: "All Accepted", sub: "Repo + URL + File" },
          ].map(({ v, icon: Icon, label, sub }) => (
            <button key={v} type="button" onClick={() => setForm((p: any) => ({ ...p, submissionType: v }))}
              className="p-3 rounded-xl border-2 text-left transition-all"
              style={form.submissionType === v ? { borderColor: cfg.accent, background: cfg.accentBg } : { borderColor: "rgba(75,85,99,0.4)" }}>
              <Icon size={15} style={{ color: form.submissionType === v ? cfg.accent : "#6b7280" }} />
              <div className="text-xs font-bold mt-1 text-white">{label}</div>
              <div className="text-[10px] text-gray-500">{sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Rubric */}
      <RubricBuilder rubric={rubric} cfg={cfg}
        onAdd={addCriterion} onRemove={removeCriterion} onUpdate={updateCriterion} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PROJECT OPTION CARD
// ─────────────────────────────────────────────────────────

function ProjectOptionCard({ option, index, cfg, onUpdate, onRemove }: {
  option: IProjectOption; index: number; cfg: any;
  onUpdate: (f: keyof IProjectOption, v: any) => void; onRemove: () => void;
}) {
  const diff = DIFF_CONFIG[option.difficulty];
  const [techInput, setTechInput] = useState("");

  const addTech = () => { if (techInput.trim()) { onUpdate("techStack", [...option.techStack, techInput.trim()]); setTechInput(""); } };
  const removeTech = (i: number) => onUpdate("techStack", option.techStack.filter((_, idx) => idx !== i));
  const updateDeliverable = (i: number, v: string) => { const d = [...option.deliverables]; d[i] = v; onUpdate("deliverables", d); };
  const addDeliverable = () => onUpdate("deliverables", [...option.deliverables, ""]);
  const removeDeliverable = (i: number) => onUpdate("deliverables", option.deliverables.filter((_, idx) => idx !== i));

  return (
    <div className="bg-slate-800/30 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800" style={{ background: cfg.accentBg }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: cfg.accent, background: "rgba(0,0,0,0.2)" }}>
            Option {index + 1}
          </span>
          <select value={option.difficulty} onChange={e => onUpdate("difficulty", e.target.value as any)}
            className="text-xs font-bold rounded-md px-2 py-1 border-0 focus:outline-none cursor-pointer"
            style={{ background: diff.bg, color: diff.color }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
      </div>

      <div className="p-5 space-y-4">
        <input value={option.title} onChange={e => onUpdate("title", e.target.value)}
          placeholder="Project title (e.g. E-commerce Product Dashboard)"
          className="w-full bg-transparent text-white font-bold text-base focus:outline-none border-b border-gray-800 pb-2" />

        <textarea value={option.description} onChange={e => onUpdate("description", e.target.value)}
          placeholder="Describe what students will build and what real-world problem it solves..."
          rows={3} className="w-full bg-slate-900/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 resize-none focus:outline-none" />

        {/* Tech stack tags */}
        <div>
          <label className="text-[10px] font-bold text-gray-600 uppercase mb-2 block">Tech Stack</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {option.techStack.map((t, i) => (
              <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium"
                style={{ color: cfg.accent, borderColor: cfg.accentBorder, background: cfg.accentBg }}>
                {t}
                <button type="button" onClick={() => removeTech(i)} className="hover:text-red-400 ml-0.5"><X size={9} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={techInput} onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTech())}
              placeholder="React, Node.js, PostgreSQL… press Enter"
              className="flex-1 bg-slate-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none" />
            <button type="button" onClick={addTech} className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: cfg.accentBg, color: cfg.accent }}><Plus size={13} /></button>
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <label className="text-[10px] font-bold text-gray-600 uppercase mb-2 flex items-center gap-1">
            <BadgeCheck size={10} /> Required Deliverables
          </label>
          <div className="space-y-2">
            {option.deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <ChevronRight size={11} className="text-gray-700 shrink-0" />
                <input value={d} onChange={e => updateDeliverable(i, e.target.value)}
                  placeholder="e.g. GitHub repo with README, deployed live URL, 3-min demo video"
                  className="flex-1 bg-slate-900/40 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none" />
                <button type="button" onClick={() => removeDeliverable(i)} className="text-gray-700 hover:text-red-400"><X size={12} /></button>
              </div>
            ))}
            <button type="button" onClick={addDeliverable}
              className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1 mt-1">
              <Plus size={11} /> Add deliverable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CAPSTONE BUILDER
// ─────────────────────────────────────────────────────────

function CapstoneBuilder({ form, setForm, cfg }: { form: IExtendedFormData; setForm: any; cfg: any }) {
  const milestones = form.milestones || [];
  const rubric = form.rubric || [];

  const addMilestone = () => setForm((p: any) => ({
    ...p, milestones: [...(p.milestones || []), newMilestone((p.milestones?.length || 0) * 2 + 2)]
  }));
  const removeMilestone = (id: string) => setForm((p: any) => ({ ...p, milestones: p.milestones.filter((m: ICapstoneMilestone) => m.id !== id) }));
  const updateMilestone = (id: string, f: keyof ICapstoneMilestone, v: any) =>
    setForm((p: any) => ({ ...p, milestones: p.milestones.map((m: ICapstoneMilestone) => m.id === id ? { ...m, [f]: v } : m) }));

  const addCriterion = () => setForm((p: any) => ({ ...p, rubric: [...(p.rubric || []), newCriterion()] }));
  const removeCriterion = (id: string) => setForm((p: any) => ({ ...p, rubric: p.rubric.filter((r: IRubricCriterion) => r.id !== id) }));
  const updateCriterion = (id: string, f: keyof IRubricCriterion, v: any) =>
    setForm((p: any) => ({ ...p, rubric: p.rubric.map((r: IRubricCriterion) => r.id === id ? { ...r, [f]: v } : r) }));

  return (
    <div className="space-y-8">
      {/* Brief */}
      <section className="bg-slate-800/20 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold text-base flex items-center gap-2 mb-2">
          <FileText size={16} style={{ color: cfg.accent }} /> Capstone Brief
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Write a realistic "client scenario" — the real-world context students are building for.
          Great briefs name a fictional company, describe the problem, and define what success looks like.
        </p>
        <textarea value={form.capstoneBrief || ""} onChange={e => setForm((p: any) => ({ ...p, capstoneBrief: e.target.value }))}
          placeholder={`Example:\n\n"You've been hired as lead developer at FinTrack, a personal finance startup. Your task is to build their MVP: user auth, transaction tracking, a budget analytics dashboard, and a mobile-first UI. You will demo your live app to stakeholders at the end of Week 6."`}
          rows={7} className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 resize-none focus:outline-none leading-relaxed" />
      </section>

      {/* Milestones */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Milestone size={17} style={{ color: cfg.accent }} /> Milestones
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Graded checkpoints that keep students on track week by week.</p>
          </div>
          <button type="button" onClick={addMilestone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border"
            style={{ color: cfg.accent, borderColor: cfg.accentBorder, background: cfg.accentBg }}>
            <Plus size={13} /> Add Milestone
          </button>
        </div>
        <div className="space-y-3">
          {milestones.map((m, i) => (
            <MilestoneCard key={m.id} milestone={m} index={i} cfg={cfg}
              onUpdate={(f, v) => updateMilestone(m.id, f, v)}
              onRemove={() => removeMilestone(m.id)} />
          ))}
        </div>
      </section>

      {/* Final submission */}
      <section className="bg-slate-800/20 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold text-base flex items-center gap-2 mb-4">
          <Upload size={16} style={{ color: cfg.accent }} /> Final Submission
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { v: "github", icon: Github, label: "GitHub Repo", sub: "Code + README" },
            { v: "url", icon: Globe, label: "Live URL", sub: "Deployed app" },
            { v: "file", icon: Upload, label: "File Upload", sub: "ZIP / PDF / Slides" },
            { v: "all", icon: Layers, label: "All Accepted", sub: "Repo + Live + Docs" },
          ].map(({ v, icon: Icon, label, sub }) => (
            <button key={v} type="button" onClick={() => setForm((p: any) => ({ ...p, submissionType: v }))}
              className="p-3 rounded-xl border-2 text-left transition-all"
              style={form.submissionType === v ? { borderColor: cfg.accent, background: cfg.accentBg } : { borderColor: "rgba(75,85,99,0.4)" }}>
              <Icon size={15} style={{ color: form.submissionType === v ? cfg.accent : "#6b7280" }} />
              <div className="text-xs font-bold mt-1 text-white">{label}</div>
              <div className="text-[10px] text-gray-500">{sub}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-slate-900/30">
          <div>
            <p className="text-sm text-white font-medium flex items-center gap-2">
              <Users size={13} style={{ color: cfg.accent }} /> Presentation / Demo Required
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Students must present or demo their project live</p>
          </div>
          <ToggleRow label="" value={form.presentationRequired || false} accent={cfg.accent}
            onChange={() => setForm((p: any) => ({ ...p, presentationRequired: !p.presentationRequired }))} />
        </div>
      </section>

      <RubricBuilder rubric={rubric} cfg={cfg}
        onAdd={addCriterion} onRemove={removeCriterion} onUpdate={updateCriterion} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MILESTONE CARD
// ─────────────────────────────────────────────────────────

function MilestoneCard({ milestone, index, cfg, onUpdate, onRemove }: {
  milestone: ICapstoneMilestone; index: number; cfg: any;
  onUpdate: (f: keyof ICapstoneMilestone, v: any) => void; onRemove: () => void;
}) {
  const updateDeliverable = (i: number, v: string) => { const d = [...milestone.deliverables]; d[i] = v; onUpdate("deliverables", d); };
  const addDeliverable = () => onUpdate("deliverables", [...milestone.deliverables, ""]);
  const removeDeliverable = (i: number) => onUpdate("deliverables", milestone.deliverables.filter((_, idx) => idx !== i));

  return (
    <div className="bg-slate-800/30 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800" style={{ background: cfg.accentBg }}>
        <span className="text-xs font-bold rounded-md px-2 py-0.5" style={{ color: cfg.accent, background: "rgba(0,0,0,0.2)" }}>
          M{index + 1}
        </span>
        <div className="flex items-center gap-2 ml-auto text-xs text-gray-500">
          Week
          <input type="number" min="1" max="52" value={milestone.dueWeek}
            onChange={e => onUpdate("dueWeek", Number(e.target.value))}
            className="w-11 bg-slate-900 border border-gray-700 rounded px-1.5 py-0.5 text-xs text-white text-center focus:outline-none" />
          ·
          <input type="number" min="1" value={milestone.points}
            onChange={e => onUpdate("points", Number(e.target.value))}
            className="w-13 bg-slate-900 border border-gray-700 rounded px-1.5 py-0.5 text-xs text-white text-center focus:outline-none" />
          pts
        </div>
        <button type="button" onClick={onRemove} className="text-gray-600 hover:text-red-400 ml-1"><Trash2 size={13} /></button>
      </div>
      <div className="p-4 space-y-3">
        <input value={milestone.title} onChange={e => onUpdate("title", e.target.value)}
          placeholder="e.g. Authentication & Database Setup"
          className="w-full bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-gray-800 pb-1.5" />
        <textarea value={milestone.description} onChange={e => onUpdate("description", e.target.value)}
          placeholder="What must be done? What will be reviewed at this checkpoint?"
          rows={2} className="w-full bg-slate-900/40 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 resize-none focus:outline-none" />
        <div>
          <label className="text-[9px] font-bold text-gray-600 uppercase mb-1.5 block">Deliverables for this milestone</label>
          {milestone.deliverables.map((d, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <ChevronRight size={10} className="text-gray-700 shrink-0" />
              <input value={d} onChange={e => updateDeliverable(i, e.target.value)}
                placeholder="e.g. Working /login and /register endpoints with JWT"
                className="flex-1 bg-slate-900/30 border border-gray-800 rounded px-2.5 py-1 text-xs text-gray-300 focus:outline-none" />
              <button type="button" onClick={() => removeDeliverable(i)} className="text-gray-700 hover:text-red-400"><X size={11} /></button>
            </div>
          ))}
          <button type="button" onClick={addDeliverable} className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1">
            <Plus size={10} /> Add deliverable
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// RUBRIC BUILDER
// ─────────────────────────────────────────────────────────

function RubricBuilder({ rubric, cfg, onAdd, onRemove, onUpdate }: {
  rubric: IRubricCriterion[]; cfg: any;
  onAdd: () => void; onRemove: (id: string) => void;
  onUpdate: (id: string, f: keyof IRubricCriterion, v: any) => void;
}) {
  const total = rubric.reduce((s, r) => s + r.maxPoints, 0);
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Star size={17} style={{ color: cfg.accent }} /> Grading Rubric
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Define what excellent, good, and poor work looks like. Total: <span style={{ color: cfg.accent }} className="font-bold">{total} pts</span>
          </p>
        </div>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border"
          style={{ color: cfg.accent, borderColor: cfg.accentBorder, background: cfg.accentBg }}>
          <Plus size={13} /> Add Criterion
        </button>
      </div>
      <div className="space-y-3">
        {rubric.map(r => (
          <div key={r.id} className="bg-slate-800/20 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <input value={r.criterion} onChange={e => onUpdate(r.id, "criterion", e.target.value)}
                placeholder="e.g. Code Quality & Architecture"
                className="flex-1 bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-gray-800 pb-1.5" />
              <div className="flex items-center gap-1 shrink-0">
                <input type="number" min="1" value={r.maxPoints}
                  onChange={e => onUpdate(r.id, "maxPoints", Number(e.target.value))}
                  className="w-14 bg-slate-900 border border-gray-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none" />
                <span className="text-xs text-gray-500">pts</span>
              </div>
              <button type="button" onClick={() => onRemove(r.id)} className="text-gray-700 hover:text-red-400"><Trash2 size={13} /></button>
            </div>
            <input value={r.description} onChange={e => onUpdate(r.id, "description", e.target.value)}
              placeholder="What aspect of the project does this evaluate?"
              className="w-full bg-slate-900/30 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 focus:outline-none mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {r.levels.map((lvl, li) => (
                <div key={li} className="bg-slate-900/40 rounded-lg p-2.5 border border-gray-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400">{lvl.label}</span>
                    <input type="number" min="0" value={lvl.points}
                      onChange={e => {
                        const lvls = [...r.levels]; lvls[li] = { ...lvls[li], points: Number(e.target.value) };
                        onUpdate(r.id, "levels", lvls);
                      }}
                      className="w-12 bg-slate-950 border border-gray-700 rounded px-1.5 py-0.5 text-[10px] text-white text-center focus:outline-none" />
                  </div>
                  <input value={lvl.description}
                    onChange={e => {
                      const lvls = [...r.levels]; lvls[li] = { ...lvls[li], description: e.target.value };
                      onUpdate(r.id, "levels", lvls);
                    }}
                    placeholder={`What does ${lvl.label.toLowerCase()} work look like?`}
                    className="w-full bg-transparent text-[10px] text-gray-500 focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// QUESTIONS BUILDER (Quiz / Assignment only)
// ─────────────────────────────────────────────────────────

function QuestionsBuilder({ form, setForm, cfg }: { form: IExtendedFormData; setForm: any; cfg: any }) {
  const allowed = (cfg as any).allowedQTypes as QuestionType[];

  const addQuestion = () => setForm((p: any) => ({ ...p, questions: [...p.questions, cfg.defaultQ()] }));
  const removeQuestion = (i: number) => {
    if (form.questions.length === 1) return;
    setForm((p: any) => ({ ...p, questions: p.questions.filter((_: any, idx: number) => idx !== i) }));
  };
  const updateQuestion = (i: number, f: keyof IQuestion, v: any) => {
    const qs = [...form.questions];
    if (f === "type") {
      const t = v as QuestionType;
      qs[i] = {
        questionText: qs[i].questionText, type: t, points: qs[i].points,
        explanation: qs[i].explanation || "",
        ...(t === QuestionType.MULTIPLE_CHOICE ? { options: ["", "", "", ""], correctAnswer: "0" } : {}),
        ...(t === QuestionType.TRUE_FALSE ? { options: ["True", "False"], correctAnswer: "True" } : {}),
        ...(t === QuestionType.SHORT_ANSWER || t === QuestionType.ESSAY ? { correctAnswer: "" } : {}),
      };
    } else { qs[i] = { ...qs[i], [f]: v }; }
    setForm({ ...form, questions: qs });
  };
  const updateOption = (qi: number, oi: number, v: string) => {
    const qs = [...form.questions];
    const opts = [...(qs[qi].options || [])]; opts[oi] = v; qs[qi].options = opts;
    setForm({ ...form, questions: qs });
  };
  const totalPts = form.questions.reduce((s, q) => s + (q.points || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Layers size={17} style={{ color: cfg.accent }} />
          Questions <span className="text-sm font-normal text-gray-500">({form.questions.length})</span>
        </h3>
        <span className="text-sm font-bold" style={{ color: cfg.accent }}>{totalPts} pts</span>
      </div>

      {form.questions.map((q, idx) => {
        const meta = QTYPE_META[q.type]; const QIcon = meta.icon;
        return (
          <div key={idx} className="bg-slate-800/30 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0"
                style={{ color: cfg.accent, borderColor: cfg.accentBorder, background: cfg.accentBg }}>{idx + 1}</span>
              {allowed.length > 1 ? (
                <select value={q.type} onChange={e => updateQuestion(idx, "type", e.target.value)}
                  className="bg-slate-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-300 focus:outline-none">
                  {allowed.map(t => <option key={t} value={t}>{QTYPE_META[t].label}</option>)}
                </select>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border"
                  style={{ color: cfg.accent, borderColor: cfg.accentBorder, background: cfg.accentBg }}>
                  <QIcon size={11} />{meta.label}
                </span>
              )}
              <div className="flex items-center gap-1">
                <input type="number" min="1" max="100" value={q.points}
                  onChange={e => updateQuestion(idx, "points", Number(e.target.value))}
                  className="w-14 bg-slate-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-300 text-center" />
                <span className="text-xs text-gray-500">pts</span>
              </div>
              <button type="button" onClick={() => removeQuestion(idx)} className="ml-auto text-gray-600 hover:text-red-400"><Trash2 size={15} /></button>
            </div>

            <input value={q.questionText} onChange={e => updateQuestion(idx, "questionText", e.target.value)}
              placeholder={q.type === QuestionType.ESSAY ? "Essay prompt..." : q.type === QuestionType.SHORT_ANSWER ? "Short answer question..." : "Question text..."}
              className="w-full bg-transparent text-base text-white font-medium mb-4 focus:outline-none border-b border-gray-800 pb-2" required />

            {q.type === QuestionType.MULTIPLE_CHOICE && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 p-2.5 rounded-xl border transition-all"
                    style={q.correctAnswer === String(oi) ? { background: cfg.accentBg, borderColor: cfg.accentBorder } : { background: "rgba(15,23,42,0.5)", borderColor: "rgba(75,85,99,0.35)" }}>
                    <input type="radio" name={`q-${idx}`} checked={q.correctAnswer === String(oi)}
                      onChange={() => updateQuestion(idx, "correctAnswer", String(oi))}
                      className="w-3.5 h-3.5 cursor-pointer shrink-0" style={{ accentColor: cfg.accent }} />
                    <input value={opt} onChange={e => updateOption(idx, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      className="bg-transparent text-sm text-gray-300 w-full focus:outline-none" />
                  </div>
                ))}
              </div>
            )}

            {q.type === QuestionType.TRUE_FALSE && (
              <div className="flex gap-3 mb-3">
                {["True", "False"].map(v => (
                  <button key={v} type="button" onClick={() => updateQuestion(idx, "correctAnswer", v)}
                    className="flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all"
                    style={q.correctAnswer === v ? { borderColor: cfg.accent, background: cfg.accentBg, color: cfg.accent } : { borderColor: "rgba(75,85,99,0.4)", color: "#6b7280" }}>{v}</button>
                ))}
              </div>
            )}

            {(q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.ESSAY) && (
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1.5 block">{q.type === QuestionType.ESSAY ? "Grading Rubric / Key Points" : "Model Answer"}</label>
                <textarea value={(q.correctAnswer as string) || ""} onChange={e => updateQuestion(idx, "correctAnswer", e.target.value)}
                  placeholder={q.type === QuestionType.ESSAY ? "What should a complete answer cover?" : "Expected answer or key concepts..."}
                  rows={3} className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 resize-none focus:outline-none" />
              </div>
            )}

            <textarea value={q.explanation || ""} onChange={e => updateQuestion(idx, "explanation", e.target.value)}
              placeholder="Explanation shown after submission (optional)"
              rows={2} className="w-full bg-slate-900/20 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500 resize-none focus:outline-none" />
          </div>
        );
      })}

      <button type="button" onClick={addQuestion}
        className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 hover:text-gray-300 hover:border-gray-600 transition-all flex items-center justify-center gap-2 font-bold">
        <Plus size={18} /> Add Question
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TOGGLE ROW
// ─────────────────────────────────────────────────────────

function ToggleRow({ label, value, accent, onChange }: { label: string; value: boolean; accent: string; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      {label && <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>}
      <button type="button" onClick={onChange}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        style={{ background: value ? accent : "#374151" }}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PREVIEW
// ─────────────────────────────────────────────────────────

function PreviewMode({ form, cfg, TypeIcon, totalPoints }: {
  form: IExtendedFormData; cfg: any; TypeIcon: React.ElementType; totalPoints: number;
}) {
  const isProjectLike = form.type === AssessmentType.PROJECT || form.type === AssessmentType.CAPSTONE;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-3xl p-8 border" style={{ background: cfg.accentBg, borderColor: cfg.accentBorder }}>
        <div className="flex items-center gap-3 mb-4">
          <TypeIcon style={{ color: cfg.accent }} size={26} />
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border" style={{ color: cfg.accent, borderColor: cfg.accentBorder }}>{cfg.label}</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">{form.title || "Untitled"}</h2>
        <p className="text-gray-400 leading-relaxed mb-6">{form.description || "No description."}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-gray-300"><Target size={13} style={{ color: cfg.accent }} />{form.passingScore}% to pass</span>
          <span className="flex items-center gap-1.5 text-gray-300"><Star size={13} style={{ color: cfg.accent }} />{totalPoints} pts</span>
          {form.duration && form.duration > 0 && <span className="flex items-center gap-1.5 text-gray-300"><Clock size={13} style={{ color: cfg.accent }} />{form.duration} min</span>}
        </div>
      </div>

      {form.type === AssessmentType.PROJECT && (
        <>
          <div className="bg-slate-800/30 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold flex items-center gap-2 mb-4"><Package size={16} style={{ color: cfg.accent }} /> Choose Your Project</h3>
            <div className="space-y-4">
              {(form.projectOptions || []).map((opt, i) => {
                const d = DIFF_CONFIG[opt.difficulty];
                return (
                  <div key={opt.id} className="border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-bold">{opt.title || `Option ${i + 1}`}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ color: d.color, background: d.bg }}>{d.label}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{opt.description}</p>
                    {opt.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {opt.techStack.map((t, ti) => <span key={ti} className="text-xs px-2 py-0.5 rounded-full border" style={{ color: cfg.accent, borderColor: cfg.accentBorder }}>{t}</span>)}
                      </div>
                    )}
                    {opt.deliverables.filter(Boolean).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-600 uppercase">Deliverables</p>
                        {opt.deliverables.filter(Boolean).map((d, di) => <p key={di} className="text-xs text-gray-500 flex items-center gap-1.5"><ChevronRight size={9} style={{ color: cfg.accent }} />{d}</p>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {(form.rubric || []).length > 0 && (
            <div className="bg-slate-800/20 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold flex items-center gap-2 mb-4"><Star size={16} style={{ color: cfg.accent }} /> Grading Rubric</h3>
              {(form.rubric || []).map(r => (
                <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                  <div><p className="text-sm text-white font-medium">{r.criterion || "Criterion"}</p><p className="text-xs text-gray-500">{r.description}</p></div>
                  <span className="text-sm font-bold shrink-0 ml-4" style={{ color: cfg.accent }}>{r.maxPoints} pts</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {form.type === AssessmentType.CAPSTONE && (
        <>
          {form.capstoneBrief && (
            <div className="bg-slate-800/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold flex items-center gap-2 mb-3"><FileText size={16} style={{ color: cfg.accent }} /> The Brief</h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{form.capstoneBrief}</p>
            </div>
          )}
          <div className="bg-slate-800/20 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold flex items-center gap-2 mb-4"><Milestone size={16} style={{ color: cfg.accent }} /> Milestones</h3>
            <div className="space-y-3">
              {(form.milestones || []).map((m, i) => (
                <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-800">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: cfg.accentBg, color: cfg.accent }}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white font-bold">{m.title || `Milestone ${i + 1}`}</p>
                      <span className="text-xs text-gray-500">Week {m.dueWeek} · <span style={{ color: cfg.accent }}>{m.points} pts</span></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                    {m.deliverables.filter(Boolean).map((d, di) => (
                      <p key={di} className="text-xs text-gray-600 flex items-center gap-1 mt-1"><ChevronRight size={9} />{d}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!isProjectLike && form.questions.map((q, i) => {
        const meta = QTYPE_META[q.type]; const QIcon = meta.icon;
        return (
          <div key={i} className="bg-slate-800/20 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <QIcon size={12} style={{ color: cfg.accent }} />{meta.label} · Q{i + 1}
              </span>
              <span className="text-xs font-bold" style={{ color: cfg.accent }}>{q.points} pts</span>
            </div>
            <h3 className="text-lg text-white font-medium mb-5">{q.questionText || <span className="text-gray-600 italic">Question text</span>}</h3>
            {q.type === QuestionType.MULTIPLE_CHOICE && (
              <div className="space-y-2">
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={q.correctAnswer === String(oi) ? { background: cfg.accentBg, borderColor: cfg.accentBorder } : { borderColor: "rgba(75,85,99,0.3)" }}>
                    <span className="w-5 h-5 rounded-full border border-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-500">{String.fromCharCode(65 + oi)}</span>
                    <span className="text-gray-300 text-sm">{opt || `Option ${oi + 1}`}</span>
                    {q.correctAnswer === String(oi) && <span className="ml-auto text-xs font-bold" style={{ color: cfg.accent }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
            {q.type === QuestionType.TRUE_FALSE && (
              <div className="flex gap-3">
                {["True", "False"].map(v => (
                  <div key={v} className="flex-1 py-2.5 rounded-xl border-2 font-bold text-sm text-center"
                    style={q.correctAnswer === v ? { borderColor: cfg.accent, background: cfg.accentBg, color: cfg.accent } : { borderColor: "rgba(75,85,99,0.3)", color: "#6b7280" }}>
                    {v} {q.correctAnswer === v && "✓"}
                  </div>
                ))}
              </div>
            )}
            {(q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.ESSAY) && (
              <div className="rounded-xl border border-dashed border-gray-700 p-4 text-gray-600 text-sm italic">
                [{q.type === QuestionType.SHORT_ANSWER ? "Short answer" : "Essay"} response field]
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}