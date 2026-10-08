import { AuthScreen } from "@/components/auth/auth-screen";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ confirmed?: string }> }) {
  const { confirmed } = await searchParams;
  return <AuthScreen mode="login" confirmed={confirmed === "1"} />;
}
