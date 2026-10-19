import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightAnimated } from "@/components/ui/animated-icons";
import { Reveal } from "@/components/marketing/Reveal";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog | Sabi Vault",
  description:
    "Writing on sovereign identity, cryptographic verification, and the design decisions behind Sabi Vault.",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <main className="bg-white text-brand-dark">
      <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
            Blog
          </p>
          <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
            Notes on building trust infrastructure.
          </h1>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 90}>
              <Link
                href={`/blog/${post.slug}`}
                className="liquid-glass-card group flex h-full flex-col rounded-2xl p-7 hover:border-brand-green/40"
              >
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="liquid-glass-pill px-2.5 py-1 font-semibold text-brand-green">
                    {post.category}
                  </span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="mt-4 font-poppins text-lg font-bold leading-snug text-brand-dark group-hover:text-brand-green transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                <div className="mt-6 flex items-center justify-between text-xs">
                  <time dateTime={post.date} className="text-slate-500">
                    {formatDate(post.date)}
                  </time>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-brand-green">
                    Read <ArrowRightAnimated size={13} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
