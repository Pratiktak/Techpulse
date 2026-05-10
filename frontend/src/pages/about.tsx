import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Feather, Shield, Sparkles, Leaf, MessageCircle } from "lucide-react";

export default function About() {
  return (
    <div className="bg-background">
      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pt-20 lg:pt-28 pb-16 lg:pb-20">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">— About TechPulse</p>
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight max-w-4xl">
          A quieter approach <br />to <span className="italic">technology.</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-8 max-w-xl leading-relaxed">
          TechPulse exists for people who care about the details. We curate a small,
          considered catalog — each product chosen for its build, its design, and the
          way it disappears into your life.
        </p>

        {/* triptych */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-14">
          {[
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
          ].map((src, i) => (
            <div key={i} className="aspect-[4/5] rounded-3xl overflow-hidden bg-muted border border-border/60">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 rounded-3xl border border-border/60 bg-card overflow-hidden divide-x divide-y md:divide-y-0 divide-border/60">
          {[
            { v: "120+", l: "Curated products" },
            { v: "40k", l: "Happy customers" },
            { v: "4.9", l: "Average rating" },
            { v: "32", l: "Brand partners" },
          ].map((s) => (
            <div key={s.l} className="p-8 lg:p-10">
              <p className="font-serif text-4xl lg:text-5xl font-light tracking-tight">{s.v}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-3">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PHILOSOPHY ──────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">— Philosophy</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight leading-[1.05]">
              Designed <br />for people <br /><span className="italic">who notice.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-6 text-base lg:text-lg text-muted-foreground leading-relaxed lg:pt-4">
            <p>
              We believe technology should recede — into your hand, your desk, your day.
              The best objects do their work without asking for attention. They earn it
              through restraint.
            </p>
            <p>
              Every product on TechPulse is selected through the same lens: thoughtful
              materials, honest engineering, and a long, useful life. Nothing is here
              by accident.
            </p>
          </div>
        </div>
      </section>

      {/* ─── A DIFFERENT KIND OF STORE — feature cards ──────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Why TechPulse</p>
        <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight mb-12">
          A different <span className="italic">kind of store.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-border/60 bg-card p-7 lg:p-8">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-6">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl font-medium tracking-tight mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TIMELINE ────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Our story</p>
        <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight mb-14">
          A quiet <span className="italic">beginning.</span>
        </h2>

        <ol className="relative border-l border-border/70 ml-2 space-y-12 max-w-3xl">
          {TIMELINE.map((t) => (
            <li key={t.year} className="pl-8">
              <span className="absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full bg-foreground" />
              <p className="font-serif text-3xl font-light tracking-tight">{t.year}</p>
              <p className="font-medium text-base mt-2">{t.title}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── FOUNDER NOTE ────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="aspect-[4/3] lg:aspect-auto rounded-3xl overflow-hidden bg-muted border border-border/60">
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1100&q=80"
              alt="Workspace"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-8 lg:p-12 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">— Founder note</p>
            <blockquote className="font-serif text-2xl lg:text-3xl font-light leading-snug tracking-tight">
              &ldquo;We started TechPulse because we were tired of buying things twice.&rdquo;
            </blockquote>
            <p className="text-base text-muted-foreground mt-6 leading-relaxed max-w-lg">
              The market is full of tech that&rsquo;s loud, disposable, and over-promised.
              We wanted a place where every product was quietly excellent — chosen by
              people, for people who plan to keep what they own. That&rsquo;s it.
              That&rsquo;s the whole brief.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                AS
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">Aarav Shah</p>
                <p className="text-xs text-muted-foreground mt-0.5">Founder &amp; CEO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BRAND PARTNERS ──────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-24 lg:pb-32">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Brand partners</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight max-w-xl">
              In good <span className="italic">company.</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-5 max-w-md leading-relaxed">
              We work with a small circle of independent brands and studios who share
              our standards — from boutique audio houses to industrial design ateliers.
            </p>
          </div>
          <Link href="/partner">
            <Button size="lg" className="rounded-full gap-2">
              Become a partner <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 rounded-3xl border border-border/60 bg-card overflow-hidden divide-x divide-y md:divide-y-0 divide-border/60">
          {["Aurora", "Nimbus", "Vector", "Lumen", "Halo", "Atlas"].map((b) => (
            <div key={b} className="px-6 py-10 flex items-center justify-center">
              <span className="font-serif text-2xl font-light tracking-tight">{b}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: Compass,
    title: "Curated, not catalogued",
    desc: "Every product is hand-picked. We say no far more often than yes.",
  },
  {
    icon: Feather,
    title: "Restraint as a feature",
    desc: "Minimal packaging, minimal noise. The product is the message.",
  },
  {
    icon: Shield,
    title: "Built to last",
    desc: "Two-year warranty on everything, and a real human to talk to.",
  },
  {
    icon: Leaf,
    title: "Quiet sustainability",
    desc: "Carbon-neutral shipping, recycled materials, repair over replace.",
  },
  {
    icon: MessageCircle,
    title: "Concierge support",
    desc: "Talk to a real person, seven days a week. No scripts.",
  },
  {
    icon: Sparkles,
    title: "Always premium",
    desc: "We don't compete on price. We compete on what's worth owning.",
  },
];

const TIMELINE = [
  {
    year: "2021",
    title: "An idea over coffee",
    body: "Three friends, frustrated by noisy tech retail, sketched a different kind of store on a napkin.",
  },
  {
    year: "2022",
    title: "First twelve products",
    body: "We launched with a tightly edited catalog and a single promise: only what we'd buy ourselves.",
  },
  {
    year: "2024",
    title: "Forty thousand customers",
    body: "Word travelled quietly. We grew without ads — through people who told other people.",
  },
  {
    year: "2026",
    title: "A platform for makers",
    body: "We opened TechPulse to a small group of independent brands who share our standards.",
  },
];
