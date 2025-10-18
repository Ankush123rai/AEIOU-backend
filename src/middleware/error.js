export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) {
    req.log?.error(err);
    console.error(err);
  }
  res.status(status).json({ error: message, details: err.details || undefined });
}
