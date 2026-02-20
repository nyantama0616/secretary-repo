export const ROUTES = {
  login: '/login',
  dailyReports: '/daily-reports',
  dailyReportDetail: (id: string) => `/daily-reports/${id}`,
  dailyReportCreate: '/daily-reports/new',
  dailyReportEdit: (id: string) => `/daily-reports/${id}/edit`,
  tasks: '/tasks',
} as const;
