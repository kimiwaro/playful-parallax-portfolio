import Head from "next/head";
import Hero from "../components/Hero";
import CharacterEditor from "../components/CharacterEditor";
import FooterCTA from "../components/FooterCTA";

export default function Home() {
  return (
    <>
      <Head>
        <title>Playful Parallax Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen overflow-x-hidden">
        <section
          className="relative h-[70vh] overflow-hidden"
          aria-label="Hero"
          data-section-title="Hero"
        >
          <Hero />
        </section>

        <section
          className="mx-auto max-w-5xl p-6 grid md:grid-cols-2 gap-6"
          aria-label="Main content"
          data-section-title="Main content"
        >
          <div
            className="rounded-xl p-6 bg-[var(--glass)] backdrop-blur-md border border-white/10"
            data-section-title="Character editor"
          >
            <h2 className="text-xl font-semibold">Character editor</h2>
            <p className="text-white/80">Compose a tiny SVG character with three controls.</p>
            <div className="mt-4">
              <CharacterEditor />
            </div>
          </div>

          <div
            className="rounded-xl p-6 bg-[var(--glass)] backdrop-blur-md border border-white/10"
            data-section-title="Share and CTA"
          >
            <h2 className="text-xl font-semibold">Share & CTA</h2>
            <p className="text-white/80">Sticky footer to share a QR link instantly.</p>
            <div className="mt-4 text-sm text-white/70">
              Tip: use the Share button in the footer to open a QR and copy the demo link to mobile.
            </div>
          </div>
        </section>

        <FooterCTA />
      </main>
    </>
  );
}
