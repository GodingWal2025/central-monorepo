import { HttpRequest, HttpResponseInit } from '@azure/functions';

/**
 * Optional shared-secret gate for the ontology routes.
 *
 * Disabled (a no-op) until `API_SHARED_SECRET` is set in the environment, so local
 * development keeps working with zero configuration. Once the secret IS configured,
 * every request must present a matching `x-api-key` header (or `Authorization: Bearer
 * <secret>`), otherwise it is rejected with 401.
 *
 * This is defense-in-depth. In production the Function App should ALSO be fronted by
 * Azure AD / App Service Authentication ("Easy Auth") at the platform level.
 *
 * @returns an HttpResponseInit to short-circuit with when the request is unauthorized,
 *          or `null` when the request may proceed.
 */
export function checkAuth(req: HttpRequest): HttpResponseInit | null {
  const secret = process.env.API_SHARED_SECRET;
  if (!secret) return null; // auth disabled — local/dev default

  const provided =
    req.headers.get('x-api-key') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    null;

  if (provided !== secret) {
    return { status: 401, jsonBody: { error: 'Unauthorized' } };
  }
  return null;
}
