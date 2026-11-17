import { UnauthorizedView } from "@/components/error/unauthorized-view";

export const metadata = {
  title: "Authentication Required",
  description: "Clinical authentication required to access this workspace.",
};

export default function Page() {
  return <UnauthorizedView />;
}
