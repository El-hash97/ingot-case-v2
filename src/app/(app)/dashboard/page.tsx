import { getSession } from "@/lib/session";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  return <DashboardClient role={session?.role ?? "OPERATOR"} />;
}
