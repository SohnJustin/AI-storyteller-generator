import { auth } from "@/auth";
import { prisma } from "@/lib/prismaClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  // Middleware already gates this route, but guard here too for safety.
  if (!session?.user) redirect("/login");

  const userId = Number(session.user.id);
  const stories = await prisma.story.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true, expiresAt: true },
  });

  const now = new Date();

  return (
    <div style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        {session.user.name || session.user.email}
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        {session.user.email}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem" }}>Your Stories</h2>
        <Link href="/generate-story" style={{ textDecoration: "underline" }}>
          + New Story
        </Link>
      </div>

      {stories.length === 0 ? (
        <p style={{ color: "#666" }}>
          You haven&apos;t generated any stories yet.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {stories.map((story) => {
            const expired = story.expiresAt < now;
            return (
              <li
                key={story.id}
                style={{
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                {expired ? (
                  <span style={{ color: "#999" }}>
                    {story.title} (expired)
                  </span>
                ) : (
                  <Link
                    href={`/book/${story.id}?mode=readAlong`}
                    style={{ textDecoration: "underline" }}
                  >
                    {story.title}
                  </Link>
                )}
                <span
                  style={{
                    color: "#999",
                    fontSize: "0.85rem",
                    marginLeft: "0.5rem",
                  }}
                >
                  {story.createdAt.toLocaleDateString()}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
