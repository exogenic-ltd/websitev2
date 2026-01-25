export const prerender = false;

import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';

// Users are stored in environment variable as JSON: {"username": "hashedPassword", ...}
// To generate a hashed password, use: npx bcryptjs-cli hash "yourpassword"
// Or in Node: require('bcryptjs').hashSync('password', 10)

const getUsers = (): Record<string, string> => {
    const usersJson = import.meta.env.DASHBOARD_USERS || (typeof process !== 'undefined' ? process.env.DASHBOARD_USERS : undefined);

    if (!usersJson) {
        console.warn('DASHBOARD_USERS environment variable not set');
        return {};
    }

    try {
        return JSON.parse(usersJson);
    } catch (e) {
        console.error('Failed to parse DASHBOARD_USERS');
        return {};
    }
};

export const POST: APIRoute = async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username')?.toString().toLowerCase();
    const password = formData.get('password')?.toString();

    if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const users = getUsers();
    const hashedPassword = users[username];

    if (!hashedPassword) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Create session token (base64 encoded username:timestamp)
    const sessionToken = btoa(`${username}:${Date.now()}`);

    cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    });

    return new Response(JSON.stringify({ success: true, redirect: '/dashboard' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const DELETE: APIRoute = async ({ cookies }) => {
    cookies.delete('session', { path: '/' });
    return new Response(JSON.stringify({ success: true, redirect: '/login' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
