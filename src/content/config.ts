import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string().optional(),
        image: z.string().optional(),
        author: z.string().default('ExoGenic Team'),
        tags: z.array(z.string()).optional()
    }),
});

const teamCollection = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        role: z.string(),
        image: z.string().optional(),
        email: z.string().optional(),
        linkedin: z.string().optional(),
        orcid: z.string().optional(),
        category: z.enum(['Directors', 'Advisors', 'Core Team']).default('Core Team'),
        order: z.number().optional().default(100)
    }),
});

const projectsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        icon: z.string().optional(),
        description: z.string().optional(),
        featured: z.boolean().default(false),
        image: z.string().optional(),
        link: z.string().optional(),
        order: z.number().optional().default(100)
    }),
});

export const collections = {
    blog: blogCollection,
    team: teamCollection,
    projects: projectsCollection
};
