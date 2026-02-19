import { SITE_NAME } from "@/constants/site";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground">
      &copy; {currentYear} {SITE_NAME}
    </footer>
  );
};

