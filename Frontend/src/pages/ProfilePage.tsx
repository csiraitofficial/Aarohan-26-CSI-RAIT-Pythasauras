import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarUpload } from "@/components/auth/AvatarUpload";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { SessionCard } from "@/components/auth/SessionCard";
import { authService } from "@/services/authService";

const TABS = [
  { id: "general", label: "General", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "professional", label: "Professional", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M3 8a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { id: "preferences", label: "Preferences", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "security", label: "Security", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

export function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // General
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? null);

  // Professional
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [experience, setExperience] = useState(user?.experience ?? "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [linkedin, setLinkedin] = useState(user?.linkedin ?? "");
  const [github, setGithub] = useState(user?.github ?? "");

  // Security
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled ?? false);

  // Sessions
  const sessions = user ? authService.getSessions(user.id) : [];

  const initials = `${(user?.firstName ?? "R")[0]}${(user?.lastName ?? "B")[0]}`.toUpperCase();

  async function saveGeneral() {
    setSaving(true);
    await updateProfile({ firstName, lastName, username, bio, location, website, avatar });
    setSaveMsg("Saved!");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 2000);
  }

  async function saveProfessional() {
    setSaving(true);
    await updateProfile({ jobTitle, company, experience, skills, linkedin, github });
    setSaveMsg("Saved!");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 2000);
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 20) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  }

  async function handleChangePassword() {
    setPwdError("");
    setPwdSuccess("");
    if (newPwd.length < 12) { setPwdError("Min 12 characters"); return; }
    if (newPwd !== confirmPwd) { setPwdError("Passwords don't match"); return; }
    try {
      await changePassword(currentPwd, newPwd);
      setPwdSuccess("Password updated!");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (!user) return null;

  return (
    <AppShell title="Profile">
      <div className="space-y-5">
        {/* Profile header */}
        <Card variant="glass" className="p-4 sm:p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <AvatarUpload
              currentAvatar={avatar}
              initials={initials}
              onAvatarChange={(url) => setAvatar(url)}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-zinc-900 truncate">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-zinc-500">@{user.username}</p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-primary/20 whitespace-nowrap">
                    Level {user.level}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-300" aria-hidden />
                <span className="text-zinc-600">Keep building your interview IQ</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 sm:max-w-md">
                <StatBlock label="Practice Hours" value={user.stats.practiceHours} />
                <StatBlock label="Achievements" value={user.stats.achievements} />
                <StatBlock label="Day Streak" value={user.stats.streak} />
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card variant="glass" className="overflow-hidden">
          <div className="border-b border-zinc-200/80">
            <div className="flex overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                    ? "border-violet-600 text-violet-700 bg-violet-50/70"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/50"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
            </div>
          </div>

          <div className="p-5">
            {/* Save message */}
            {saveMsg && (
              <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700 font-medium">
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" aria-hidden>
                    ✓
                  </span>
                  {saveMsg}
                </span>
              </div>
            )}

            {/* ── General ── */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" value={firstName} onChange={setFirstName} />
                  <Field label="Last Name" value={lastName} onChange={setLastName} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Username" value={username} onChange={setUsername} />
                  <Field label="Email" value={user.email} onChange={() => { }} disabled />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-700 mb-1">Bio</div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={280}
                    rows={3}
                    className="w-full rounded-xl bg-zinc-50 px-3 py-2 text-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-violet-300 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="text-right text-xs text-zinc-400">{bio.length}/280</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Location" value={location} onChange={setLocation} placeholder="City, Country" />
                  <Field label="Website" value={website} onChange={setWebsite} placeholder="https://" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="primary" size="md" onClick={saveGeneral} loading={saving}>Save Changes</Button>
                </div>
              </div>
            )}

            {/* ── Professional ── */}
            {activeTab === "professional" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="Software Engineer" />
                  <Field label="Company" value={company} onChange={setCompany} placeholder="Acme Corp" />
                </div>
                <Field label="Experience Level" value={experience} onChange={setExperience} placeholder="e.g. 3+ years" />

                <div>
                  <div className="text-xs font-semibold text-zinc-700 mb-1">Skills</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700 font-medium">
                        {s}
                        <button
                          type="button"
                          onClick={() => setSkills(skills.filter((x) => x !== s))}
                          className="text-violet-400 hover:text-violet-600"
                        >×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill..."
                      className="flex-1 rounded-xl bg-zinc-50 px-3 py-2 text-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-violet-300"
                    />
                    <Button variant="secondary" size="sm" onClick={addSkill}>Add</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." />
                  <Field label="GitHub" value={github} onChange={setGithub} placeholder="https://github.com/..." />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="primary" size="md" onClick={saveProfessional} loading={saving}>Save Changes</Button>
                </div>
              </div>
            )}

            {/* ── Preferences ── */}
            {activeTab === "preferences" && (
              <div className="space-y-5">
                <Section title="Notifications">
                  <Toggle label="Email notifications" desc="Receive updates via email" defaultChecked />
                  <Toggle label="Push notifications" desc="Browser push notifications" defaultChecked />
                  <Toggle label="Practice reminders" desc="Get reminded to practice" defaultChecked />
                  <Toggle label="Achievement alerts" desc="Celebrate your progress" defaultChecked />
                </Section>

                <Section title="Privacy">
                  <Toggle label="Public profile" desc="Allow others to view your profile" defaultChecked />
                  <Toggle label="Show progress" desc="Display your learning progress" defaultChecked />
                  <Toggle label="Show achievements" desc="Display achievements on profile" defaultChecked />
                </Section>
              </div>
            )}

            {/* ── Security ── */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Change password */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-zinc-700">Change Password</h4>
                  {pwdError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{pwdError}</div>}
                  {pwdSuccess && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-600">✓ {pwdSuccess}</div>}
                  <Field label="Current Password" value={currentPwd} onChange={setCurrentPwd} type="password" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="New Password" value={newPwd} onChange={setNewPwd} type="password" />
                    <Field label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd} type="password" />
                  </div>
                  <Button variant="primary" size="md" onClick={handleChangePassword}>Update Password</Button>
                </div>

                <hr className="border-zinc-200" />

                {/* 2FA */}
                <TwoFactorSetup
                  enabled={twoFactor}
                  onToggle={() => setTwoFactor(!twoFactor)}
                />

                <hr className="border-zinc-200" />

                {/* Sessions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-zinc-700">Active Sessions</h4>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => { authService.revokeAllSessions(user.id); }}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Revoke all others
                      </button>
                    )}
                  </div>
                  {sessions.length === 0 ? (
                    <p className="text-sm text-zinc-500">No active sessions</p>
                  ) : (
                    sessions.map((s) => (
                      <SessionCard key={s.id} session={s} onRevoke={() => authService.revokeSession(user.id, s.id)} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

/* ── Helper components ── */

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/70 px-3 py-2.5 text-center ring-1 ring-zinc-200/80">
      <div className="text-lg font-bold text-zinc-900 leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-medium text-zinc-500 leading-none">{label}</div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-zinc-200/80">
      <div className="text-xs font-semibold text-zinc-700">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-2 w-full rounded-xl bg-zinc-50/80 px-3 py-2 text-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-300/80 focus:border-violet-300/60 disabled:opacity-50"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold text-zinc-700 mb-3">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ label, desc, defaultChecked = false }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-zinc-200/80">
      <div>
        <div className="text-sm font-semibold text-zinc-800">{label}</div>
        <div className="mt-0.5 text-xs text-zinc-500">{desc}</div>
      </div>
      <ToggleSwitch checked={checked} onCheckedChange={setChecked} label={label} />
    </div>
  );
}
