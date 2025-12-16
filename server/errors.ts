import createError from '@fastify/error';

export const UnauthorizedError = createError('FLOOD_UNAUTHORIZED', 'Unauthorized', 401);
export const AdminRequiredError = createError('FLOOD_ADMIN_REQUIRED', 'User is not admin.', 403);
export const InitializationFailedError = createError('FLOOD_INIT_FAILED', 'Flood server failed to initialize.', 500);
export const NotFoundError = createError('FLOOD_NOT_FOUND', 'Not found', 404);
