import { BlogCard } from "./blog-card";
import type { PayloadBlogPost } from "@/lib/payload-api";

type BlogListProps = {
  posts: PayloadBlogPost[];
  locale: string;
};

export function BlogList({ posts, locale }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-400">
          {locale === "ar" ? "لا توجد مقالات بعد" : "No blog posts yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
