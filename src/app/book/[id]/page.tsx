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
      <div style={{ padding: 24 }}>
        This story has expired or doesn’t exist.
      </div>
    );
  }

  const mode = (sp.mode ?? "readAlong").toLowerCase();
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>{story.title}</h1>
      {mode === "readMyself" ? (
        /* <ReadMyself text={story.body} title={story.title} storyId={params.id} /> */ <ReadAlong
          text={story.body}
        />
      ) : (
        <ReadAlong text={story.body} />
      )}
    </div>
  );
}
