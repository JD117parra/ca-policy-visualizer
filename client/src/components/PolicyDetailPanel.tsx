import type { ConditionalAccessPolicy } from '@/types/policy'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PolicyDetailPanelProps {
  policy: ConditionalAccessPolicy
  onClose: () => void
}

const stateConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  enabled: { label: 'Enabled', variant: 'success' },
  disabled: { label: 'Disabled', variant: 'destructive' },
  enabledForReportingButNotEnforced: { label: 'Report-only', variant: 'warning' },
}

const CONTROL_LABELS: Record<string, string> = {
  mfa: 'Require MFA',
  compliantDevice: 'Compliant device',
  domainJoinedDevice: 'Domain-joined device',
  approvedApplication: 'Approved app',
  compliantApplication: 'Compliant app',
  passwordChange: 'Password change',
  block: 'Block access',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function TagList({ items, empty = 'None' }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <p className="text-muted-foreground text-sm">{empty}</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="text-xs font-normal">
          {item === 'All' ? 'All' : item}
        </Badge>
      ))}
    </div>
  )
}

export function PolicyDetailPanel({ policy, onClose }: PolicyDetailPanelProps) {
  const config = stateConfig[policy.state] ?? { label: policy.state, variant: 'warning' as const }
  const cond = policy.conditions
  const grant = policy.grantControls
  const session = policy.sessionControls

  return (
    <div className="w-[380px] border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 border-b border-border">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-tight break-words">
            {policy.displayName}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Close panel"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Metadata */}
          <Section title="Details">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{policy.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(policy.createdDateTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modified</span>
                <span>{new Date(policy.modifiedDateTime).toLocaleDateString()}</span>
              </div>
            </div>
          </Section>

          {/* Users & Roles */}
          <Section title="Users & Roles">
            <div className="space-y-2">
              {(cond.users?.includeUsers?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Include users</p>
                  <TagList items={cond.users?.includeUsers ?? []} />
                </div>
              )}
              {(cond.users?.excludeUsers?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Exclude users</p>
                  <TagList items={cond.users?.excludeUsers ?? []} />
                </div>
              )}
              {(cond.users?.includeGroups?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Include groups</p>
                  <TagList items={cond.users?.includeGroups ?? []} />
                </div>
              )}
              {(cond.users?.excludeGroups?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Exclude groups</p>
                  <TagList items={cond.users?.excludeGroups ?? []} />
                </div>
              )}
              {(cond.users?.includeRoles?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Include roles</p>
                  <TagList items={cond.users?.includeRoles ?? []} />
                </div>
              )}
              {(cond.users?.excludeRoles?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Exclude roles</p>
                  <TagList items={cond.users?.excludeRoles ?? []} />
                </div>
              )}
              {!cond.users && <p className="text-muted-foreground text-sm">Not configured</p>}
            </div>
          </Section>

          {/* Applications */}
          <Section title="Applications">
            <div className="space-y-2">
              {(cond.applications?.includeApplications?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Include</p>
                  <TagList items={cond.applications?.includeApplications ?? []} />
                </div>
              )}
              {(cond.applications?.excludeApplications?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Exclude</p>
                  <TagList items={cond.applications?.excludeApplications ?? []} />
                </div>
              )}
              {!cond.applications && <p className="text-muted-foreground text-sm">Not configured</p>}
            </div>
          </Section>

          {/* Platforms */}
          {cond.platforms && (
            <Section title="Platforms">
              <div className="space-y-2">
                {(cond.platforms.includePlatforms?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Include</p>
                    <TagList items={cond.platforms.includePlatforms ?? []} />
                  </div>
                )}
                {(cond.platforms.excludePlatforms?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Exclude</p>
                    <TagList items={cond.platforms.excludePlatforms ?? []} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Locations */}
          {cond.locations && (
            <Section title="Locations">
              <div className="space-y-2">
                {(cond.locations.includeLocations?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Include</p>
                    <TagList items={cond.locations.includeLocations ?? []} />
                  </div>
                )}
                {(cond.locations.excludeLocations?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Exclude</p>
                    <TagList items={cond.locations.excludeLocations ?? []} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Risk Levels */}
          {((cond.signInRiskLevels?.length ?? 0) > 0 || (cond.userRiskLevels?.length ?? 0) > 0) && (
            <Section title="Risk Levels">
              <div className="space-y-2">
                {(cond.signInRiskLevels?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sign-in risk</p>
                    <TagList items={cond.signInRiskLevels ?? []} />
                  </div>
                )}
                {(cond.userRiskLevels?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">User risk</p>
                    <TagList items={cond.userRiskLevels ?? []} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Client App Types */}
          {(cond.clientAppTypes?.length ?? 0) > 0 && (
            <Section title="Client App Types">
              <TagList items={cond.clientAppTypes ?? []} />
            </Section>
          )}

          {/* Grant Controls */}
          <Section title="Grant Controls">
            {grant ? (
              <div className="space-y-2">
                {grant.operator && (
                  <p className="text-xs">
                    Operator: <span className="font-mono font-semibold">{grant.operator}</span>
                  </p>
                )}
                {(grant.builtInControls?.length ?? 0) > 0 && (
                  <TagList
                    items={(grant.builtInControls ?? []).map((c) => CONTROL_LABELS[c] ?? c)}
                  />
                )}
                {(grant.termsOfUse?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Terms of use</p>
                    <TagList items={grant.termsOfUse ?? []} />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Not configured</p>
            )}
          </Section>

          {/* Session Controls */}
          <Section title="Session Controls">
            {session ? (
              <div className="space-y-1.5 text-sm">
                {session.applicationEnforcedRestrictions?.isEnabled && (
                  <p>App-enforced restrictions</p>
                )}
                {session.cloudAppSecurity?.isEnabled && (
                  <p>Cloud App Security{session.cloudAppSecurity.cloudAppSecurityType ? `: ${session.cloudAppSecurity.cloudAppSecurityType}` : ''}</p>
                )}
                {session.signInFrequency?.isEnabled && (
                  <p>Sign-in frequency: {session.signInFrequency.value ?? '?'} {session.signInFrequency.type ?? ''}</p>
                )}
                {session.persistentBrowser?.isEnabled && (
                  <p>Persistent browser: {session.persistentBrowser.mode ?? 'default'}</p>
                )}
                {!session.applicationEnforcedRestrictions?.isEnabled &&
                  !session.cloudAppSecurity?.isEnabled &&
                  !session.signInFrequency?.isEnabled &&
                  !session.persistentBrowser?.isEnabled && (
                    <p className="text-muted-foreground">No active session controls</p>
                  )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Not configured</p>
            )}
          </Section>
        </div>
      </ScrollArea>
    </div>
  )
}
