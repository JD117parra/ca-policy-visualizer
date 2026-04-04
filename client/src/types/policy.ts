// Mirrors the Microsoft Graph ConditionalAccessPolicy resource
// https://learn.microsoft.com/graph/api/resources/conditionalaccesspolicy

export type ConditionalAccessPolicyState =
  | 'enabled'
  | 'disabled'
  | 'enabledForReportingButNotEnforced'

export interface ConditionalAccessUsers {
  includeUsers?: string[]
  excludeUsers?: string[]
  includeGroups?: string[]
  excludeGroups?: string[]
  includeRoles?: string[]
  excludeRoles?: string[]
}

export interface ConditionalAccessApplications {
  includeApplications?: string[]
  excludeApplications?: string[]
  includeUserActions?: string[]
  includeAuthenticationContextClassReferences?: string[]
}

export interface ConditionalAccessPlatforms {
  includePlatforms?: string[]
  excludePlatforms?: string[]
}

export interface ConditionalAccessLocations {
  includeLocations?: string[]
  excludeLocations?: string[]
}

export interface ConditionalAccessConditions {
  users?: ConditionalAccessUsers
  applications?: ConditionalAccessApplications
  platforms?: ConditionalAccessPlatforms
  locations?: ConditionalAccessLocations
  clientAppTypes?: string[]
  signInRiskLevels?: string[]
  userRiskLevels?: string[]
  deviceStates?: {
    includeStates?: string[]
    excludeStates?: string[]
  }
}

export interface ConditionalAccessGrantControls {
  operator?: 'AND' | 'OR'
  builtInControls?: string[]
  customAuthenticationFactors?: string[]
  termsOfUse?: string[]
}

export interface ConditionalAccessSessionControls {
  applicationEnforcedRestrictions?: { isEnabled: boolean }
  cloudAppSecurity?: { isEnabled: boolean; cloudAppSecurityType?: string }
  signInFrequency?: { value?: number; type?: string; isEnabled: boolean }
  persistentBrowser?: { mode?: string; isEnabled: boolean }
}

export interface ConditionalAccessPolicy {
  id: string
  displayName: string
  createdDateTime: string
  modifiedDateTime: string
  state: ConditionalAccessPolicyState
  conditions: ConditionalAccessConditions
  grantControls: ConditionalAccessGrantControls | null
  sessionControls: ConditionalAccessSessionControls | null
}

export interface ConditionalAccessPoliciesResponse {
  value: ConditionalAccessPolicy[]
  '@odata.context'?: string
  '@odata.nextLink'?: string
}
