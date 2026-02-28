import { AppShell } from "@aether/ui";
import { createAIClient } from "@aether/ai";
import { trackEvent } from "@aether/analytics";
import { connectDB } from "@aether/db";

const appName = "Market Analyzer";

export default async function HomePage() {
  await connectDB();

  const aiClient = createAIClient();
  const summary = await aiClient.summarize(`Welcome context for ${appName}`);

  trackEvent({
    name: "page_view",
    source: "market-analyzer",
    payload: { route: "/", appName }
  });

  return (
    <AppShell title={appName} subtitle="Production-ready foundation for go-to-market teams.">
      <p className="text-sm text-slate-300">{summary}</p>
    </AppShell>
  );
}
