# fetchmap

[![npm](https://img.shields.io/npm/v/fetchmap)](https://npm.im/fetchmap)
[![build](https://github.com/iyegoroff/fetchmap/workflows/build/badge.svg)](https://github.com/iyegoroff/fetchmap/actions/workflows/build.yml)
[![publish](https://github.com/iyegoroff/fetchmap/workflows/publish/badge.svg)](https://github.com/iyegoroff/fetchmap/actions/workflows/publish.yml)
[![codecov](https://codecov.io/gh/iyegoroff/fetchmap/branch/main/graph/badge.svg?token=YC314L3ZF7)](https://codecov.io/gh/iyegoroff/fetchmap)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Fts-railway%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/fetchmap?t=1)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/fetchmap?label=min+gzip)](https://bundlephobia.com/package/fetchmap)
[![npm](https://img.shields.io/npm/l/fetchmap.svg?t=1495378566926)](https://www.npmjs.com/package/fetchmap)

<!-- [![Bundlephobia](https://badgen.net/bundlephobia/minzip/fetchmap?label=min+gzip)](https://bundlephobia.com/package/fetchmap) -->

Non-throwing fetch wrapper

## Getting started

```
npm i fetchmap
```

## Description

This is a simple wrapper for standard `fetch` function that takes extended `RequestInit` and optional third-party `fetch` funcition, catches all possible exceptions and returns a 'success or failure' wrapped value. By default this value is just `Response`, but `mapSuccess` and `mapFailure` options can be used to transform the received `Response`. If `response.ok` is `true` response will be transformed by `mapSuccess`, otherwise - by `mapFailure`. Possible errors are divided into `clientError`, `mapError` and `serverError`.

## Usage

See [test](/test) or [playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgMwKYwMYAsQEMxwC+KUEIcA5GpjvhQFD0YQB2AzvAFYCuHASqjaR2qOAF4U6bHjAAKJNygAbAFyUsMGGBUB6HUogZcSrBA4qArAAYrFikQA0kmgEpGzdlzasAytwwYgmziztL48nCKquqa2noGRiZmMJY2dk4yfgFBahSc3iz2hG5MrBxwAEYGFVmBbGwAgiwAJgAqqAAeMABiuMBKiqIS1GFyCsq5Glq6+obGpubWthQZ+LU5lFUQFStwMr39g7kwnTBFJR7lyNwsGDDAvv51wcNStGOREzHT8XNJi2ldpknhtZFA1AIhGVUC5xAA+OBQAB0HFwMF4RAuZXg204qDuAFl8C9Qu95PQ4JTPtEKFM4rNEgsUkt0hSqcDsvU1EgAEw2XK4KBQXAATwAQtxkGgoLtmqhkLhuEoUpQTl0ig42ZT9n0BlBUNy4AAWKxG46nWXyxXKtRgiGCYRsGHwxFEejFdzYxGoACO3EEMAAkixgDAAPJgGAkkZk8Y0ukzBLzZKpZYZdCmZq5AAKYZ8rV2GH1cpY92MbFywFuAzl53oQA)

## Misc

[ts-railway](https://github.com/iyegoroff/ts-railway) - compatible result library
