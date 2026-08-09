import { getCurrentUser } from "@/lib/auth";
import { HeaderShell } from "@/components/site/HeaderShell";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <HeaderShell
      user={user ? { name: user.name, storeSlug: user.storeSlug } : null}
    />
  );
}
