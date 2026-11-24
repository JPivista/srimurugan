import { ChitSchemes } from "@/components/site/ChitSchemes";
import { services } from "@/lib/chits";

export default function HomePage() {
  return (
    <div className="min-h-full bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-gold/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon">
                Sree Murugan
              </span>
              <span className="block font-display text-lg leading-none">Financials</span>
            </span>
          </a>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <a href="#services" className="rounded-full px-3 py-2 hover:bg-gold/30">
              Services
            </a>
            <a href="#chits" className="rounded-full px-3 py-2 hover:bg-gold/30">
              Chits
            </a>
            <a href="#contact" className="rounded-full px-3 py-2 hover:bg-gold/30">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto w-full max-w-5xl px-4 pt-4">
          <img
            src="/banner.jpg"
            alt="Sree Murugan Financials, 6/X2/E, Karamadai Nayakkan Thottam, Selakkarichal - 641 658"
            className="w-full rounded-2xl border border-gold/60"
          />
          <div className="mt-6 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-maroon">
              Selakkarichal
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">
              Your financial partner
            </h1>
            <p className="mt-3 text-base leading-7 text-ink/75">
              Gold loan renewal, short-term finance, daily collection, credit card bill payment,
              and six chit schemes. Visit the office at Karamadai Nayakkan Thottam, or call the
              numbers below.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="#chits"
                className="rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-ink"
              >
                View chit schemes
              </a>
              <a
                href="tel:+919952217477"
                className="rounded-xl border border-maroon px-4 py-3 text-sm font-semibold text-maroon"
              >
                Call +91 99522 17477
              </a>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto w-full max-w-5xl px-4 py-12">
          <h2 className="font-display text-3xl">What we do</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="rounded-2xl border border-line bg-white p-4">
                <h3 className="font-display text-xl">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="chits" className="bg-maroon py-12 text-white">
          <div className="mx-auto w-full max-w-5xl px-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Six chit schemes
            </p>
            <h2 className="mt-2 font-display text-3xl text-white">Clear payment schedules</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Each scheme has a fixed chit value, a fixed number of members, and the same monthly
              installment. The prize changes by the month in which the member takes the chit.
            </p>
            <div className="mt-6 text-ink">
              <ChitSchemes />
            </div>
            <p className="mt-4 text-xs text-white/60">Terms and conditions apply.</p>
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-5xl px-4 py-12">
          <h2 className="font-display text-3xl">Visit or call</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-maroon">
                Office
              </h3>
              <p className="mt-2 text-base leading-7">
                6/X2/E, Karamadai Nayakkan Thottam,
                <br />
                Selakkarichal - 641 658
              </p>
              <a
                href="https://maps.google.com/?q=6/X2/E,+Karamadai+Nayakkan+Thottam,+Selakkarichal+641658"
                className="mt-3 inline-block text-sm font-semibold text-maroon"
              >
                Open in maps
              </a>
            </article>
            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-maroon">
                Phone
              </h3>
              <p className="mt-2 text-base font-medium">
                Call:{" "}
                <a href="tel:+919952217477">+91 99522 17477</a>
                {" / "}
                <a href="tel:+919750074777">+91 97500 74777</a>
              </p>
              <p className="mt-2 text-base font-medium">
                <a href="https://wa.me/919003253515">WhatsApp: +91 90032 53515</a>
              </p>
              <p className="mt-4 text-sm">
                <span className="font-bold">GST</span> 33E0EPS7619M1ZB
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-6 text-center text-xs text-ink/55">
        <p>Sree Murugan Financials · Selakkarichal · Terms and conditions apply</p>
        <p className="mt-2">
          <a href="/app/login" className="font-semibold text-maroon">
            Staff sign in
          </a>
        </p>
        <p className="mt-2">
          Developed by{" "}
          <a
            href="http://www.youngzen.in/"
            className="font-semibold text-navy"
            target="_blank"
            rel="noreferrer"
          >
            YoungZen Technologies
          </a>
        </p>
      </footer>
    </div>
  );
}
