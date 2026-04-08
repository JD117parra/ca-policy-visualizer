import { z } from 'zod'

const conditionalAccessUsersSchema = z.object({
  includeUsers: z.array(z.string()).optional(),
  excludeUsers: z.array(z.string()).optional(),
  includeGroups: z.array(z.string()).optional(),
  excludeGroups: z.array(z.string()).optional(),
  includeRoles: z.array(z.string()).optional(),
  excludeRoles: z.array(z.string()).optional(),
})

const conditionalAccessApplicationsSchema = z.object({
  includeApplications: z.array(z.string()).optional(),
  excludeApplications: z.array(z.string()).optional(),
  includeUserActions: z.array(z.string()).optional(),
  includeAuthenticationContextClassReferences: z.array(z.string()).optional(),
})

const conditionalAccessPlatformsSchema = z.object({
  includePlatforms: z.array(z.string()).optional(),
  excludePlatforms: z.array(z.string()).optional(),
})

const conditionalAccessLocationsSchema = z.object({
  includeLocations: z.array(z.string()).optional(),
  excludeLocations: z.array(z.string()).optional(),
})

const conditionalAccessConditionsSchema = z.object({
  users: conditionalAccessUsersSchema.optional(),
  applications: conditionalAccessApplicationsSchema.optional(),
  platforms: conditionalAccessPlatformsSchema.optional(),
  locations: conditionalAccessLocationsSchema.optional(),
  clientAppTypes: z.array(z.string()).optional(),
  signInRiskLevels: z.array(z.string()).optional(),
  userRiskLevels: z.array(z.string()).optional(),
  deviceStates: z
    .object({
      includeStates: z.array(z.string()).optional(),
      excludeStates: z.array(z.string()).optional(),
    })
    .optional(),
})

const conditionalAccessGrantControlsSchema = z.object({
  operator: z.enum(['AND', 'OR']).optional(),
  builtInControls: z.array(z.string()).optional(),
  customAuthenticationFactors: z.array(z.string()).optional(),
  termsOfUse: z.array(z.string()).optional(),
})

const conditionalAccessSessionControlsSchema = z.object({
  applicationEnforcedRestrictions: z.object({ isEnabled: z.boolean() }).optional(),
  cloudAppSecurity: z
    .object({
      isEnabled: z.boolean(),
      cloudAppSecurityType: z.string().optional(),
    })
    .optional(),
  signInFrequency: z
    .object({
      isEnabled: z.boolean(),
      value: z.number().optional(),
      type: z.string().optional(),
    })
    .optional(),
  persistentBrowser: z
    .object({
      isEnabled: z.boolean(),
      mode: z.string().optional(),
    })
    .optional(),
})

export const conditionalAccessPolicySchema = z.object({
  id: z.string(),
  displayName: z.string().max(256),
  createdDateTime: z.string(),
  modifiedDateTime: z.string(),
  state: z.enum(['enabled', 'disabled', 'enabledForReportingButNotEnforced']),
  conditions: conditionalAccessConditionsSchema,
  grantControls: conditionalAccessGrantControlsSchema.nullable(),
  sessionControls: conditionalAccessSessionControlsSchema.nullable(),
})

export const policiesArraySchema = z.array(conditionalAccessPolicySchema)
