export const getUser = async () => ({ id: 1, email: 'test@example.com', tenantId: 1 });
export const getTeamForUser = async () => ({ id: 1, name: 'Test Team' });
export const getCounterparties = async () => ({ data: [], count: 0 });
export const SYSTEM_TENANT_ID = 1;
export const withActiveTenant = (query: any) => query;

export const getTeamByStripeCustomerId = async (stripeCustomerId: string) => {
  return { id: 'team_1', name: 'Mock Team' };
};

export const updateTeamSubscription = async (teamId: string, subscriptionData: any) => {
  return;
};

export const getUserWithTeam = async (userId: number) => {
  return {
    id: userId,
    name: 'Mock User',
    email: 'mock@example.com',
    teamMembers: [
      {
        team: {
          id: 1,
          name: 'Mock Team',
        }
      }
    ]
  };
};

export const getActivityLogs = async (userId?: number) => {
  return [];
};

export const resolveTeamForUser = async (user: any, tenantIdOverride?: number | null) => {
  return { id: 1, name: 'Mock Team' };
};

export const getWorks = async (limit?: number, lastSortOrder?: number) => {
  return [];
};

export const getWorksCount = async () => {
  return 0;
};

export const getWorksCached = async () => {
  return [];
};

export const getMaterials = async (limit?: number, search?: string, lastCode?: string) => {
  return [];
};

export const getMaterialsCount = async (search?: string) => {
  return 0;
};

export const getCounterpartiesCount = async (teamId: number, search?: string) => {
  return 0;
};
