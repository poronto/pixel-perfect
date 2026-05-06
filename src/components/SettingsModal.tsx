import { useEffect, useState } from 'react';
import {
  X,
  Settings,
  Palette,
  Sparkles,
  FileText,
  Bell,
  Keyboard,
  HelpCircle,
  Crown,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Trash2,
  Check,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export type SettingsTab =
  | 'general'
  | 'appearance'
  | 'customize'
  | 'instructions'
  | 'notifications'
  | 'shortcuts'
  | 'plan'
  | 'help';

interface SettingsModalProps {
  initialTab: SettingsTab;
  onClose: () => void;
  userName: string;
  userEmail?: string;
  onSignOut?: () => void;
}

const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'customize', label: 'Customize', icon: Sparkles },
  { id: 'instructions', label: 'Custom instructions', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'plan', label: 'Plan & billing', icon: Crown },
  { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
];

const SETTINGS_KEY = 'versace22_settings';
const INSTRUCTIONS_KEY = 'versace22_custom_instructions';

interface AppSettings {
  language: string;
  enterToSend: boolean;
  showTimestamps: boolean;
  soundOn: boolean;
  desktopNotifications: boolean;
  nickname: string;
  traits: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'auto',
  enterToSend: true,
  showTimestamps: false,
  soundOn: false,
  desktopNotifications: false,
  nickname: '',
  traits: '',
};

interface CustomInstructions {
  about: string;
  howToRespond: string;
}

export function SettingsModal({
  initialTab,
  onClose,
  userName,
  userEmail,
  onSignOut,
}: SettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [instructions, setInstructions] = useState<CustomInstructions>(() => {
    try {
      const raw = localStorage.getItem(INSTRUCTIONS_KEY);
      return raw ? JSON.parse(raw) : { about: '', howToRespond: '' };
    } catch {
      return { about: '', howToRespond: '' };
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const saveInstructions = () => {
    localStorage.setItem(INSTRUCTIONS_KEY, JSON.stringify(instructions));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const clearAllChats = () => {
    if (confirm('Delete all locally saved star/archive flags? Your conversations themselves will not be deleted.')) {
      localStorage.removeItem('versace22_starred_conversations');
      localStorage.removeItem('versace22_archived_conversations');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-3xl h-[600px] max-h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-border bg-muted/30 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-semibold text-popover-foreground">Settings</h2>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  tab === t.id
                    ? 'bg-popover text-popover-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-popover-foreground'
                }`}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-popover-foreground">
              {TABS.find((t) => t.id === tab)?.label}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {tab === 'general' && (
              <>
                <Row label="Account">
                  <div className="text-sm text-popover-foreground">{userName}</div>
                  {userEmail && <div className="text-xs text-muted-foreground">{userEmail}</div>}
                </Row>
                <Row label="Language">
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-popover-foreground"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </Row>
                <Toggle
                  label="Press Enter to send"
                  checked={settings.enterToSend}
                  onChange={(v) => updateSetting('enterToSend', v)}
                />
                <Toggle
                  label="Show message timestamps"
                  checked={settings.showTimestamps}
                  onChange={(v) => updateSetting('showTimestamps', v)}
                />
                <div className="pt-4 border-t border-border space-y-3">
                  <button
                    onClick={clearAllChats}
                    className="flex items-center gap-2 text-sm text-destructive hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear starred & archived flags
                  </button>
                  {onSignOut && (
                    <button
                      onClick={() => {
                        onSignOut();
                        onClose();
                      }}
                      className="flex items-center gap-2 text-sm text-destructive hover:underline"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out of this device
                    </button>
                  )}
                </div>
              </>
            )}

            {tab === 'appearance' && (
              <>
                <Row label="Theme">
                  <div className="flex gap-2">
                    <ThemeBtn
                      active={theme === 'light'}
                      onClick={() => theme !== 'light' && toggleTheme()}
                      icon={Sun}
                      label="Light"
                    />
                    <ThemeBtn
                      active={theme === 'dark'}
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      icon={Moon}
                      label="Dark"
                    />
                    <ThemeBtn active={false} onClick={() => {}} icon={Monitor} label="System" />
                  </div>
                </Row>
                <p className="text-xs text-muted-foreground">
                  Choose how Versace22 looks. The theme syncs across this device.
                </p>
              </>
            )}

            {tab === 'customize' && (
              <>
                <p className="text-sm text-muted-foreground">
                  Help Versace22 know you better for more personalized responses.
                </p>
                <Field
                  label="What should Versace22 call you?"
                  value={settings.nickname}
                  onChange={(v) => updateSetting('nickname', v)}
                  placeholder="Nickname"
                />
                <Field
                  label="What traits should Versace22 have?"
                  value={settings.traits}
                  onChange={(v) => updateSetting('traits', v)}
                  placeholder="e.g. Witty, encouraging, direct"
                  textarea
                />
              </>
            )}

            {tab === 'instructions' && (
              <>
                <p className="text-sm text-muted-foreground">
                  Custom instructions are sent at the start of every new conversation.
                </p>
                <Field
                  label="What would you like Versace22 to know about you?"
                  value={instructions.about}
                  onChange={(v) => setInstructions({ ...instructions, about: v })}
                  placeholder="Your role, location, interests, goals..."
                  textarea
                />
                <Field
                  label="How would you like Versace22 to respond?"
                  value={instructions.howToRespond}
                  onChange={(v) => setInstructions({ ...instructions, howToRespond: v })}
                  placeholder="Tone, format, length, language..."
                  textarea
                />
                <button
                  onClick={saveInstructions}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    'Save instructions'
                  )}
                </button>
              </>
            )}

            {tab === 'notifications' && (
              <>
                <Toggle
                  label="Sound on response"
                  checked={settings.soundOn}
                  onChange={(v) => updateSetting('soundOn', v)}
                />
                <Toggle
                  label="Desktop notifications"
                  checked={settings.desktopNotifications}
                  onChange={(v) => {
                    updateSetting('desktopNotifications', v);
                    if (v && 'Notification' in window) Notification.requestPermission();
                  }}
                />
              </>
            )}

            {tab === 'shortcuts' && (
              <div className="space-y-2">
                {[
                  ['New conversation', 'Ctrl/⌘ + Shift + O'],
                  ['Focus chat input', 'Ctrl/⌘ + /'],
                  ['Toggle sidebar', 'Ctrl/⌘ + B'],
                  ['Send message', 'Enter'],
                  ['New line', 'Shift + Enter'],
                  ['Search conversations', 'Ctrl/⌘ + K'],
                  ['Open settings', 'Ctrl/⌘ + ,'],
                ].map(([action, key]) => (
                  <div key={action} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-popover-foreground">{action}</span>
                    <kbd className="text-xs px-2 py-1 bg-muted rounded border border-border text-muted-foreground font-mono">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}

            {tab === 'plan' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-popover-foreground">Free plan</div>
                      <div className="text-xs text-muted-foreground">Current plan</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="rounded-xl border-2 border-primary p-4 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-primary" />
                    <div className="text-sm font-semibold text-popover-foreground">Versace22 Plus</div>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                    <li>• Priority access to top AI models</li>
                    <li>• Unlimited conversations</li>
                    <li>• Faster response speeds</li>
                    <li>• Early access to new features</li>
                  </ul>
                  <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    Upgrade — $20/month
                  </button>
                </div>
              </div>
            )}

            {tab === 'help' && (
              <div className="space-y-3">
                <a
                  href="https://wa.me/12262272288"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="text-sm font-medium text-popover-foreground">💬 Contact us on WhatsApp</div>
                  <div className="text-xs text-muted-foreground">Get help from our team</div>
                </a>
                <div className="p-3 rounded-lg border border-border">
                  <div className="text-sm font-medium text-popover-foreground mb-1">Versace22 ai</div>
                  <div className="text-xs text-muted-foreground">Version 1.0.0</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-popover-foreground">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-popover-foreground">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}

function ThemeBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Sun;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:bg-muted'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-popover-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-popover-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-popover-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      )}
    </div>
  );
}
