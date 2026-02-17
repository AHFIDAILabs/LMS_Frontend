"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/services/studentService";
import { 
  ArrowLeft, Check, Loader2, Play, BookOpen, Code, 
  AlertCircle, Lightbulb, ExternalLink, ChevronRight,
  Copy, CheckCheck, Target, BookMarked, FileText,
  FileQuestion, BookCheck,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

export default function LessonDetailPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  const [hasStarted, setHasStarted] = useState(false);

  const lessonId = params.lessonId;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") {
      router.replace("/auth/login");
      return;
    }
    void load();
  }, [authLoading, isAuthenticated, user?.role, lessonId]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const res = await studentService.getLessonDetails(lessonId);
    if (res.success) {
      setData(res.data);
      const status = res.data?.progress?.status;
      if (status === 'in_progress' || status === 'completed') {
        setHasStarted(true);
      }
    } else {
      setErr(res.error || "Failed to load lesson");
      toast.error(res.error || "Failed to load lesson");
    }
    setLoading(false);
  };

  const onStart = async () => {
    if (hasStarted) return;
    setSaving(true);
    try {
      const res = await studentService.startLesson(lessonId);
      if (res.success) {
        setHasStarted(true);
        setData((prev: any) => ({
          ...prev,
          progress: { ...prev.progress, status: 'in_progress', startedAt: new Date().toISOString() }
        }));
        toast.success("Lesson started! Let's learn 🚀");
      } else {
        toast.error(res.error || "Failed to start lesson");
      }
    } catch (error) {
      toast.error("Failed to start lesson");
    } finally {
      setSaving(false);
    }
  };

  const onComplete = async () => {
    setSaving(true);
    try {
      const res = await studentService.completeLesson(lessonId, 0);
      if (res.success) {
        setData((prev: any) => ({
          ...prev,
          progress: { ...prev.progress, status: 'completed', completedAt: new Date().toISOString() }
        }));
        toast.success("Lesson completed! 🎉");
        setTimeout(() => {
          if (data?.navigation?.next) {
            router.push(`/dashboard/students/lessons/${data.navigation.next._id}`);
          }
        }, 1500);
      } else {
        toast.error(res.error || "Failed to complete lesson");
      }
    } catch (error) {
      toast.error("Failed to complete lesson");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 p-6">
          <div className="text-center max-w-md mx-auto mt-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">{err || "Lesson not found"}</p>
            <Link href="/dashboard/students/courses" className="text-lime-400 hover:text-lime-300 underline">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lesson = data.lesson;
  const progress = data.progress || {};
  const nav = data.navigation || {};
  const module = lesson.moduleId;
  const course = module.courseId;

  const isCompleted = progress.status === "completed";
  const isInProgress = progress.status === "in_progress" || hasStarted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      <StudentSidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="fixed inset-0 ml-64 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-6 text-sm">
              <Link href="/dashboard/students/courses" className="text-gray-400 hover:text-gray-300 transition-colors">
                Courses
              </Link>
              <ChevronRight size={14} className="text-gray-600" />
              <Link href={`/dashboard/students/modules/${module._id}`} className="text-gray-400 hover:text-gray-300 transition-colors">
                {module.title}
              </Link>
              <ChevronRight size={14} className="text-gray-600" />
              <span className="text-gray-500">Current Lesson</span>
            </div>

            <div className="flex items-start gap-6">
              <Link
                href={`/dashboard/students/modules/${module._id}`}
                className="group mt-2 px-4 py-3 bg-gradient-to-br from-slate-800/90 to-slate-800/70 hover:from-slate-700/90 hover:to-slate-700/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1.5 bg-lime-500/10 border border-lime-500/20 rounded-lg">
                    <span className="text-lime-400 text-xs font-semibold uppercase tracking-wide">{course.title}</span>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <CheckCheck size={12} className="text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-semibold">Completed</span>
                    </div>
                  )}
                  {isInProgress && !isCompleted && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="text-yellow-400 text-xs font-semibold">In Progress</span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                  {lesson.title}
                </h1>

                <div className="flex items-center gap-3 mt-6">
                  {!isCompleted && (
                    <>
                      {!isInProgress && (
                        <button
                          onClick={onStart}
                          disabled={saving}
                          className="px-6 py-3 bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 backdrop-blur-xl border border-slate-600/50 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="fill-current" />}
                          <span>Start Lesson</span>
                        </button>
                      )}
                      
                      {isInProgress && (
                        <button
                          onClick={onComplete}
                          disabled={saving}
                          className="px-6 py-3 bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-400 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40"
                        >
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                          <span>Mark as Complete</span>
                        </button>
                      )}
                    </>
                  )}
                  
                  {isCompleted && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                      <CheckCheck size={20} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Lesson Completed!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Lesson Content */}
          <div className="mb-16">
            <LessonContentRenderer content={lesson.content} />
          </div>

          {/* Assessments Section */}
          {data.assessments && data.assessments.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <FileText size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Assessments & Assignments</h2>
                    <p className="text-gray-400 text-sm">Complete these to test your knowledge</p>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {data.assessments.map((assessment: any) => {
                    const submission = assessment.submission;
                    const isSubmitted = !!submission;
                    const isGraded = submission?.status === 'graded';
                    const isPassed = isGraded && submission?.percentage >= assessment.passingScore;

                    return (
                      <Link
                        key={assessment._id}
                        href={`/dashboard/students/assessment/${assessment._id}`}
                        className="group flex items-center justify-between p-5 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 hover:border-purple-500/50 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            {assessment.type === 'quiz' ? <FileQuestion size={24} className="text-purple-400" /> :
                             assessment.type === 'project' ? <BookCheck size={24} className="text-purple-400" /> :
                             assessment.type === 'capstone' ? <Target size={24} className="text-purple-400" /> :
                             <FileText size={24} className="text-purple-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors text-lg mb-1">
                              {assessment.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                              <span className="capitalize">{assessment.type || 'Assessment'}</span>
                              {assessment.passingScore && <><span className="text-gray-600">•</span><span>Passing: {assessment.passingScore}%</span></>}
                              {assessment.duration && <><span className="text-gray-600">•</span><div className="flex items-center gap-1"><Clock size={14} /><span>{assessment.duration} min</span></div></>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!isSubmitted ? (
                              <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <span className="text-yellow-400 font-semibold text-sm">Not Started</span>
                              </div>
                            ) : isGraded ? (
                              <div className={`px-4 py-2 rounded-lg ${isPassed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                <span className={`font-bold text-sm ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {submission.percentage}% · {isPassed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                            ) : (
                              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <span className="text-blue-400 font-semibold text-sm">Submitted</span>
                              </div>
                            )}
                            <ChevronRight size={20} className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <nav className="sticky bottom-6 flex items-center justify-between gap-4 p-5 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
            {nav.previous ? (
              <Link
                href={`/dashboard/students/lessons/${nav.previous._id}`}
                className="group flex items-center gap-3 px-5 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 flex-1 max-w-xs"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform shrink-0" />
                <div className="text-left min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">Previous Lesson</div>
                  <div className="font-medium text-sm truncate">{nav.previous.title}</div>
                </div>
              </Link>
            ) : <div className="flex-1" />}

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-lg">
              <BookMarked size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">Lesson {lesson.order || 1}</span>
            </div>

            {nav.next ? (
              <Link
                href={`/dashboard/students/lessons/${nav.next._id}`}
                className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-400 rounded-xl text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-lime-500/30 flex-1 max-w-xs justify-end"
              >
                <div className="text-right min-w-0">
                  <div className="text-xs text-lime-100 mb-0.5">Next Lesson</div>
                  <div className="font-medium text-sm truncate">{nav.next.title}</div>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-5 py-3 bg-slate-700/30 rounded-xl text-gray-500 text-sm flex-1 max-w-xs justify-end">
                <Target size={16} />
                <span>Module Complete</span>
              </div>
            )}
          </nav>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// CONTENT NORMALIZER
//
// The DB stores lesson.content as a markdown code-fence wrapping
// a JSON object, like:
//
//   ```json
//   {
//     "title": "...",
//     "description": "...",
//     "learningObjectives": [...],
//     "content": "# actual markdown body\n..."
//   }
//   ```
//
// This function handles every shape that might arrive:
//   1. String with ```json fence  → strip fence, parse JSON, extract fields
//   2. Plain JSON string (no fence) → parse JSON, extract fields
//   3. Already a JS object         → extract fields directly
//   4. Plain markdown string       → use as body directly
// ============================================================
interface NormalizedContent {
  title?: string;
  description?: string;
  objectives?: string[];
  body: string;
}

function extractFromParsed(obj: Record<string, any>): NormalizedContent {
  const rawBody = typeof obj.content === 'string' ? obj.content : '';
  // The nested "content" field uses \\n literal escapes from JSON serialization
  const body = rawBody
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .trim();

  return {
    title: typeof obj.title === 'string' ? obj.title : undefined,
    description: typeof obj.description === 'string' ? obj.description : undefined,
    objectives: Array.isArray(obj.learningObjectives)
      ? (obj.learningObjectives as any[]).filter((o) => typeof o === 'string')
      : undefined,
    body,
  };
}

function parseMalformedLessonJson(str: string): NormalizedContent {
  // The DB stores content as a pseudo-JSON where the "content" field value
  // contains real unescaped newlines, making JSON.parse throw. We parse
  // each field manually instead.

  function extractSimpleField(key: string): string | undefined {
    const m = str.match(new RegExp(`"${key}"\\s*:\\s*"([^"\\n]*)"`));
    return m ? m[1] : undefined;
  }

  function extractArray(key: string): string[] {
    const m = str.match(new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`));
    if (!m) return [];
    return [...m[1].matchAll(/"([^"]*)"/g)].map((x: RegExpMatchArray) => x[1]);
  }

  function extractContent(): string {
    const lines = str.split('\n');
    let inContent = false;
    const bodyLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!inContent) {
        const startMatch = line.match(/^\s*"content"\s*:\s*"(.*)/);
        if (startMatch) {
          inContent = true;
          const rest = startMatch[1];
          if (rest.endsWith('"')) return rest.slice(0, -1);
          bodyLines.push(rest);
          continue;
        }
      } else {
        if (line.endsWith('"')) {
          const nextLine = lines.slice(i + 1).find((l: string) => l.trim());
          if (nextLine && nextLine.trim() === '}') {
            bodyLines.push(line.slice(0, -1));
            break;
          }
        }
        bodyLines.push(line);
      }
    }
    return bodyLines.join('\n').trim();
  }

  return {
    title: extractSimpleField('title'),
    description: extractSimpleField('description'),
    objectives: extractArray('learningObjectives'),
    body: extractContent(),
  };
}

function normalizeContent(raw: unknown): NormalizedContent {
  // ── A: already a JS object ───────────────────────────────────────────────
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    return extractFromParsed(raw as Record<string, any>);
  }

  if (typeof raw !== 'string') return { body: '' };

  // Normalise line endings
  let str = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // ── B: double-encoded JSON string literal ─────────────────────────────────
  if (str.startsWith('"') && str.endsWith('"')) {
    try {
      const inner = JSON.parse(str);
      if (typeof inner === 'string') str = inner.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    } catch { /* ignore */ }
  }

  // ── C: strip ```json ... ``` fence ────────────────────────────────────────
  const lines = str.split('\n');
  const firstLine = lines[0].trim();
  const lastLine  = lines[lines.length - 1].trim();
  if ((firstLine === '```json' || firstLine === '```') && lastLine === '```') {
    str = lines.slice(1, lines.length - 1).join('\n').trim();
  }

  // ── D: try JSON.parse (works if content field has no raw newlines) ────────
  if (str.startsWith('{')) {
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return extractFromParsed(parsed);
      }
    } catch {
      // JSON.parse fails when "content" field has unescaped newlines — use
      // the manual line-by-line parser instead
      return parseMalformedLessonJson(str);
    }
  }

  // ── E: plain markdown string ──────────────────────────────────────────────
  return {
    body: str
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .trim()
  };
}

// ============================================================
// CONTENT RENDERER
// Accepts the raw lesson.content (any shape) and renders it
// as structured, human-readable UI.
// ============================================================
function LessonContentRenderer({ content }: { content: unknown }) {
  // ── DEBUG: remove this block once content renders correctly ───────────────
  if (process.env.NODE_ENV === 'development') {
    console.log('[LessonContent] typeof:', typeof content);
    console.log('[LessonContent] value:', content);
  }
  // ─────────────────────────────────────────────────────────────────────────
  const normalized = normalizeContent(content);
  const sections = parseContent(normalized.body);

  return (
    <div className="space-y-8">
      {/* Learning Objectives — shown when present in the content object */}
      {normalized.objectives && normalized.objectives.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-2xl p-7 backdrop-blur-sm shadow-lg">
          <div className="flex items-start gap-5">
            <div className="p-3 bg-slate-900/50 rounded-xl text-cyan-400">
              <Target size={24} className="shrink-0" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-cyan-400 mb-3 text-xl">Learning Objectives</h4>
              <ul className="space-y-2">
                {normalized.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Description — shown when present and not already in body */}
      {normalized.description && (
        <div className="p-6 bg-slate-800/40 border border-slate-700/40 rounded-2xl">
          <p className="text-gray-300 text-lg leading-relaxed">{normalized.description}</p>
        </div>
      )}

      {/* Main body — parsed markdown sections */}
      {sections.map((section, idx) => (
        <ContentSection key={idx} section={section} index={idx} />
      ))}
    </div>
  );
}

function ContentSection({ section, index }: { section: any; index: number }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(section.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (section.type === 'heading') {
    return (
      <div className="scroll-mt-24 opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}>
        {section.level === 1 && (
          <div className="relative group mb-6">
            <div className="absolute -left-4 top-0 w-1.5 h-full bg-gradient-to-b from-lime-400 via-lime-500 to-lime-600 rounded-full group-hover:w-2 transition-all" />
            <h1 className="text-4xl font-bold text-white pl-4">{section.text}</h1>
          </div>
        )}
        {section.level === 2 && (
          <div className="relative group mb-5 mt-12">
            <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full group-hover:w-1.5 transition-all" />
            <h2 className="text-3xl font-bold text-white pl-4">{section.text}</h2>
          </div>
        )}
        {section.level === 3 && (
          <h3 className="text-2xl font-semibold text-gray-200 mb-4 mt-8 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full" />
            {section.text}
          </h3>
        )}
      </div>
    );
  }

  if (section.type === 'paragraph') {
    return (
      <div className="opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}>
        <p className="text-gray-300 text-lg leading-relaxed">{section.text}</p>
      </div>
    );
  }

  if (section.type === 'list') {
    return (
      <div
        className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-7 opacity-0 animate-fadeIn shadow-lg"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
      >
        <ul className="space-y-4">
          {section.items.map((item: any, i: number) => (
            <li
              key={i}
              className="flex items-start gap-4 text-gray-300 group pl-2 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${(index * 80) + (i * 50)}ms`, animationFillMode: 'forwards' }}
            >
              <span className="mt-2 w-2 h-2 rounded-full bg-gradient-to-r from-lime-400 to-lime-500 group-hover:scale-150 transition-all shrink-0" />
              <span className="flex-1">
                <strong className="text-white font-semibold text-lg">{item.title}</strong>
                {item.description && <span className="text-gray-400 block mt-1">{item.description}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.type === 'code') {
    return (
      <div className="group relative opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}>
        <div className="absolute -inset-1 bg-gradient-to-r from-lime-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800/70 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <Code size={16} className="text-lime-400" />
              <span className="text-gray-400 font-mono text-sm font-semibold uppercase tracking-wide">
                {section.language || 'python'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
              >
                {copied ? <><CheckCheck size={14} className="text-lime-400" /><span className="text-lime-400">Copied!</span></> : <><Copy size={14} /><span>Copy</span></>}
              </button>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
            </div>
          </div>
          <pre className="p-6 overflow-x-auto">
            <SyntaxHighlighter code={section.code} language={section.language} />
          </pre>
        </div>
      </div>
    );
  }

  if (section.type === 'callout') {
    const variants = {
      practice: { bg: 'from-lime-500/10 to-lime-500/5', border: 'border-lime-500/30', icon: 'text-lime-400', Icon: Target },
      summary:  { bg: 'from-cyan-500/10 to-cyan-500/5',  border: 'border-cyan-500/30',  icon: 'text-cyan-400',  Icon: BookMarked },
      tip:      { bg: 'from-amber-500/10 to-amber-500/5',border: 'border-amber-500/30', icon: 'text-amber-400', Icon: Lightbulb },
      info:     { bg: 'from-blue-500/10 to-blue-500/5',  border: 'border-blue-500/30',  icon: 'text-blue-400',  Icon: AlertCircle },
    };
    const variant = variants[section.variant as keyof typeof variants] || variants.info;
    const Icon = variant.Icon;

    return (
      <div
        className={`bg-gradient-to-br ${variant.bg} border ${variant.border} rounded-2xl p-7 opacity-0 animate-fadeIn backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300`}
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
      >
        <div className="flex items-start gap-5">
          <div className={`p-3 bg-slate-900/50 rounded-xl ${variant.icon}`}>
            <Icon size={24} className="shrink-0" />
          </div>
          <div className="flex-1">
            {section.title && <h4 className={`font-bold ${variant.icon} mb-3 text-xl`}>{section.title}</h4>}
            <div className="text-gray-300 leading-relaxed text-base space-y-2">
              {section.items ? (
                <ul className="space-y-2">
                  {section.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${variant.icon.replace('text-', 'bg-')}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{section.text}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'link') {
    return (
      <a
        href={section.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-slate-800/60 to-slate-800/40 hover:from-slate-700/60 hover:to-slate-700/40 border border-slate-700/50 rounded-xl text-lime-400 hover:text-lime-300 transition-all duration-300 hover:scale-105 opacity-0 animate-fadeIn shadow-lg hover:shadow-xl font-medium"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
      >
        <ExternalLink size={16} />
        <span>{section.text}</span>
      </a>
    );
  }

  return null;
}

// ============================================================
// SYNTAX HIGHLIGHTER
// ============================================================
function SyntaxHighlighter({ code, language }: { code: string; language?: string }) {
  const lines = code.split('\n');
  return (
    <code className="text-sm font-mono leading-relaxed block">
      {lines.map((line, i) => (
        <div key={i} className="table-row group hover:bg-slate-800/30 transition-colors">
          <span className="table-cell pr-4 text-right text-gray-600 select-none group-hover:text-gray-500 w-12">{i + 1}</span>
          <span className="table-cell text-gray-300">{highlightLine(line, language)}</span>
        </div>
      ))}
    </code>
  );
}

function highlightLine(line: string, language?: string) {
  if (!line.trim()) return <span>&nbsp;</span>;
  if (language === 'python' || !language) {
    if (line.includes('#')) {
      const hashIndex = line.indexOf('#');
      const code = line.slice(0, hashIndex);
      const comment = line.slice(hashIndex);
      return <>{highlightPythonCode(code)}<span className="text-gray-600 italic">{comment}</span></>;
    }
    return highlightPythonCode(line);
  }
  return <>{line}</>;
}

function highlightPythonCode(code: string) {
  const keywords = ['def','class','if','else','elif','for','while','return','import','from','as','try','except','finally','with','lambda','yield','pass','break','continue','raise','assert','in','is','not','and','or','print'];
  const parts = code.split(/(\s+|[()[\]{}'",.:;=<>+\-*/%])/);
  return (
    <>
      {parts.map((part, i) => {
        if (keywords.includes(part)) return <span key={i} className="text-purple-400 font-semibold">{part}</span>;
        if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) return <span key={i} className="text-green-400">{part}</span>;
        if (/^\d+$/.test(part)) return <span key={i} className="text-orange-400">{part}</span>;
        if (i < parts.length - 1 && parts[i + 1] === '(') return <span key={i} className="text-blue-400 font-medium">{part}</span>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ============================================================
// CONTENT PARSER
// ============================================================
function parseContent(content: string) {
  const sections: any[] = [];
  // Normalise Windows (\r\n) and old-Mac (\r) line endings
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    // Headings  (#, ##, ###)
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');

      // Treat special ## headings as callouts instead of headings
      if (level === 2) {
        const lower = text.toLowerCase();

        if (lower.startsWith('practice')) {
          const items: string[] = [];
          i++;
          while (i < lines.length && /^\d+\./.test(lines[i].trim())) {
            items.push(lines[i].trim().replace(/^\d+\.\s*/, ''));
            i++;
          }
          while (i < lines.length && /^[*-]/.test(lines[i].trim())) {
            items.push(lines[i].trim().replace(/^[*-]\s*/, ''));
            i++;
          }
          sections.push({ type: 'callout', variant: 'practice', title: text, items });
          continue;
        }

        if (lower.startsWith('summary')) {
          i++;
          // Collect all paragraph lines until next heading or end
          const summaryLines: string[] = [];
          while (i < lines.length && !lines[i].trim().startsWith('#')) {
            const l = lines[i].trim();
            if (l) summaryLines.push(l);
            i++;
          }
          sections.push({ type: 'callout', variant: 'summary', title: text, text: summaryLines.join(' ') });
          continue;
        }

        if (lower.startsWith('additional') || lower.startsWith('next steps') || lower.startsWith('resources')) {
          const items: string[] = [];
          i++;
          while (i < lines.length && /^[*-]/.test(lines[i].trim())) {
            // Handle <https://...> angle-bracket links inside list items
            const raw = lines[i].trim().replace(/^[*-]\s*/, '');
            items.push(raw.replace(/<(https?:\/\/[^>]+)>/g, '$1'));
            i++;
          }
          sections.push({ type: 'callout', variant: 'tip', title: text, items });
          continue;
        }
      }

      sections.push({ type: 'heading', level, text });
      i++;
      continue;
    }

    // Code blocks  (``` ... ```)
    if (line.startsWith('```')) {
      const language = line.replace(/^```/, '').trim() || 'python';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      sections.push({ type: 'code', language, code: codeLines.join('\n') });
      i++; // consume closing ```
      continue;
    }

    // Numbered lists  (1. 2. 3.)
    if (/^\d+\./.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\./.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s*/, ''));
        i++;
      }
      sections.push({ type: 'callout', variant: 'practice', title: 'Exercises', items });
      continue;
    }

    // Bullet lists  (* or -)
    if (/^[*-]\s/.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^[*-]\s/.test(lines[i].trim())) {
        const itemLine = lines[i].trim().replace(/^[*-]\s*/, '');
        // Check for "Title: description" pattern
        const colonIdx = itemLine.indexOf(':');
        if (colonIdx > 0) {
          const t = itemLine.slice(0, colonIdx).replace(/\*\*/g, '').trim();
          const d = itemLine.slice(colonIdx + 1).trim();
          items.push({ title: t, description: d || null });
        } else {
          items.push({ title: itemLine, description: null });
        }
        i++;
      }
      sections.push({ type: 'list', items });
      continue;
    }

    // Markdown links  [text](url)
    const mdLink = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdLink) {
      sections.push({ type: 'link', text: mdLink[1], url: mdLink[2] });
      i++;
      continue;
    }

    // Angle-bracket bare URLs  <https://...>
    const angleLink = line.match(/^<(https?:\/\/[^>]+)>$/);
    if (angleLink) {
      sections.push({ type: 'link', text: angleLink[1], url: angleLink[1] });
      i++;
      continue;
    }

    // Skip stray JSON artifacts
    if (line === '}' || line === '"' || line === "'" || line === '```') {
      i++;
      continue;
    }

    // Everything else → paragraph
    sections.push({ type: 'paragraph', text: line });
    i++;
  }

  return sections;
}