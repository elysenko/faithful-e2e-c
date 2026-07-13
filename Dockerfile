# syntax=docker/dockerfile:1
FROM nginx:1.27-alpine

# Repo contains only README.md — serve a minimal static landing page.
WORKDIR /usr/share/nginx/html
RUN rm -f index.html
COPY README.md /usr/share/nginx/html/README.md
RUN printf '<!doctype html>\n<html>\n<head><meta charset="utf-8"><title>faithful-e2e-c</title></head>\n<body>\n<h1>faithful-e2e-c</h1>\n<p>Placeholder deployment. The source repository contains no application code yet.</p>\n<p>See <a href="/README.md">README.md</a>.</p>\n</body>\n</html>\n' > /usr/share/nginx/html/index.html

EXPOSE 8080

# Listen on 8080 (matches the port used by the k8s Service target).
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
