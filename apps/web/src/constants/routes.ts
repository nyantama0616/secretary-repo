export const ROUTES = {
  users: '/users',
  userDetail: (id: string) => `/users/${id}`,
  userCreate: '/users/new',
  dailyReports: '/daily-reports',
  dailyReportDetail: (id: string) => `/daily-reports/${id}`,
  dailyReportCreate: '/daily-reports/new',
  dailyReportEdit: (id: string) => `/daily-reports/${id}/edit`,
} as const;
