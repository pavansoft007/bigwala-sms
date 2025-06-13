export function realIpMiddleware(req, res, next) {
    const normalizeIp = (ip) => ip?.replace(/^::ffff:/, '').replace('::1', '127.0.0.1');

    let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    req.realIp = normalizeIp(ip);

    next();
}
