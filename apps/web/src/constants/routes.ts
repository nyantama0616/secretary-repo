export const ROUTES = {
  login: '/login',
  dailyReports: '/daily-reports',
  dailyReportDetail: (id: string) => `/daily-reports/${id}`,
  dailyReportCreate: '/daily-reports/new',
  dailyReportEdit: (id: string) => `/daily-reports/${id}/edit`,
  monthlyReports: '/monthly-reports',
  monthlyReportDetail: (id: string) => `/monthly-reports/${id}`,
  monthlyReportCreate: '/monthly-reports/new',
  tasks: '/tasks',
  taskDetail: (id: string) => `/tasks/${id}`,
  taskEdit: (id: string) => `/tasks/${id}/edit`,
} as const;
