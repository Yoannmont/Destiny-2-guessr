export interface Membership {
  LastSeenDisplayName: string;
  LastSeenDisplayNameType: number;
  iconPath: string;
  crossSaveOverride: number;
  applicableMembershipTypes: number[];
  isPublic: boolean;
  membershipType: number;
  membershipId: string;
  displayName: string;
  bungieGlobalDisplayName: string;
  bungieGlobalDisplayNameCode: number;
}

export interface ShortMembership {
  membershipType: number;
  membershipId: string;
  displayName: string;
  lastAuthDate: number;
}
