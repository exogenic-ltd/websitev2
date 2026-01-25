export const prerender = false;

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const getRedis = () => {
    const url = import.meta.env.UPSTASH_REDIS_REST_URL;
    const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return null;
    }

    return new Redis({ url, token });
};

const TASKS_KEY = 'exogenic:tasks';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// GET - Fetch all tasks
export const GET: APIRoute = async ({ locals }) => {
    const redis = getRedis();

    if (!redis) {
        // Return empty tasks if Redis not configured (for local dev)
        return new Response(JSON.stringify({ tasks: [] }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const tasks = await redis.get<Task[]>(TASKS_KEY) || [];
        return new Response(JSON.stringify({ tasks }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch tasks', tasks: [] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// POST - Create a new task
export const POST: APIRoute = async ({ request, locals }) => {
    const redis = getRedis();

    if (!redis) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const { title, description } = body;

        if (!title?.trim()) {
            return new Response(JSON.stringify({ error: 'Title is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const tasks = await redis.get<Task[]>(TASKS_KEY) || [];

        const newTask: Task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: title.trim(),
            description: description?.trim() || '',
            status: 'todo',
            createdBy: locals.user?.username || 'anonymous',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tasks.push(newTask);
        await redis.set(TASKS_KEY, tasks);

        return new Response(JSON.stringify({ task: newTask }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to create task:', error);
        return new Response(JSON.stringify({ error: 'Failed to create task' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// PUT - Update a task
export const PUT: APIRoute = async ({ request, locals }) => {
    const redis = getRedis();

    if (!redis) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const { id, title, description, status } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: 'Task ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const tasks = await redis.get<Task[]>(TASKS_KEY) || [];
        const taskIndex = tasks.findIndex(t => t.id === id);

        if (taskIndex === -1) {
            return new Response(JSON.stringify({ error: 'Task not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const updatedTask = {
            ...tasks[taskIndex],
            ...(title !== undefined && { title: title.trim() }),
            ...(description !== undefined && { description: description.trim() }),
            ...(status !== undefined && { status }),
            updatedAt: new Date().toISOString()
        };

        tasks[taskIndex] = updatedTask;
        await redis.set(TASKS_KEY, tasks);

        return new Response(JSON.stringify({ task: updatedTask }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to update task:', error);
        return new Response(JSON.stringify({ error: 'Failed to update task' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// DELETE - Delete a task
export const DELETE: APIRoute = async ({ request }) => {
    const redis = getRedis();

    if (!redis) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: 'Task ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const tasks = await redis.get<Task[]>(TASKS_KEY) || [];
        const filteredTasks = tasks.filter(t => t.id !== id);

        if (filteredTasks.length === tasks.length) {
            return new Response(JSON.stringify({ error: 'Task not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await redis.set(TASKS_KEY, filteredTasks);

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to delete task:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete task' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
