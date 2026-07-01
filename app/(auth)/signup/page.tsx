import { AuthScreen } from "@/components/auth/auth-screen";
import type { Plan } from "@/lib/stripe/plans";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const planId = (["solo", "pro", "isletme"].includes(plan ?? "") ? plan : "solo") as Plan["id"];
  return <AuthScreen mode="signup" planId={planId} />;
}
