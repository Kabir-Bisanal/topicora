import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center">
      <Container className="max-w-2xl py-24 text-center">
        <p className="eyebrow">404 · Page not found</p>
        <h1 className="headline-lg mt-4">This trail ends here.</h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-lg leading-8">
          The page may have moved, or the address may be incomplete. The archive
          is a good place to continue exploring.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link className="button-primary" href="/">
            Go home
          </Link>
          <Link className="button-secondary" href="/articles">
            Browse articles
          </Link>
        </div>
      </Container>
    </main>
  );
}
