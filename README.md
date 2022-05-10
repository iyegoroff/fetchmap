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

This is a simple wrapper for a`fetch`-like function that catches all possible exceptions and returns a 'success or failure' wrapped value. It takes an object to map `response.status` to `<T>(response: Response) => T` transform and standard `fetch` arguments. The last argument can be curried.

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

const fetchmap = createFetchmap(fetch)

const json_success = await fetchmap({ ok: 'json' }, 'https://localhost:5005/json')
expect(json_success).toEqual({ tag: 'success', success: { some: 'data' } })

const json_success_only_200 = await fetchmap({ 200: 'json' }, 'https://localhost:5005/json')
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

See [test](/test) or [playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgYygUwIYzQMTTZACxAzDgF84AzKCEOAcivyJLAYCgPkIA7AZ3jMCxUnAC8KdFlwtRYABTCiASi48B8AK5QANhMaEYMMAC4A9Od0RkGXYQiDTAVgAMr55259BcAFZaggBKaPyQAmgGyvIKCOQANHA6umremv78fADKWsjIofxRcmyxcBAA1qaMfpm8DBSJyakavgBG1q05eQUAgrwAJgAqaAAeMDgYwLo6kZLRJUgVVQztEK0MibwQMADylYzYY-UJSXrNPkJavMgwwNm5+fyFc8WkpUtwClAqEgB8cFAAHSCLCBBqnFLqC5wEBaXS3MC6NAAWVIz2or0UCA4cFxcAATO5lhgoFAMABPABCWiozCgGxxeIALK4mcsqNAQAARLAYBl4sr7BiHGD8vFbXb7L4-cT-IEwclgNAcE5NKHpdAARy0oRgAEleMBdmAYOj5m84o09IkkCB8A5+ssAAo7LKDDZSND9NC8W52fjLYDXabe45qIA)

## Misc

[ts-railway](https://github.com/iyegoroff/ts-railway) - compatible result library
