# EngUt is a fully offline-first Expo/React Native app with no backend — native
# Android/iOS builds don't "run" inside Docker at all (they need a device/emulator
# and go through EAS or a local native toolchain). What Docker CAN usefully do here
# is host the *web* target (react-native-web) for dev/test/CI/preprod/prod, since
# `npx expo start --web` / `npx expo export --platform web` are just Node processes.
#
# Stages:
#   deps     - install node_modules once, shared by every other stage
#   dev      - `expo start --web` with live reload, for docker-compose local dev
#   test     - runs the project's defined check (`tsc --noEmit`), used by CI
#   build    - `expo export --platform web` -> static bundle in /app/dist
#   preprod  - serves that exact static bundle with a plain Node server, so it's
#              cheap to point staging traffic at before promoting the same bundle to prod
#   prod     - nginx serving the same static export, nothing else in the image

ARG NODE_VERSION=22-bookworm-slim

# ---- deps -------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev ----------------------------------------------------------------
FROM deps AS dev
WORKDIR /app
COPY . .
ENV EXPO_NO_TELEMETRY=1 \
    CI=1
EXPOSE 8081
CMD ["npx", "expo", "start", "--web"]

# ---- test / CI ------------------------------------------------------------
FROM deps AS test
WORKDIR /app
COPY . .
ENV EXPO_NO_TELEMETRY=1
CMD ["npx", "tsc", "--noEmit"]

# ---- build (static web export) --------------------------------------------
FROM deps AS build
WORKDIR /app
COPY . .
ENV EXPO_NO_TELEMETRY=1
RUN npx expo export --platform web --output-dir dist

# ---- preprod (serve the real export, still a plain node process so it's
#      cheap to add temporary debug logging/env before it graduates to prod) --
FROM build AS preprod
WORKDIR /app
RUN npm install -g serve
EXPOSE 8081
CMD ["serve", "dist", "-l", "8081"]

# ---- prod (nginx serving the static export) -------------------------------
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
