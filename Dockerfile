FROM node:22-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV YARN_NODE_LINKER=node-modules

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .

# `NEXT_PUBLIC_*` vars get inlined into the client bundle at build time, so
# they must be visible to this RUN step specifically — not just at runtime.
# Railway auto-injects all Service Variables as build args for Dockerfile
# builds, but each one still needs an explicit ARG (to receive it) + ENV
# (to expose it to `yarn build`) here, or it silently comes through as
# undefined and gets baked into the browser bundle that way.
ARG NEXT_PUBLIC_ALGOLIA_APP_ID
ARG NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
ARG NEXT_PUBLIC_DIRECTUS_IMAGE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_ALGOLIA_APP_ID=$NEXT_PUBLIC_ALGOLIA_APP_ID
ENV NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=$NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
ENV NEXT_PUBLIC_DIRECTUS_IMAGE_URL=$NEXT_PUBLIC_DIRECTUS_IMAGE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
