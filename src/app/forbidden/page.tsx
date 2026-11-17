


import { ForbiddenView } from "@/components/error/forbidden-view";

export const metadata = {
  title: "Access Restricted",
  description: "Role policy restricted access.",
};

export default function Page() {
  return <ForbiddenView />;
}
