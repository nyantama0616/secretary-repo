export const ROUTES = {
  dailyReports: '/daily-reports',
  dailyReportDetail: (id: string) => `/daily-reports/${id}`,
  dailyReportCreate: '/daily-reports/new',
  dailyReportEdit: (id: string) => `/daily-reports/${id}/edit`,
} as const;
