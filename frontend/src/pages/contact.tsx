import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  ArrowRight, ArrowUpRight, Mail, Phone, MapPin, MessageCircle,
  Briefcase, Handshake, Newspaper, Loader2, Check,
  Twitter, Instagram, Linkedin,
} from "lucide-react";

const SUPPORT_CARDS = [
  {
    icon: MessageCircle,
    eyebrow: "Customers",
    title: "Customer support",
    desc: "Order help, returns, exchanges, and product questions answered within four working hours.",
    contact: "support@techpulse.com",
    href: "mailto:support@techpulse.com",
    accent: false,
  },
  {
    icon: Briefcase,
    eyebrow: "Enterprise",
    title: "Business inquiries",
    desc: "Bulk pricing, GST invoicing, and procurement for teams of every size.",
    contact: "business@techpulse.com",
    href: "mailto:business@techpulse.com",
    accent: true,
  },
  {
    icon: Handshake,
    eyebrow: "Partners",
    title: "Partnerships",
    desc: "Sell with TechPulse, brand collaborations, and reseller programs.",
    contact: "partners@techpulse.com",
    href: "mailto:partners@techpulse.com",
    accent: false,
  },
  {
    icon: Newspaper,
    eyebrow: "Media",
    title: "Press & media",
    desc: "Story pitches, interview requests, and brand assets for journalists.",
    contact: "press@techpulse.com",
    href: "mailto:press@techpulse.com",
    accent: false,
  },
];

const FAQ_ITEMS = [
  { q: "How quickly will I hear back?", a: "Customer support replies within four working hours, weekdays. Business and partnership inquiries are answered within one to two business days." },
  { q: "Do you offer phone support?", a: "Yes — call +91 80 4567 8900 between 10:00 and 19:00 IST, Monday through Saturday. For urgent order issues, email is usually faster." },
  { q: "Can I visit your showroom?", a: "Our experience studio in Bengaluru is open by appointment. Drop us a note and we'll set aside time for a guided walkthrough of the collection." },
  { q: "Where do you ship from?", a: "All orders ship from our fulfilment centres in Bengaluru and Mumbai with same-day dispatch on orders placed before 4pm IST." },
  { q: "Do you handle international orders?", a: "Right now we ship within India. International orders are coming soon — drop your email below to be notified at launch." },
];

const TOPICS = ["General question", "Order help", "Business inquiry", "Partnership", "Press / media"];

export default function Contact() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
    toast({ title: "Message received", description: "We'll get back to you within four working hours." });
    setForm({ name: "", email: "", company: "", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="bg-background overflow-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="container mx-auto px-4 lg:px-8 pt-16 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-5">— Say hello</p>
              <h1 className="font-serif font-light leading-[0.95] tracking-tight text-foreground text-[clamp(3rem,8vw,7rem)]">
                Let's <span className="italic font-normal text-primary">talk.</span>
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl mt-8">
                Questions, partnerships, or a story to share — we read every message and reply within hours, not days.
              </p>
            </div>
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {[
                { icon: Mail, label: "Email", value: "hello@techpulse.com", href: "mailto:hello@techpulse.com" },
                { icon: Phone, label: "Phone", value: "+91 80 4567 8900", href: "tel:+918045678900" },
                { icon: MapPin, label: "Studio", value: "Indiranagar, Bengaluru", href: "#" },
              ].map((c) => (
                <a key={c.label} href={c.href}
                  className="group flex items-center gap-4 px-5 py-4 rounded-2xl border border-border/60 bg-card hover:border-foreground transition-colors">
                  <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                    <c.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</p>
                    <p className="text-sm font-medium truncate">{c.value}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:rotate-12 transition-all shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FORM + DETAILS ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: editorial copy */}
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— The form</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
              Send us a<br />
              <span className="italic">message.</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-5 max-w-md leading-relaxed">
              Fill out the short form on the right and the relevant team will reach out shortly. For order-specific questions, please include your order number for faster help.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Replies within 4 working hours</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Monday — Saturday, 10:00 to 19:00 IST.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Real humans, not bots</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Every message is read and answered by our team.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Private & secure</p>
                  <p className="text-xs text-muted-foreground mt-0.5">We never share your details with third parties.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-10 pt-8 border-t border-border/60">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link"
                  className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit}
              className="rounded-3xl border border-border/60 bg-card p-6 lg:p-10 space-y-6">

              {/* Topic chips */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">What's this about?</Label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button key={t} type="button" onClick={() => setTopic(t)}
                      className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                        topic === t
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FloatingInput id="name" label="Full name" value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })} required />
                <FloatingInput id="email" type="email" label="Email" value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })} required />
              </div>
              <FloatingInput id="company" label="Company (optional)" value={form.company}
                onChange={(v) => setForm({ ...form, company: v })} />

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs uppercase tracking-wider text-muted-foreground">Message</Label>
                <Textarea id="message" required rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="rounded-2xl resize-none focus-visible:ring-2 focus-visible:ring-foreground/20" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p className="text-xs text-muted-foreground max-w-xs">
                  By sending you agree to our privacy policy. We never share your information.
                </p>
                <Button type="submit" size="lg" disabled={submitting || submitted}
                  className="rounded-full h-12 px-7 gap-2 min-w-[180px]">
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : submitted ? (
                    <><Check className="h-4 w-4" /> Sent</>
                  ) : (
                    <>Send message <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ─── SUPPORT CARDS ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Direct lines</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
              Talk to the<br />
              <span className="italic">right team.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Pick the channel that fits your message — your note lands directly in the inbox of the people who can help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORT_CARDS.map((c) => (
            <a key={c.title} href={c.href}
              className={`group relative flex flex-col justify-between p-6 rounded-3xl border min-h-[260px] transition-all hover:-translate-y-1 ${
                c.accent
                  ? "bg-foreground text-background border-foreground hover:bg-foreground/95"
                  : "bg-card border-border/60 hover:border-foreground"
              }`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                c.accent ? "bg-background/15 backdrop-blur" : "bg-foreground text-background"
              }`}>
                <c.icon className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-widest mb-2 ${c.accent ? "text-background/60" : "text-muted-foreground"}`}>
                  — {c.eyebrow}
                </p>
                <h3 className="font-serif text-xl font-medium leading-tight mb-2">{c.title}</h3>
                <p className={`text-sm leading-relaxed ${c.accent ? "text-background/70" : "text-muted-foreground"}`}>
                  {c.desc}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 pt-4 mt-2 border-t border-current/10">
                <span className={`text-xs truncate ${c.accent ? "text-background/80" : "text-foreground"}`}>
                  {c.contact}
                </span>
                <ArrowUpRight className="h-4 w-4 group-hover:rotate-45 transition-transform shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── STUDIO IMAGERY ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-7 relative rounded-3xl overflow-hidden border border-border/60 min-h-[340px]">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"
              alt="The TechPulse studio in Bengaluru"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/70 mb-2">— The studio</p>
              <h3 className="font-serif text-2xl lg:text-3xl font-light leading-tight max-w-md">
                Visit our experience<br />
                <span className="italic">studio in Bengaluru.</span>
              </h3>
            </div>
          </div>

          <div className="md:col-span-5 grid grid-rows-2 gap-4">
            <div className="relative rounded-3xl overflow-hidden border border-border/60 min-h-[160px]">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                alt="Workspace with desk and plants"
                className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="rounded-3xl border border-border/60 bg-accent/40 p-6 flex flex-col justify-between min-h-[160px]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">— Hours</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mon — Fri</span>
                  <span className="font-medium">10:00 — 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">11:00 — 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
              <a href="#" className="text-xs font-medium inline-flex items-center gap-1 hover:text-primary">
                Book a visit <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Common questions</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
              Before you<br />
              <span className="italic">write in.</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-sm leading-relaxed">
              You might find your answer here — these are the things we get asked most often.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Faq />
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="relative rounded-[2rem] overflow-hidden bg-foreground text-background p-8 lg:p-16">
          <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-background/60 mb-4">— Until then</p>
              <h3 className="font-serif font-light leading-[1.05] text-[clamp(2.25rem,5vw,4rem)]">
                Browse the<br />
                <span className="italic">collection.</span>
              </h3>
              <p className="text-sm text-background/70 mt-5 max-w-md leading-relaxed">
                While you wait for our reply, explore the latest in premium tech — every product is hand-picked by our team.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/store">
                <Button size="lg" variant="secondary" className="rounded-full h-12 px-7 gap-2 text-sm font-medium">
                  Explore store <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="ghost"
                  className="rounded-full h-12 px-6 text-sm font-medium text-background hover:bg-background/10 hover:text-background">
                  Our story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FloatingInput({
  id, label, value, onChange, type = "text", required = false,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input id={id} type={type} required={required} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-foreground/20" />
    </div>
  );
}

function Faq() {
  return <FaqAccordion items={FAQ_ITEMS} />;
}
