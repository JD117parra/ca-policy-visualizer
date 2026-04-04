import { useMsal } from '@azure/msal-react'

const LOGIN_REQUEST = {
  scopes: ['openid', 'profile'],
}

export default function LoginPage() {
  const { instance } = useMsal()

  const handleLogin = () => {
    instance.loginPopup(LOGIN_REQUEST).catch(console.error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
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
