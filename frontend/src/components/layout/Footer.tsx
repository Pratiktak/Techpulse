import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="font-serif text-3xl font-medium tracking-tight inline-block">
              TechPulse<span className="text-primary">.</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              A curated collection of premium tech, designed for those who refuse to compromise on craft, performance, and form.
            </p>
            <div className="flex gap-3 pt-2 text-xs text-muted-foreground">
              <span className="px-2.5 py-1 rounded-full bg-muted">Made in India</span>
              <span className="px-2.5 py-1 rounded-full bg-muted">Free shipping ₹999+</span>
            </div>
          </div>

          <FooterCol title="Shop" links={[
            { label: "All products", href: "/store" },
            { label: "New arrivals", href: "/store?sort=newest" },
            { label: "Top rated", href: "/store?sort=rating_desc" },
            { label: "Categories", href: "/store" },
          ]} />
          <FooterCol title="Company" links={[
            { label: "About us", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Become a partner", href: "/partner" },
            { label: "Careers", href: "#" },
          ]} />
          <FooterCol title="Support" links={[
            { label: "Help center", href: "/contact" },
            { label: "Shipping & returns", href: "#" },
            { label: "Privacy policy", href: "#" },
            { label: "Terms of service", href: "#" },
          ]} />
        </div>

        <div className="pt-8 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TechPulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>INR · India</span>
            <Link href="/about" className="hover:text-foreground inline-flex items-center gap-1">
              About <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="md:col-span-2 lg:col-span-2">
      <h4 className="font-medium text-sm mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-foreground transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
