import Link from "next/link";
import { Alert, Button, Card } from "@aether/ui";

const errorMessages: Record<string, string> = {
  OAuthSignin: "There was a problem starting the OAuth sign-in flow.",
  OAuthCallback: "OAuth callback failed. Please try again.",
  OAuthCreateAccount: "Unable to create your OAuth account.",
  EmailCreateAccount: "Unable to create account with that email.",
  Callback: "Authentication callback failed.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "You must sign in to access that page."
};

export default async function AuthErrorPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const code = params.error ?? "Callback";
  const message = errorMessages[code] ?? "An unknown authentication error occurred.";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-0">
      <Card className="w-full" padding="lg" shadow="lg" border>
        <Card.Header>
          <h1 className="text-2xl font-semibold text-text-primary">Authentication error</h1>
        </Card.Header>
        <Card.Body>
          <Alert variant="error" title={code} description={message} />
        </Card.Body>
        <Card.Footer className="justify-start">
          <Link href="/auth/signin">
            <Button>Back to sign in</Button>
          </Link>
        </Card.Footer>
      </Card>
    </main>
  );
}
