import { prisma } from "@/lib/prismaClient";
import ReadAlong from "@/app/components/ReadAlong";
export default async function BookByIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const p = await params;
  const sp = await searchParams;

  const story = await prisma.story.findUnique({
    where: { id: p.id },
    select: { title: true, body: true, expiresAt: true },
  });

  if (!story || (story.expiresAt && story.expiresAt < new Date())) {
    return (
      <div className="book-desk">
        <div className="book" style={{ maxWidth: 520 }}>
          <div className="book-spread">
            <p className="book-content" style={{ columnCount: 1 }}>
              This story has expired or doesn’t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // mode is reserved for future Read Myself view; both render the book reader.
  void (sp.mode ?? "readAlong");
  return (
    <div className="book-desk">
      <ReadAlong text={story.body} title={story.title} />
    </div>
  );
}
