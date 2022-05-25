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

This is a simple wrapper for a `fetch`-like function that catches all possible exceptions and returns a 'success or failure' wrapped value. It takes an object to map `response.status` to `<T, U>(body: U, response: Response) => T` transform and standard `fetch` arguments.

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
import { createFetchmap } from 'fetchmap'
import fetch from 'node-fetch'

const success = <T>(value: T) => ({ tag: 'success', success: value } as const)

const fetchmap = createFetchmap(fetch)

const mock_data_validator = (data: unknown) => success(data)

const json_success = await fetchmap(
  { ok: { json: mock_data_validator } },
  'https://localhost:5005/json'
)
expect(json_success).toEqual({ tag: 'success', success: { some: 'data' } })

const json_success_only_200 = await fetchmap(
  { 200: mock_data_validator },
  'https://localhost:5005/json'
)
expect(json_success_only_200).toEqual({ tag: 'success', success: { some: 'data' } })

const invalid_url_failure = await fetchmap({}, '1234')
expect(invalid_url_failure).toEqual({
  tag: 'failure',
  failure: { clientError: new TypeError('Only absolute URLs are supported') }
})

const not_found_error_with_request_init = await fetchmap(
  { notOk: ({ status }) => status },
  'https://localhost:5005/invalid',
  { method: 'POST', credentials: 'include' }
)
expect(not_found_error_with_request_init).toEqual({ tag: 'failure', failure: { serverError: 404 } })
```

## Usage

See [test](/test) or [playground](https://www.typescriptlang.org/play?jsx=0#code/JYWwDg9gTgLgBAbzgYygUwIYzQMTTZACxAzDgF84AzKCEOAcivyJLAYCgPkIA7AZ3j8ArsmRp+-OAF44AHgAqAPgAUANwwAbYWgBccBQEoZSuCqQwMAc30MRYifwYAaOPfGT9G7WgpwMUjwCMIbcfILUGMDa6DLyyipoULRQ+kYmZhbWtlRRMWgukdHC6PpJKX4BKOEhXEERzATEpHGomNh4TWwqjUShYcFwJZpxDIQwMGC6APTTmhDIWoQQgroArAAMG2ucAxEAVsKCAEoSkAK+sr3NYObkrsP99fAgCwDWACJYGABqWsAAEyw0DiKiBln0wl4b14EAA7rxjNJTOCMDJpLIGMBeN5AXBUQBCBhwAD8RXyKixOP+AOJVWexn07kc5nx3woTxqcH2-D4f00gKwaABcQwcKi8Gu3SQEDe+iQPL4+leyE+335gpgIMo9yGUE0-WAVDMit4GvBwoAdJYrOjMczJAxjAgOHA3dUBBBNGhLfMrJSHfxdIVTeahQDLYHQpQ0Jp+L4Xe6Pbzvb6IP6mHkSnoQ7yzTTw5bcsV0NG6lyAEbzCsAZVEHn4AEFeACFGgAB4wHBZ2JXFg3Vmy+VwKsQCv6dsZQMqdvGXWwmAAeTliDg2E7E6n9ZZs78use5cGsIAQhAAQBPOsOSRxKWkQcrpAns-n-QqKBI0zTqCRywwI5zhQDz6pygwgMImgwMAYDegAsqQUh9l096Ju6ABMWzDhgyQYOex7CFQzCpHAk7Im426SDOc7OK67oACwbHRw5UNAIBfBCJFbte-BUUBtFukOq7rjAm5kdOu73PxcALsuw7Pheb4flxDbvta55gGgc4cPuIGHhE6AAI46IIACSvDAEuYAwIh1D9tKOmaK4SAgPgywArYAAKi41gohRtACaC8FBWhBow2LINoAXEuQoRAA)

## Misc

[ts-railway](https://github.com/iyegoroff/ts-railway) - compatible result library
