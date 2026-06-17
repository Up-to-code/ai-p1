import { api } from "@convex/_generated/api";
import { Download, ExternalLink, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { convexHttp } from "@/server/convex/http-client";

type PublicFilePageProps = {
  params: Promise<{ id: string }>;
};

async function readPublicFile(mediaId: string) {
  try {
    return await convexHttp.query(api.media.read.getForPublicRoute, { mediaId: mediaId as never });
  } catch {
    return null;
  }
}

function fileKindLabel(mimeType: string) {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType === "application/pdf") return "PDF";
  return "Document";
}

export default async function PublicFilePage({ params }: PublicFilePageProps) {
  const { id } = await params;
  const asset = await readPublicFile(id);

  if (!asset) notFound();

  const kind = fileKindLabel(asset.mimeType);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/85 px-4 py-3 backdrop-blur dark:bg-background/85">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{kind}</p>
              <h1 className="truncate text-base font-black tracking-tight sm:text-lg">{asset.name}</h1>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 px-4 text-xs font-black uppercase tracking-widest text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              <ExternalLink className="me-2 h-4 w-4" />
              Open
            </a>
            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              download={asset.name}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <Download className="me-2 h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-6xl items-center justify-center p-4">
        {asset.mimeType.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={asset.name} className="max-h-[calc(100vh-120px)] max-w-full object-contain" />
        ) : asset.mimeType.startsWith("video/") ? (
          <video src={asset.url} className="max-h-[calc(100vh-120px)] max-w-full" controls />
        ) : asset.mimeType === "application/pdf" ? (
          <iframe title={asset.name} src={asset.url} className="h-[calc(100vh-120px)] w-full border border-zinc-200 bg-white dark:border-white/10" />
        ) : (
          <div className="max-w-md text-center">
            <FileText className="mx-auto h-10 w-10 text-zinc-400" />
            <p className="mt-4 text-sm font-bold text-zinc-500 dark:text-zinc-300">Preview is not available for this file type.</p>
          </div>
        )}
      </section>
    </main>
  );
}
