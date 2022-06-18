import { spawn } from 'child_process'
import { isRecord } from 'ts-is-record'
import { createFetchmap } from '../src'
import nodeFetch, { Response, FetchError, Blob, FormData, AbortError } from 'node-fetch'

const fetchmap = createFetchmap(nodeFetch)

const whatError =
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n` +
  `<title>Error</title>\n</head>\n<body>\n<pre>Cannot GET /what</pre>\n</body>\n</html>\n`

const probablyInvalidURL = '0b92e3d0-9e25-4619-a7a0-b76ecdaa4252.com'
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
    const result = await fetchmap({}, url('text'))
    expect(result.tag).toEqual('success')

    if (result.tag === 'success') {
      expect(result.success).toBeInstanceOf(Response)
    }
  })

  test('ok, ok is text', async () => {
    const result = await fetchmap({ ok: { text: (x) => success(x) } }, url('text'))
    expect(result).toEqual<typeof result>(success('ok'))
  })

  test('ok, ok is arrayBuffer', async () => {
    const buf = new ArrayBuffer(2)
    const view = new Uint8Array(buf)
    view[0] = 'ok'.charCodeAt(0)
    view[1] = 'ok'.charCodeAt(1)

    const result = await fetchmap({ ok: { arrayBuffer: (x) => success(x) } }, url('text'))
    expect(result).toStrictEqual<typeof result>(success(buf))
  })

  test('ok, ok is blob', async () => {
    const result = await fetchmap({ ok: { blob: (x) => success(x) } }, url('text'))
    expect(result).toStrictEqual<typeof result>(success(new Blob()))
  })

  test('ok, ok is formData', async () => {
    const form = new FormData()
    form.append('x', 'x')
    form.append('y', 'y')

    const result = await fetchmap({ ok: { formData: (x) => success(x) } }, url('form'))
    expect(result).toStrictEqual(success(form))
  })

  test('ok, ok is json', async () => {
    const result = await fetchmap({ ok: { json: (x) => success(x) } }, url('json'))
    expect(result).toEqual<typeof result>(success({ some: 'data' }))
  })

  test('ok, ok is function', async () => {
    const result = await fetchmap({ ok: { noBody: (r) => success(r.status) } }, url('json'))
    expect(result).toEqual<typeof result>(success(200))
  })

  test('ok, specific ok handler', async () => {
    const result = await fetchmap({ 201: { json: (x) => success(x) } }, url('json-201'))
    expect(result).toEqual<typeof result>(success(['its 201']))
  })

  test('ok, multiple ok handlers', async () => {
    const result = await fetchmap(
      { 201: { json: (x) => success(x) }, ok: { text: (x) => success(x) } },
      url('text')
    )
    expect(result).toEqual<typeof result>(success('ok'))
  })

  test('fail, clientError, invalid url', async () => {
    const result = await fetchmap({}, '1234')
    const clientError: TypeError & { code?: string; input?: string } = new TypeError('')
    clientError.code = 'ERR_INVALID_URL'
    clientError.input = '1234'
    expect(result).toEqual<typeof result>(failure({ clientError }))
  })

  test('fail, clientError, url not exist', async () => {
    const addr = `https://${probablyInvalidURL}/`
    const clientError = new FetchError(
      `request to ${addr} failed, reason: getaddrinfo ENOTFOUND ${probablyInvalidURL}`,
      ''
    )

    const result = await fetchmap({}, addr)
    expect(result).toEqual<typeof result>(failure({ clientError }))
  })

  test('fail, mapError, ok is json', async () => {
    const result = await fetchmap({ ok: { json: (x) => success(x) } }, url('text'))
    expect(result).toEqual<typeof result>(
      failure({ mapError: new SyntaxError('Unexpected token o in JSON at position 0') })
    )
  })

  test('fail, mapError, ok is function', async () => {
    const noBody = () => {
      throw new Error('what?')
    }

    const result = await fetchmap({ ok: { noBody } }, url('text'))
    expect(result).toEqual<typeof result>(failure({ mapError: new Error('what?') }))
  })

  test('fail, serverError', async () => {
    const result = await fetchmap({}, url('not-found'))
    expect(result.tag).toEqual('failure')

    if (result.tag === 'failure') {
      expect(result.failure).toHaveProperty('serverError')

      if ('serverError' in result.failure) {
        expect(result.failure.serverError).toBeInstanceOf(Response)
      }
    }
  })

  test('fail, serverError, notOk is text', async () => {
    const result = await fetchmap({ notOk: { text: (x) => success(x) } }, url('not-found'))
    expect(result).toEqual<typeof result>(failure({ serverError: 'Not Found' }))
  })

  test('fail, serverError, notOk is json', async () => {
    const result = await fetchmap({ notOk: { json: (x) => success(x) } }, url('server-error'))
    expect(result).toEqual<typeof result>(failure({ serverError: { error: 'Server error' } }))
  })

  test('fail, mapError, notOk is json', async () => {
    const result = await fetchmap({ notOk: { json: (x) => success(x) } }, url('not-found'))
    expect(result).toEqual<typeof result>(
      failure({ mapError: new SyntaxError('Unexpected token N in JSON at position 0') })
    )
  })

  test('fail, serverError, notOk is function', async () => {
    const result = await fetchmap(
      { notOk: { noBody: (r) => success(r.status) } },
      url('server-error')
    )
    expect(result).toEqual<typeof result>(failure({ serverError: 500 }))
  })

  test('fail, serverError, notOk is text, no route', async () => {
    const result = await fetchmap({ notOk: { text: (x) => success(x) } }, url('what'))
    expect(result).toEqual<typeof result>(failure({ serverError: whatError }))
  })

  test('fail, validationError, ok is json', async () => {
    const result = await fetchmap({ ok: { json: () => failure('fail') } }, url('json'))
    expect(result).toEqual<typeof result>(failure({ validationError: 'fail' }))
  })

  test('fail, clientError, abort signal', async () => {
    const ctrlr = new AbortController()

    setTimeout(() => ctrlr.abort(), 250)

    const result = await fetchmap({ ok: { noBody: (r) => success(r.status) } }, url('slow'), {
      signal: ctrlr.signal
    })

    expect(result).toEqual<typeof result>(
      failure({ clientError: new AbortError('The operation was aborted.') })
    )
  })

  test('readme example', async () => {
    const validateData = (body: unknown) =>
      isRecord(body) && 'some' in body && typeof body.some === 'string'
        ? success(body)
        : failure('data validation failed' as const)

    const validateError = (body: string, { status }: Response) => success({ message: body, status })

    const dataResult = await fetchmap(
      {
        ok: { json: validateData },
        notOk: { text: validateError },
        404: { noBody: (response) => success(response.statusText) }
      },
      url('data')
    )

    expect([
      { tag: 'success', success: { some: 'data' } },
      { tag: 'failure', failure: { serverError: { message: 'Server error!', status: 500 } } },
      {
        tag: 'failure',
        failure: { mapError: new SyntaxError('Unexpected token T in JSON at position 0') }
      }
    ]).toContainEqual(dataResult)
  })
})
