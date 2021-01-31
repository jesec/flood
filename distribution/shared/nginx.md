In order to use Flood behind a reverse proxy:

- Forward `/api` requests to Flood's NodeJS backend server.
- Serve static assets.
- Redirects client routes (`/overview`, `/register` and `/login`) to `index.html`.

Alternatively you may let Flood's server handle all requests. However, if you want better performance, serve static assets from the web server.

This tutorial assumes that Flood is running at `127.0.0.1:3000`. This is configurable by `--host` and `--port` arguments.

This tutorial assumes that Flood is installed in `/usr/lib/node_modules/flood` and as such assets are located in:

<pre>
/usr/lib/node_modules/flood<b>/dist/assets</b>
</pre>

## Serve from the root

For example:

<pre>
<b>subdomain</b>.your-domain.com
</pre>

Your nginx config should contain these rules:

```nginx
server_name subdomain.your-domain.com;
root /usr/lib/node_modules/flood/dist/assets;

location /api {
  proxy_pass http://127.0.0.1:3000;
}

location / {
  try_files $uri /index.html;
}
```

## Serve from a nested route

Often people want to expose multiple web applications with a single nginx config. This is possible using Flood's `--baseuri` option.

For example, when `--baseuri=/flood`, you may access Flood at:

<pre>
your-domain.com<b>/flood/</b>
                     <b>↑</b>
</pre>

Flood frontend uses relative path so there has to be a slash at the end when you access the nested route.

You may configure your web server to redirect users from `/flood` to `/flood/`. It is not covered by this tutorial.

Your nginx config should contain these rules:

```nginx
server_name your-domain.com;

location /flood/api {
  proxy_pass http://127.0.0.1:3000;
}

location /flood/ {
  alias /usr/lib/node_modules/flood/dist/assets/;
  try_files $uri /flood/index.html;
}
```

## Disable caching for API endpoints

API requests should not be cached. You can disable caching in nginx by adding these lines in your `location /api` block:

```nginx
proxy_buffering off;
proxy_cache off;
```

## Compression

Static assets of Flood are large. Compression can save bandwidth and make the page loading faster.

Note that to enable compression, you must serve static assets from web server.

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/json application/javascript image/x-icon;
```

You may also use other compression methods such as `brotli`.

## HTTP Basic Auth

You may opt to use HTTP basic auth. To avoid double authentication, use `auth=none` option of Flood and pre-configure client connection settings.

https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication

```
satisfy any;
allow 192.168.1.0/24; # Allows unauthenticated access from local network
deny all;

auth_basic "Private Server";
auth_basic_user_file /etc/nginx/.passwords.list;
```
