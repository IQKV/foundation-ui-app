ARG BASE_IMAGE=nginx:1.27-alpine

FROM ${BASE_IMAGE}

LABEL maintainer="maintainer@knowhowto.dev"

ARG VCS_REFERENCE
ARG BUILD_VERSION_REFERENCE

ENV APPLICATION_VCS_REFERENCE=${VCS_REFERENCE}
ENV APPLICATION_BUILD_VERSION=${BUILD_VERSION_REFERENCE}

# Copy pre-built Vite output into Nginx html root.
# config.js and content-security-policy.conf are bind-mounted at runtime
# from /app/docker/ui-app/ — see compose.yaml volumes.
COPY dist/ /usr/share/nginx/html

# SPA routing: serve index.html for all unmatched routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
