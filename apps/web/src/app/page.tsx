import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

const TopPage = () => {
  redirect(ROUTES.users);
};

export default TopPage;
