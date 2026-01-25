import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Only protect /dashboard routes
    if (pathname.startsWith('/dashboard')) {
        const sessionToken = context.cookies.get('session')?.value;

        if (!sessionToken) {
            return context.redirect('/login');
        }

        // Verify session token (simple base64 encoded username:timestamp)
        try {
            const decoded = atob(sessionToken);
            const [username, timestamp] = decoded.split(':');
            const sessionAge = Date.now() - parseInt(timestamp);

            // Session expires after 24 hours
            if (sessionAge > 24 * 60 * 60 * 1000) {
                context.cookies.delete('session');
                return context.redirect('/login');
            }

            // Add user to locals for use in pages
            context.locals.user = { username };
        } catch {
            context.cookies.delete('session');
            return context.redirect('/login');
        }
    }

    return next();
});
