import { spawn } from 'child_process'
import { fetchmap } from '../src'
import 'isomorphic-fetch'
import { FetchError } from 'node-fetch'

const whatError =
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n` +
  `<title>Error</title>\n</head>\n<body>\n<pre>Cannot GET /what</pre>\n</body>\n</html>\n`

const url = (path: string) => `http://localhost:5005/${path}`
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

const controller = new AbortController()
const { signal } = controller

describe('fetchmap', () => {
  beforeAll(() => {
    spawn('node', ['./test/server.mjs'], { signal }).on('error', (e) => console.log(e))
    return sleep(1000)
  })

  afterAll(() => controller.abort())

  test('ok', async () => {
    const result = await fetchmap({}, url('text'), undefined, fetch)
    expect(result.tag).toEqual('success')

    if (result.tag === 'success') {
      expect(result.success).toBeInstanceOf(Response)
    }
  })

  test('ok, ok is text', async () => {
    const result = await fetchmap({ ok: 'text' }, url('text'), undefined, fetch)
    expect(result).toEqual<typeof result>(success('ok'))
  })

  test('ok, ok is text, curried form', async () => {
    const result = await fetchmap({ ok: 'text' }, url('text'))(fetch)
    expect(result).toEqual<typeof result>(success('ok'))
  })

  test('ok, ok is json', async () => {
    const result = await fetchmap({ ok: 'json' }, url('json'), undefined, fetch)
    expect(result).toEqual<typeof result>(success({ some: 'data' }))
  })

  test('ok, ok is function', async () => {
    const result = await fetchmap({ ok: (r: Response) => r.status }, url('json'), undefined, fetch)
    expect(result).toEqual<typeof result>(success(200))
  })

  test('ok, ok is object', async () => {
    const result = await fetchmap({ 201: 'json', ok: 'text' }, url('json-201'), undefined, fetch)
    expect(result).toEqual<typeof result>(success(['its 201']))
  })

  test('ok, ok is object, default handler', async () => {
    const result = await fetchmap({ 201: 'json', ok: 'text' }, url('text'), undefined, fetch)
    expect(result).toEqual<typeof result>(success('ok'))
  })

  test('fail, clientError', async () => {
    const result = await fetchmap({}, '1234', undefined, fetch)
    expect(result).toEqual<typeof result>(
      failure({ clientError: new TypeError('Only absolute URLs are supported') })
    )
  })

  test('fail, mapError, ok is json', async () => {
    const result = await fetchmap({ ok: 'json' }, url('text'), undefined, fetch)
    expect(result).toEqual<typeof result>(
      failure({
        mapError: new FetchError(
          'invalid json response body at http://localhost:5005/text reason: Unexpected token o in JSON at position 0',
          ''
        )
      })
    )
  })

  test('fail, mapError, ok is function', async () => {
    const ok = (_: Response) => {
      throw new Error('what?')
    }

    const result = await fetchmap({ ok }, url('text'), undefined, fetch)
    expect(result).toEqual<typeof result>(failure({ mapError: new Error('what?') }))
  })

  test('fail, serverError', async () => {
    const result = await fetchmap({}, url('not-found'), undefined, fetch)
    expect(result.tag).toEqual('failure')

    if (result.tag === 'failure') {
      expect(result.failure).toHaveProperty('serverError')

      if ('serverError' in result.failure) {
        expect(result.failure.serverError).toBeInstanceOf(Response)
      }
    }
  })

  test('fail, serverError, notOk is text', async () => {
    const result = await fetchmap({ notOk: 'text' }, url('not-found'), undefined, fetch)
    expect(result).toEqual<typeof result>(failure({ serverError: 'Not Found' }))
  })

  test('fail, serverError, notOk is json', async () => {
    const result = await fetchmap({ notOk: 'json' }, url('server-error'), undefined, fetch)
    expect(result).toEqual<typeof result>(failure({ serverError: { error: 'Server error' } }))
  })

  test('fail, mapError, notOk is json', async () => {
    const result = await fetchmap({ notOk: 'json' }, url('not-found'), undefined, fetch)
    expect(result).toEqual<typeof result>(
      failure({
        mapError: new FetchError(
          'invalid json response body at http://localhost:5005/not-found reason: Unexpected token N in JSON at position 0',
          ''
        )
      })
    )
  })

  test('fail, serverError, notOk is function', async () => {
    const notOk = (r: Response) => r.status
    const result = await fetchmap({ notOk }, url('server-error'), undefined, fetch)
    expect(result).toEqual<typeof result>(failure({ serverError: 500 }))
  })

  test('fail, serverError, notOk is text, no route', async () => {
    const result = await fetchmap({ notOk: 'text' }, url('what'), undefined, fetch)
    expect(result).toEqual<typeof result>(failure({ serverError: whatError }))
  })
})
