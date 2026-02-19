import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

const TopPage = () => {
  redirect(ROUTES.dailyReports);
};

export default TopPage;
