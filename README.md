# fetchmap

[![npm](https://img.shields.io/npm/v/fetchmap)](https://npm.im/fetchmap)
[![build](https://github.com/iyegoroff/fetchmap/workflows/build/badge.svg)](https://github.com/iyegoroff/fetchmap/actions/workflows/build.yml)
[![publish](https://github.com/iyegoroff/fetchmap/workflows/publish/badge.svg)](https://github.com/iyegoroff/fetchmap/actions/workflows/publish.yml)
[![codecov](https://codecov.io/gh/iyegoroff/fetchmap/branch/main/graph/badge.svg?token=YC314L3ZF7)](https://codecov.io/gh/iyegoroff/fetchmap)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Fts-railway%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/fetchmap)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/fetchmap?label=min+gzip)](https://bundlephobia.com/package/fetchmap)
[![npm](https://img.shields.io/npm/l/fetchmap.svg?t=1495378566926)](https://www.npmjs.com/package/fetchmap)

<!-- [![Bundlephobia](https://badgen.net/bundlephobia/minzip/fetchmap?label=min+gzip)](https://bundlephobia.com/package/fetchmap) -->

Non-throwing fetch wrapper

## Getting started

```
npm i fetchmap
```

## Description

This is a simple wrapper for standard `fetch` function that takes extended `RequestInit` and third-party `fetch` funcition, catches all possible exceptions and returns a 'success or failure' wrapped value. By default this value is just `Response`, but `mapSuccess` and `mapFailure` options can be used to transform the received `Response`. If `response.ok` is `true` response will be transformed by `mapSuccess`, otherwise - by `mapFailure`. Possible errors are divided into `clientError`, `mapError` and `serverError`.

## Example

```ts
// server code
import express from 'express'

express()
  .get('/json', (_, res) => {
    res.json({ some: 'data' })
  })
  .listen(5005)

// client code
import { fetchmap } from 'fetchmap'

const jsonSuccess = await fetchmap(
  { url: 'https://localhost:5005/json', mapSuccess: 'json' },
  fetch
)
expect(jsonSuccess).toEqual({ tag: 'success', success: { some: 'data' } })

const invalidUrlFailure = await fetchmap({ url: '1234' }, fetch)
expect(invalidUrlFailure).toEqual({
  tag: 'failure',
  failure: { clientError: new TypeError('Only absolute URLs are supported') }
})

const notFoundError = await fetchmap(
  {
    url: 'https://localhost:5005/invalid',
    mapFailure: ({ status }: Response) => status
  },
  fetch
)
expect(notFoundError).toEqual({ tag: 'failure', failure: { serverError: 404 } })
```

## Usage

See [test](/test) or [playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgMwKYwMYAsQEMxwC+KUEIcA5GpjvhQFD0YQB2AzvAFYCuHASqjaR2qOAF4U6bHjAAKJNygAbAFyUsMGGBUB6HUogZcSrBA4qArAAYrFikQA0kmgEpGzdlzasAytwwYgmziztL48nCKquqa2noGRiZmMJY2dk4yfgFBahSc3iz2hE7U2G5MrBxwAEYG1VmBbGwAgiwAJgAqqAAeMABiuMBKiqISpbRyCsq5Glq6+obGpubWthQZ+A05lLUQ1etwMgNDI7kwPTBFJVJY5R5VyNwsGDDAvv6NwWM3MhFRM7F5gklslUmsNmAtk01LIoGoBEJKqgXOIAHxwKAAOg4uBgvEcoVu7kq8D2nFQLwAsvgvoTfgh6HAmZFpjE5vFFkkVml1ozmZkPtskAAmGy5XBQKC4ACeACFuMg0FADm1UMhcNwlClKOdelc+UyjoNhlBUGokAAWKwWs4XFVqjVamFwuAI4RsZFojFEejFQl3EkY1AAR24ghgAEkWMAYAB5MAwWnjeks6IUWZxBaJZYpVbpQ7oUxtXIABVjPg6BwwptVLFexjYuWAz2Gqqu-voQA)

## Misc

[ts-railway](https://github.com/iyegoroff/ts-railway) - compatible result library
