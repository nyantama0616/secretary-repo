export const ROUTES = {
  users: '/users',
  userDetail: (id: string) => `/users/${id}`,
  userCreate: '/users/new',
  dailyReports: '/daily-reports',
} as const;
