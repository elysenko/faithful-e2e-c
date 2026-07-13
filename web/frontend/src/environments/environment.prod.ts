export const environment = {
  production: true,
  // Relative (no leading slash) so it resolves against <base href="/faithful-e2e-c/">,
  // producing /faithful-e2e-c/api/... which the ingress rewrites to /api/... for the server.
  apiUrl: 'api',
};
