import { api, HydrateClient } from "@/trpc/server";
import { AuthGate } from "./_components/auth-gate";

export default async function Home() {

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <AuthGate/>
    </HydrateClient>
  );
}
