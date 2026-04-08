import { useMsal } from '@azure/msal-react'
import { useTheme } from '@/hooks/useTheme'

const LOGIN_REQUEST = {
  scopes: ['openid', 'profile'],
}

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      </svg>
    ),
    title: 'Interactive Flow Diagrams',
    description: 'Visualize policies as connected nodes showing conditions, grant controls, and session controls.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: 'Search & Filter',
    description: 'Quickly find policies by name and filter by state — enabled, disabled, or report-only.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
    ),
    title: 'Export as PNG',
    description: 'Download your policy diagrams as high-resolution images for reports and documentation.',
  },
]

export default function LoginPage() {
  const { instance } = useMsal()
  const { theme, toggleTheme } = useTheme()

  const handleLogin = () => {
    instance.loginPopup(LOGIN_REQUEST).catch(console.error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex relative">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground z-10"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </button>

      {/* Left panel — branding & login */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo / brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">CA Policy Visualizer</h1>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Transform your Microsoft Entra ID Conditional Access policies into
              interactive visual diagrams. Understand your security posture at a glance.
            </p>
          </div>

          {/* Sign in */}
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 23 23" fill="none">
                <path fill="currentColor" d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" opacity=".8" />
              </svg>
              Sign in with Microsoft
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Requires an account with Policy.Read.All permissions in your tenant.
            </p>
          </div>

          {/* Features */}
          <div className="pt-4 border-t border-border space-y-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <div className="shrink-0 w-9 h-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — diagram preview illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/50 border-l border-border p-12">
        <div className="w-full max-w-lg">
          {/* Simplified diagram illustration */}
          <svg viewBox="0 0 400 300" fill="none" className="w-full text-foreground">
            {/* Policy node */}
            <rect x="140" y="20" width="120" height="44" rx="8" className="fill-card stroke-emerald-500" strokeWidth="2" />
            <text x="200" y="38" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">MFA Policy</text>
            <rect x="232" y="42" width="20" height="12" rx="6" className="fill-emerald-100 dark:fill-emerald-900" />
            <text x="242" y="51" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px]">On</text>

            {/* Edges from policy to conditions */}
            <path d="M170 64 V90 L120 90 V110" className="stroke-border" strokeWidth="1.5" />
            <path d="M200 64 V110" className="stroke-border" strokeWidth="1.5" />
            <path d="M230 64 V90 L280 90 V110" className="stroke-border" strokeWidth="1.5" />

            {/* Condition nodes */}
            <rect x="60" y="110" width="120" height="40" rx="6" className="fill-blue-50 dark:fill-blue-950 stroke-blue-400" strokeWidth="1" />
            <text x="120" y="126" textAnchor="middle" className="fill-muted-foreground text-[7px] font-semibold uppercase">Users</text>
            <text x="120" y="140" textAnchor="middle" className="fill-foreground text-[8px]">All users</text>

            <rect x="140" y="110" width="120" height="40" rx="6" className="fill-violet-50 dark:fill-violet-950 stroke-violet-400" strokeWidth="1" />
            <text x="200" y="126" textAnchor="middle" className="fill-muted-foreground text-[7px] font-semibold uppercase">Applications</text>
            <text x="200" y="140" textAnchor="middle" className="fill-foreground text-[8px]">Office 365</text>

            <rect x="220" y="110" width="120" height="40" rx="6" className="fill-cyan-50 dark:fill-cyan-950 stroke-cyan-400" strokeWidth="1" />
            <text x="280" y="126" textAnchor="middle" className="fill-muted-foreground text-[7px] font-semibold uppercase">Platforms</text>
            <text x="280" y="140" textAnchor="middle" className="fill-foreground text-[8px]">iOS, Android</text>

            {/* Edges from conditions to controls */}
            <path d="M120 150 V170 L200 170 V190" className="stroke-border" strokeWidth="1.5" />
            <path d="M200 150 V190" className="stroke-border" strokeWidth="1.5" />
            <path d="M280 150 V170 L200 170 V190" className="stroke-border" strokeWidth="1.5" />

            {/* Grant control node */}
            <rect x="130" y="190" width="140" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-400" strokeWidth="1" />
            <text x="200" y="207" textAnchor="middle" className="fill-muted-foreground text-[7px] font-semibold uppercase">Grant Controls</text>
            <rect x="157" y="212" width="18" height="12" rx="3" className="fill-background stroke-border" strokeWidth="0.5" />
            <text x="166" y="221" textAnchor="middle" className="fill-foreground text-[6px] font-mono">OR</text>
            <text x="200" y="228" textAnchor="middle" className="fill-foreground text-[8px]">Require MFA</text>

            {/* Decorative dots */}
            <circle cx="40" cy="50" r="3" className="fill-muted-foreground/20" />
            <circle cx="360" cy="250" r="3" className="fill-muted-foreground/20" />
            <circle cx="370" cy="60" r="4" className="fill-muted-foreground/10" />
            <circle cx="30" cy="240" r="4" className="fill-muted-foreground/10" />
          </svg>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Policies rendered as interactive flow diagrams
          </p>
        </div>
      </div>
    </div>
  )
}
