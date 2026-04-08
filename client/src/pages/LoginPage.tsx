import { useMsal } from '@azure/msal-react'
import { useTheme } from '@/hooks/useTheme'

const LOGIN_REQUEST = {
  scopes: ['openid', 'profile'],
}

export default function LoginPage() {
  const { instance } = useMsal()
  const { theme, toggleTheme } = useTheme()

  const handleLogin = () => {
    instance.loginPopup(LOGIN_REQUEST).catch(console.error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
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
      <h1 className="text-4xl font-bold tracking-tight">CA Policy Visualizer</h1>
      <p className="text-muted-foreground text-center max-w-sm">
        Sign in with your Microsoft Entra ID account to visualize your
        organization&apos;s Conditional Access policies as interactive flow diagrams.
      </p>
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
      >
        Sign in with Microsoft
      </button>
    </div>
  )
}
