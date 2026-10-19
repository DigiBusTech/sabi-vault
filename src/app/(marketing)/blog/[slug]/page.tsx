import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPost, posts } from "../posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "Post not found | SabiProfile" };
  return { title: `${post.title} | SabiProfile`, description: post.excerpt };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="bg-white text-brand-dark">
      <article className="mx-auto max-w-3xl px-5 pt-20 pb-24 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-green-hover"
        >
          <ArrowLeft size={15} /> All posts
        </Link>

        <div className="mt-8 flex items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-brand-green-light px-2.5 py-1 font-semibold text-brand-green">
            {post.category}
          </span>
          <time dateTime={post.date}>
            {new Date(`${post.date}T00:00:00`).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mt-5 font-poppins text-3xl font-extrabold leading-[1.12] tracking-tight md:text-4xl">
          {post.title}
        </h1>

        <div className="mt-10 space-y-6">
          {post.body.map((paragraph, index) => (
            <p key={index} className="text-base leading-[1.85] text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
