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

Non-throwing Fetch API wrapper

## Getting started

```
npm i fetchmap
```

## Description

This is a simple wrapper for a `fetch`-like function that catches all possible exceptions and returns a 'success or failure' wrapped value. It takes an object that maps `response.status` to validating transform and standard `fetch` arguments.

Read the docs [here](https://iyegoroff.github.io/fetchmap/modules.html#createFetchmap) and check how `fetchmap` infers types at the [playground](https://www.typescriptlang.org/play?jsx=0#code/JYWwDg9gTgLgBAbzgYygUwIYzQMTTZACxAzDgF84AzKCEOAcivyJLAYCgPkIA7AZ3j8ArsmRp+-OAF44AHgAqAPgAUANwwAbYWgBccBQEoZSuCqQwMAc30MRYifwYAaOPfGT9G7WgpwMUjwCMIbcfILUGMDa6DLyyipoULRQ+kYmZhbWtlRRMWgukdHC6PpJKX4BKOEhXEERzATEpHGomNh4TWwqjUShYcFwJZpxDIQwMGC6APTTmhDIWoQQgroArAAMG2ucAxEAVsKCAEoSkAK+sr3NYObkrsP99fAgCwDWACJYGABqWsAAEyw0DiKiBln0wl4b14EAA7rxjNJTOCMDJpLIGMBeN5AXBUQBCBhwAD8RXyKixOP+AOJVWexn07kc5nx3woTxqcH2-D4f00gKwaABcQwcKi8Gu3SQEDe+iQPL4+leyE+335gpgIMo9yGUE0-WAVDMit4GvBwoAdJYrOjMczJAxjAgOHA3dUBBBNGhLfMrJSHfxdIVTeahQDLYHQpQ0Jp+L4Xe6Pbzvb6IP6mHkSnoQ7yzTTw5bcsV0NG6lyAEbzCsAZVEHn4AEFeACFGgAB4wHBZ2JXFg3Vmy+VwKsQCv6dsZQMqdvGXWwmAAeTliDg2E7E6n9ZZs78use5cGsIAQhAAQBPOsOSRxKWkQcrpAns-n-QqKBI0zTqCRywwI5zhQDz6pygwgMImgwMAYDegAsqQUh9l096Ju6ABMWzDhgyQYOex7CFQzCpHAk7Im426SDOc7OK67oACwbHRw5UNAIBfBCJFbte-BUUBtFukOq7rjAm5kdOu73PxcALsuw7Pheb4flxDbvta55gGgc4cPuIGHhE6AAI46IIACSvDAEuYAwIh1D9tKOmaK4SAgPgywArYAAKi41gohRtACaC8FBWhBow2LINoAXEuQoRAA). Also there is a compatible result library - [ts-railway](https://github.com/iyegoroff/ts-railway).

## Example

Server code:

```ts
import express from 'express'

express()
  .get('/data', (_, res) => {
    const rnd = Math.random()

    if (rnd < 0.34) {
      res.status(200).json({ some: 'data' })
    } else if (rnd < 0.67) {
      res.status(201).send('This is not JSON!')
    } else {
      res.status(500).send('Server error!')
    }
  })
  .listen(5005)
```

Client code:

```ts
import { createFetchmap } from 'fetchmap'
import nodeFetch, { Response } from 'node-fetch'
import { isRecord } from 'ts-is-record'

// fetchmap compatible result creators
const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

// wrap any fetch-like function
const fetchmap = createFetchmap(nodeFetch)

// data is expected to be JSON, so it has to be validated
const validateData = (body: unknown) =>
  isRecord(body) && 'some' in body && typeof body.some === 'string'
    ? success(body)
    : failure('data validation failed' as const)

// error is just a string, in this example no validation needed
const validateError = (body: string, { status }: Response) => success({ message: body, status })

const dataResult = await fetchmap(
  {
    // for any response with a status inside inclusive range 200..299
    // call 'json' method and validate its result with `validateData` function
    ok: { json: validateData },

    // for any response with a status outside inclusive range 200..299
    // call 'text' method and validate its result with `validateError` function
    notOk: { text: validateError }
  },

  // first argument for a wrapped fetch function
  'https://localhost:5005/data',

  // second argument for a wrapped fetch function
  {
    // request options: method, headers, body etc.
  }
)

expect([
  { tag: 'success', success: { some: 'data' } },
  { tag: 'failure', failure: { serverError: { message: 'Server error!', status: 500 } } },
  {
    tag: 'failure',
    failure: { mapError: new SyntaxError('Unexpected token T in JSON at position 0') }
  }
]).toContainEqual(dataResult)
```
