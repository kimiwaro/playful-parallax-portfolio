import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Playful Parallax Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen">
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {/* Parallax layers will go here */}
          </div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Playful Parallax Portfolio
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-5xl p-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 bg-[var(--glass)] backdrop-blur-md border border-white/10">
            <h2 className="text-xl font-semibold">Character editor</h2>
            <p className="text-white/80">Compose a tiny SVG character with three controls.</p>
          </div>
          <div className="rounded-xl p-6 bg-[var(--glass)] backdrop-blur-md border border-white/10">
            <h2 className="text-xl font-semibold">Share & CTA</h2>
            <p className="text-white/80">Sticky footer to share a QR link instantly.</p>
          </div>
        </section>
      </main>
    </>
  );
}
