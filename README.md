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

This is a simple wrapper for standard `fetch` function that catches all possible exceptions and returns a 'success or failure' wrapped value. It takes an object to map `response.status` to `(response: Response) => unknown` transform, standard `fetch` arguments and a `fetch` function itself. The last argument can be curried.

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

const json_success = await fetchmap({ ok: 'json' }, 'https://localhost:5005/json')(fetch)
expect(json_success).toEqual({ tag: 'success', success: { some: 'data' } })

const json_success_only_200 = await fetchmap({ 200: 'json' }, 'https://localhost:5005/json')(fetch)
expect(json_success_only_200).toEqual({ tag: 'success', success: { some: 'data' } })

const invalid_url_failure_non_curried_form = await fetchmap({}, '1234', undefined, fetch)
expect(invalid_url_failure_non_curried_form).toEqual({
  tag: 'failure',
  failure: { clientError: new TypeError('Only absolute URLs are supported') }
})

const not_found_error_with_request_init = await fetchmap(
  { notOk: ({ status }: Response) => status },
  'https://localhost:5005/invalid',
  { method: 'POST', credentials: 'include' }
)(fetch)
expect(not_found_error_with_request_init).toEqual({ tag: 'failure', failure: { serverError: 404 } })
```

## Usage

See [test](/test) or [playground](https://www.typescriptlang.org/play?ssl=7&ssc=58&pln=7&pc=63#code/JYWwDg9gTgLgBAbzgMwKYwMYAsQEMxwC+KUEIcA5GpjvhQFD0YQB2AzvAFYCuHASqjaR2qOAF4U6bHjAAKBIQA0lLDBhgAXAHotAGwgZcurBA4aArAAZL5igEpZ1bHcbN2XNqwDK3DBkFs4pI0MvJwEADWGpScniwURMoUquraegZGJmZWNvaOUlguTKwccABG+mU+fgEAgiwAJgAqqAAeMABiuMC63FCiEk60ckiR0RQVEGUUyiwQMADyUZQwbTAJSipqmjr6hsamMBbWtg5DRW6lyNwsGDDA3r7+bIGDBaGjy7JQ0QJCJag7OIAHxwKAAOg4uBgvESW1SuwyB2yJzy51cJXgU04qDuAFl8K9gtJ8PJ6HAKXAAEzWca4KBQXAATwAQtxkGgoDNyZSACyWXnjVbtBiU8LLCjC9aKHkUuaLL4-OB-YRsQEgsH0TbJbZpPaZQ7HXJnAoXTFg1AAR24ghgAEkWMBFmAYEShh9tSkdul9lkjjlbMokCB0CYGuMAAoLLxNGZwDD9BqoFj3IxscbAW69JMbE00FxAA)

## Misc

[ts-railway](https://github.com/iyegoroff/ts-railway) - compatible result library
