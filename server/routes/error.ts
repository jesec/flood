import {createError} from '@fastify/error';

export const FailedInitializeResponseError = createError<[]>('INTERNAL_ERROR', 'Flood server failed to initialize.');
