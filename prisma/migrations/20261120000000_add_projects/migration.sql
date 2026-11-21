-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "customText" TEXT,
    "tags" TEXT[],
    "liveUrl" TEXT,
    "githubUrl" TEXT,
    "showStatus" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- Seed with the projects that were previously hardcoded in components/projects.tsx
INSERT INTO "Project" ("id", "title", "description", "image", "customText", "tags", "liveUrl", "githubUrl", "showStatus", "isActive", "order", "updatedAt") VALUES
(
    'seed_vaded_hosting',
    'Vaded Hosting',
    'A comprehensive server hosting platform offering cloud infrastructure, automated deployments, and scalable hosting solutions for web applications.',
    '/placeholder-animated.svg',
    'VADED HOSTING',
    ARRAY['Node.js', 'React', 'Docker', 'Kubernetes', 'AWS', 'Oracle Cloud', 'Nginx', 'MySQL', 'Redis'],
    'https://vaded-hosting.com',
    NULL,
    true,
    true,
    0,
    CURRENT_TIMESTAMP
),
(
    'seed_portfolio_website',
    'Portfolio Website',
    'A responsive portfolio website showcasing projects and skills with a modern design.',
    '/placeholder-animated.svg',
    'LEVIK.DEV',
    ARRAY['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'Radix UI'],
    NULL,
    NULL,
    true,
    true,
    1,
    CURRENT_TIMESTAMP
),
(
    'seed_vadedtv',
    'VadedTV',
    'A movie and TV streaming platform offering a sleek browsing experience with curated content, search, and media playback.',
    '/placeholder-animated.svg',
    'VADEDTV',
    ARRAY['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Streaming', 'Media'],
    'https://vadedtv.com',
    NULL,
    true,
    true,
    2,
    CURRENT_TIMESTAMP
);
