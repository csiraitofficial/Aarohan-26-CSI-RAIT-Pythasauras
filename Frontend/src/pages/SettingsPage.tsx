import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

type AuthSnapshot = {
  name: string;
  email: string;
};

function readAuth(): AuthSnapshot | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem("robobuddy.auth");
  if (!v) return null;
  try {
    const parsed = JSON.parse(v) as Partial<AuthSnapshot>;
    if (typeof parsed.name !== "string" || typeof parsed.email !== "string") return null;
    if (!parsed.name.trim() || !parsed.email.trim()) return null;
    return { name: parsed.name, email: parsed.email };
  } catch {
    return null;
  }
}

function writeAuth(next: AuthSnapshot) {
  window.localStorage.setItem("robobuddy.auth", JSON.stringify(next));
  window.dispatchEvent(new StorageEvent("storage", { key: "robobuddy.auth" }));
}

function clearAuth() {
  window.localStorage.removeItem("robobuddy.auth");
  window.dispatchEvent(new StorageEvent("storage", { key: "robobuddy.auth" }));
}

export function SettingsPage() {
  const auth = readAuth();
  const [profileName, setProfileName] = useState(auth?.name ?? "");
  const [email, setEmail] = useState(auth?.email ?? "");

  const [soundFx, setSoundFx] = useState(false);
  const [reducedMotionMode, setReducedMotionMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [cameraAutoStart, setCameraAutoStart] = useState(false);

  const summary = useMemo(() => {
    return {
      privacy: shareAnalytics ? "Enabled" : "Disabled",
      camera: cameraAutoStart ? "Auto" : "Manual",
    } as const;
  }, [cameraAutoStart, shareAnalytics]);

  return (
    <AppShell title="Settings">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          {auth ? (
            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Account</div>
                  <div className="mt-1 text-xs text-zinc-500">Update your profile details</div>
                </div>
                <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
                  Signed in
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name" value={profileName} onChange={setProfileName} placeholder="Your name" />
                <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    writeAuth({ name: profileName.trim(), email: email.trim() });
                  }}
                  disabled={!profileName.trim() || !email.trim()}
                >
                  Save changes
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setProfileName(auth.name);
                    setEmail(auth.email);
                  }}
                >
                  Reset
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="glass" className="p-4 sm:p-5">
              <div className="text-sm font-semibold text-zinc-700">Sign in</div>
              <div className="mt-1 text-xs text-zinc-500">Use a quick local demo sign-in (no backend)</div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name" value={profileName} onChange={setProfileName} placeholder="Your name" />
                <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    writeAuth({ name: profileName.trim(), email: email.trim() });
                  }}
                  disabled={!profileName.trim() || !email.trim()}
                >
                  Sign in
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setProfileName("");
                    setEmail("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </Card>
          )}

          <Card variant="glass" className="p-4 sm:p-5">
            <div className="text-sm font-semibold text-zinc-700">Preferences</div>
            <div className="mt-1 text-xs text-zinc-500">Tune how RoboBuddy feels on your device</div>
            <div className="mt-4 space-y-3">
              <ToggleRow
                label="Sound effects"
                desc="Enable subtle UI sounds for actions"
                value={soundFx}
                onChange={setSoundFx}
              />
              <ToggleRow
                label="Reduced motion (override)"
                desc="Reduce animations regardless of system setting"
                value={reducedMotionMode}
                onChange={setReducedMotionMode}
              />
              <ToggleRow
                label="High contrast"
                desc="Improve readability for low-vision environments"
                value={highContrast}
                onChange={setHighContrast}
              />
            </div>
          </Card>

          <Card variant="glass" className="p-4 sm:p-5">
            <div className="text-sm font-semibold text-zinc-700">Privacy & Devices</div>
            <div className="mt-1 text-xs text-zinc-500">Control data sharing and practice hardware behavior</div>
            <div className="mt-4 space-y-3">
              <ToggleRow
                label="Share analytics"
                desc="Allow anonymous performance analytics to improve recommendations"
                value={shareAnalytics}
                onChange={setShareAnalytics}
              />
              <ToggleRow
                label="Auto-start camera in Practice"
                desc="If enabled, Practice opens the camera immediately"
                value={cameraAutoStart}
                onChange={setCameraAutoStart}
              />
            </div>
          </Card>

          <Card variant="glass" className="p-4 sm:p-5" roboticBorder>
            <div className="text-sm font-semibold text-zinc-700">Danger Zone</div>
            <div className="mt-1 text-xs text-zinc-500">These actions are reversible only with support</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="robotic" size="md" onClick={() => {}}>
                Clear local data
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  clearAuth();
                  setProfileName("");
                  setEmail("");
                }}
                disabled={!auth}
              >
                Sign out
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Card variant="glass" className="p-4 sm:p-5">
            <div className="text-sm font-semibold text-zinc-700">Quick Status</div>
            <div className="mt-1 text-xs text-zinc-500">A snapshot of your current toggles</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Camera" value={summary.camera} />
              <Stat label="Analytics" value={summary.privacy} />
              <Stat label="Motion" value={reducedMotionMode ? "Reduced" : "System"} />
              <Stat label="Contrast" value={highContrast ? "High" : "Normal"} />
            </div>
          </Card>

          <Card variant="glass" className="p-4 sm:p-5">
            <div className="text-sm font-semibold text-zinc-700">Help</div>
            <div className="mt-3 text-sm text-zinc-600">
              If something feels off (camera permissions, audio, or animation glitches), revisit Preferences and refresh.
            </div>
            <div className="mt-4">
              <Button href="/practice" variant="primary" size="md">
                Run a quick practice check
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-zinc-200/80">
      <div className="text-xs font-semibold text-zinc-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl bg-zinc-50/80 px-3 py-2 text-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-300/80 focus:border-violet-300/60"
      />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-zinc-200/80">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-800">{label}</div>
        <div className="mt-1 text-xs text-zinc-500">{desc}</div>
      </div>
      <ToggleSwitch checked={value} onCheckedChange={onChange} label={label} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-zinc-200/80">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-800">{value}</div>
    </div>
  );
}
