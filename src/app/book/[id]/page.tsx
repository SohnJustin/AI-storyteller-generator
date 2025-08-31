// src/app/book/[id]/page.tsx
import { prisma } from "@/lib/prismaClient";
import ReadAlong from "@/app/components/ReadAlong";
// import ReadMyself from "@/app/components/ReadMyself";

export default async function BookByIdPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Promise<{ mode?: string }>;
}) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    select: { title: true, body: true, expiresAt: true },
  });

  if (!story || story.expiresAt < new Date()) {
    return (
      <div style={{ padding: 24 }}>
        This story has expired or doesn’t exist.
      </div>
    );
  }

  const sp = await searchParams;
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
