export default function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const body = { error: err.message || 'Internal server error' };

  if (err.errors) {
    body.details = err.errors;
  }

  if (status >= 500) {
    console.error('Unhandled error:', err);
  }

  res.status(status).json(body);
}
