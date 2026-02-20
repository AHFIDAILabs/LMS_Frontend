'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { authService } from '@/services/authService'
import Image from 'next/image'
import {
  User, Lock, Bell, Palette, Camera, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, Shield, Moon, Sun,
  Github, Linkedin, Globe, Phone, Mail, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

type Tab = 'profile' | 'security' | 'notifications' | 'appearance'

interface SaveState { loading: boolean; success: boolean; error: string | null }
const INIT_SAVE: SaveState = { loading: false, success: false, error: null }

export default function InstructorSettingsPage() {
  const { user, refreshUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<Tab>('profile')

  // ── Profile fields ────────────────────────────────────────────────────────
  const [firstName,   setFirstName]   = useState(user?.firstName ?? '')
  const [lastName,    setLastName]    = useState(user?.lastName ?? '')
  const [phone,       setPhone]       = useState(user?.phoneNumber ?? '')
  const [github,      setGithub]      = useState(user?.studentProfile?.githubProfile ?? user?.instructorProfile?.linkedinProfile ?? '')
  const [linkedin,    setLinkedin]    = useState(user?.studentProfile?.linkedinProfile ?? user?.instructorProfile?.linkedinProfile ?? '')
  const [portfolio,   setPortfolio]   = useState(user?.studentProfile?.portfolioUrl ?? '')
  const [bio,         setBio]         = useState(user?.instructorProfile?.bio ?? '')
  const [avatarSrc,   setAvatarSrc]   = useState<string | null>(user?.profileImage ?? null)
  const [avatarFile,  setAvatarFile]  = useState<File | null>(null)
  const [profileSave, setProfileSave] = useState<SaveState>(INIT_SAVE)

  // ── Security fields ───────────────────────────────────────────────────────
  const [currentPwd,  setCurrentPwd]  = useState('')
  const [newPwd,      setNewPwd]      = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [showPwd,     setShowPwd]     = useState({ current: false, new: false, confirm: false })
  const [pwdSave,     setPwdSave]     = useState<SaveState>(INIT_SAVE)

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifEmail,    setNotifEmail]    = useState(true)
  const [notifPush,     setNotifPush]     = useState(true)
  const [notifMarketing,setNotifMarketing]= useState(false)
  const [notifUpdates,  setNotifUpdates]  = useState(true)
  const [notifSave,     setNotifSave]     = useState<SaveState>(INIT_SAVE)

  // ── Appearance ────────────────────────────────────────────────────────────
  const [theme,      setTheme]      = useState<'dark' | 'light' | 'system'>('dark')
  const [compact,    setCompact]    = useState(false)
  const [appearSave, setAppearSave] = useState<SaveState>(INIT_SAVE)

  // ── Avatar preview ────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarSrc(URL.createObjectURL(file))
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileSave({ loading: true, success: false, error: null })
    try {
      const formData = new FormData()
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      if (phone)     formData.append('phoneNumber', phone)
      if (avatarFile) formData.append('profileImage', avatarFile)
      const res = await authService.updateProfile(formData as any)
      if (res.success) {
        await refreshUser?.()
        setProfileSave({ loading: false, success: true, error: null })
        setTimeout(() => setProfileSave(INIT_SAVE), 3000)
      } else {
        setProfileSave({ loading: false, success: false, error: res.message ?? 'Failed to save' })
      }
    } catch (err: any) {
      setProfileSave({ loading: false, success: false, error: err.message ?? 'Unexpected error' })
    }
  }

  // ── Save password ─────────────────────────────────────────────────────────
  const savePassword = async () => {
    if (newPwd !== confirmPwd) {
      setPwdSave({ loading: false, success: false, error: 'Passwords do not match' })
      return
    }
    if (newPwd.length < 8) {
      setPwdSave({ loading: false, success: false, error: 'Password must be at least 8 characters' })
      return
    }
    setPwdSave({ loading: true, success: false, error: null })
    try {
      const res = await authService.changePassword({ currentPassword: currentPwd, newPassword: newPwd })
      if (res.success) {
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        setPwdSave({ loading: false, success: true, error: null })
        setTimeout(() => setPwdSave(INIT_SAVE), 3000)
      } else {
        setPwdSave({ loading: false, success: false, error: res.message ?? 'Failed to update password' })
      }
    } catch (err: any) {
      setPwdSave({ loading: false, success: false, error: err.message ?? 'Unexpected error' })
    }
  }

  const saveNotifications = async () => {
    setNotifSave({ loading: true, success: false, error: null })
    await new Promise(r => setTimeout(r, 800)) // optimistic
    setNotifSave({ loading: false, success: true, error: null })
    setTimeout(() => setNotifSave(INIT_SAVE), 3000)
  }

  const saveAppearance = async () => {
    setAppearSave({ loading: true, success: false, error: null })
    await new Promise(r => setTimeout(r, 800))
    setAppearSave({ loading: false, success: true, error: null })
    setTimeout(() => setAppearSave(INIT_SAVE), 3000)
  }

  const userInitials = `${(user?.firstName?.[0] ?? '').toUpperCase()}${(user?.lastName?.[0] ?? '').toUpperCase()}`

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile',       label: 'Profile',       icon: User },
    { id: 'security',      label: 'Security',      icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance',    label: 'Appearance',    icon: Palette },
  ]

  // ── Input + toggle helpers ────────────────────────────────────────────────
  const Input = ({
    label, value, onChange, type = 'text', placeholder = '', icon: Icon, readOnly = false,
    suffix,
  }: {
    label: string; value: string; onChange?: (v: string) => void;
    type?: string; placeholder?: string; icon?: any; readOnly?: boolean; suffix?: React.ReactNode
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={clsx(
            'w-full bg-slate-900 border border-gray-700/60 rounded-xl py-2.5 text-sm text-white placeholder-gray-600 transition-all outline-none',
            Icon ? 'pl-10' : 'pl-4',
            suffix ? 'pr-12' : 'pr-4',
            readOnly ? 'opacity-50 cursor-not-allowed' : `focus:border-blue-500/50 focus:ring-2 ring-blue-500/30`,
          )}
        />
        {suffix && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  )

  const Toggle = ({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-800/60 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 ml-4',
          checked ? 'bg-blue-500' : 'bg-slate-700'
        )}
      >
        <span className={clsx(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  )

  const SaveBar = ({ state, onSave }: { state: SaveState; onSave: () => void }) => (
    <div className="flex items-center justify-between pt-6 border-t border-gray-800/60">
      <div>
        {state.success && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" /><span>Saved successfully</span>
          </div>
        )}
        {state.error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" /><span>{state.error}</span>
          </div>
        )}
      </div>
      <button
        onClick={onSave}
        disabled={state.loading}
        className={clsx(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
          'bg-blue-500 hover:bg-blue-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {state.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {state.loading ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account preferences and profile</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Tab sidebar ──────────────────────────────────────────────── */}
          <nav className="lg:w-52 shrink-0">
            <div className="bg-slate-900 border border-gray-800/60 rounded-2xl p-2 flex lg:flex-col gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left',
                    tab === t.id
                      ? `bg-blue-500/10 text-blue-400 border-blue-500/20 border`
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <t.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:block">{t.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* ── Content panel */}
          <div className="flex-1 min-w-0">

            {/* ══ PROFILE*/}
            {tab === 'profile' && (
              <div className="bg-slate-900 border border-gray-800/60 rounded-2xl p-6 space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Profile Information</h2>
                  <p className="text-gray-500 text-sm">Update your public profile details</p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {avatarSrc
                        ? <Image src={avatarSrc} alt="" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                        : <span>{userInitials || '?'}</span>}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="mt-2 text-xs text-blue-400 hover:underline font-medium"
                    >
                      Change photo
                    </button>
                  </div>
                </div>

                {/* Name row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
                  <Input label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Doe"  />
                </div>

                {/* Email (read-only) */}
                <Input label="Email address" value={user?.email ?? ''} icon={Mail} readOnly />

                {/* Phone */}
                <Input label="Phone number" value={phone} onChange={setPhone} icon={Phone} placeholder="+1 (555) 000-0000" />
                
                {/* Bio (instructor only) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    value={bio} onChange={e => setBio(e.target.value)}
                    rows={4} placeholder="Tell students about yourself…"
                    className="w-full bg-slate-900 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-2 ring-blue-500/30 outline-none resize-none transition-all"
                  />
                </div>

                
                {/* Student social links */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="GitHub" value={github} onChange={setGithub} icon={Github} placeholder="https://github.com/username" />
                  <Input label="LinkedIn" value={linkedin} onChange={setLinkedin} icon={Linkedin} placeholder="https://linkedin.com/in/username" />
                </div>
                <Input label="Portfolio / Website" value={portfolio} onChange={setPortfolio} icon={Globe} placeholder="https://yoursite.com" />
                

                <SaveBar state={profileSave} onSave={saveProfile} />
              </div>
            )}

            {/* ══ SECURITY ═══════════════════════════════════════════════ */}
            {tab === 'security' && (
              <div className="space-y-5">
                {/* Change password */}
                <div className="bg-slate-900 border border-gray-800/60 rounded-2xl p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Change Password</h2>
                    <p className="text-gray-500 text-sm">Use a strong, unique password</p>
                  </div>

                  <Input
                    label="Current password" value={currentPwd} onChange={setCurrentPwd}
                    type={showPwd.current ? 'text' : 'password'} icon={Lock}
                    suffix={
                      <button onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}>
                        {showPwd.current ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </button>
                    }
                  />
                  <Input
                    label="New password" value={newPwd} onChange={setNewPwd}
                    type={showPwd.new ? 'text' : 'password'} icon={Lock}
                    suffix={
                      <button onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}>
                        {showPwd.new ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </button>
                    }
                  />
                  <Input
                    label="Confirm new password" value={confirmPwd} onChange={setConfirmPwd}
                    type={showPwd.confirm ? 'text' : 'password'} icon={Lock}
                    suffix={
                      <button onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}>
                        {showPwd.confirm ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </button>
                    }
                  />

                  {/* Strength hint */}
                  {newPwd.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[8, 12, 16, 20].map(n => (
                          <div key={n} className={clsx(
                            'h-1 flex-1 rounded-full transition-all',
                            newPwd.length >= n ? 'bg-blue-500' : 'bg-slate-700'
                          )} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {newPwd.length < 8 ? 'Too short' : newPwd.length < 12 ? 'Weak' : newPwd.length < 16 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}

                  <SaveBar state={pwdSave} onSave={savePassword} />
                </div>

                {/* 2FA info card */}
                <div className="bg-slate-900 border border-gray-800/60 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border-blue-500/20 border shrink-0">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-gray-500 font-medium shrink-0">Coming soon</span>
                  </div>
                </div>

                {/* Active sessions */}
                <div className="bg-slate-900 border border-gray-800/60 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    {[
                      { device: 'Current device', browser: 'Chrome on macOS', time: 'Active now', current: true },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800/60 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-white">{s.device}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{s.browser} · {s.time}</p>
                        </div>
                        {s.current
                          ? <span className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 font-semibold">This device</span>
                          : <button className="text-xs text-red-400 hover:text-red-300 font-medium">Revoke</button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ NOTIFICATIONS ══════════════════════════════════════════ */}
            {tab === 'notifications' && (
              <div className="bg-slate-900 border border-gray-800/60 rounded-2xl p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-1">Notification Preferences</h2>
                  <p className="text-gray-500 text-sm">Control how and when you're notified</p>
                </div>

                <div className="space-y-0">
                  <Toggle
                    label="Email notifications"
                    description="Receive important updates and alerts via email"
                    checked={notifEmail} onChange={setNotifEmail}
                  />
                  <Toggle
                    label="Push notifications"
                    description="Get real-time alerts in your browser"
                    checked={notifPush} onChange={setNotifPush}
                  />
                  <Toggle
                    label="Product updates"
                    description="News about new features and improvements"
                    checked={notifUpdates} onChange={setNotifUpdates}
                  />
                  <Toggle
                    label="Marketing emails"
                    description="Promotions, offers, and partner content"
                    checked={notifMarketing} onChange={setNotifMarketing}
                  />
                </div>

                <SaveBar state={notifSave} onSave={saveNotifications} />
              </div>
            )}

            {/* ══ APPEARANCE ══════════════════════════════════════════════ */}
            {tab === 'appearance' && (
              <div className="bg-slate-900 border border-gray-800/60 rounded-2xl p-6 space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Appearance</h2>
                  <p className="text-gray-500 text-sm">Customise how the dashboard looks</p>
                </div>

                {/* Theme picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'dark',   label: 'Dark',   icon: Moon },
                      { value: 'light',  label: 'Light',  icon: Sun },
                      { value: 'system', label: 'System', icon: Palette },
                    ] as const).map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={clsx(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                          theme === t.value
                            ? `bg-blue-500/10 border-blue-500/20 text-blue-400`
                            : 'bg-slate-800/50 border-gray-700/40 text-gray-400 hover:border-gray-600'
                        )}
                      >
                        <t.icon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact mode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Layout density</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: false, label: 'Comfortable', desc: 'Default spacing' },
                      { value: true,  label: 'Compact',     desc: 'Denser layout' },
                    ]).map(o => (
                      <button
                        key={String(o.value)}
                        onClick={() => setCompact(o.value)}
                        className={clsx(
                          'flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all',
                          compact === o.value
                            ? `bg-blue-500/10 border-blue-500/20 text-blue-400`
                            : 'bg-slate-800/50 border-gray-700/40 text-gray-400 hover:border-gray-600'
                        )}
                      >
                        <span className="text-sm font-semibold">{o.label}</span>
                        <span className="text-xs opacity-70">{o.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <SaveBar state={appearSave} onSave={saveAppearance} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}