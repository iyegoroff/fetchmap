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
    const result = await fetchmap({ url: url('text') })
    expect(result.tag).toEqual('success')

    if (result.tag === 'success') {
      expect(result.success).toBeInstanceOf(Response)
    }
  })

  test('ok, mapSuccess text', async () => {
    const result = await fetchmap({ url: url('text'), mapSuccess: 'text' })
    expect(result).toEqual<typeof result>(success('ok'))
  })

  test('ok, mapSuccess json', async () => {
    const result = await fetchmap({ url: url('json'), mapSuccess: 'json' })
    expect(result).toEqual<typeof result>(success({ some: 'data' }))
  })

  test('ok, mapSuccess function', async () => {
    const result = await fetchmap({ url: url('json'), mapSuccess: (r: Response) => r.status })
    expect(result).toEqual<typeof result>(success(200))
  })

  test('ok, mapSuccess object', async () => {
    const result = await fetchmap({
      url: url('json-201'),
      mapSuccess: { 201: 'json', default: 'text' }
    })
    expect(result).toEqual<typeof result>(success(['its 201']))
  })

  test('ok, mapSuccess object, default handler', async () => {
    const result = await fetchmap({
      url: url('text'),
      mapSuccess: { 201: 'json', default: 'text' }
    })
    expect(result).toEqual<typeof result>(success('ok'))
  })

  test('fail, clientError', async () => {
    const result = await fetchmap({ url: '1234' })
    expect(result).toEqual<typeof result>(
      failure({ clientError: new TypeError('Only absolute URLs are supported') })
    )
  })

  test('fail, mapError, mapSuccess json', async () => {
    const result = await fetchmap({ url: url('text'), mapSuccess: 'json' })
    expect(result).toEqual<typeof result>(
      failure({
        mapError: new FetchError(
          'invalid json response body at http://localhost:5005/text reason: Unexpected token o in JSON at position 0',
          ''
        )
      })
    )
  })

  test('fail, mapError, mapSuccess function', async () => {
    const result = await fetchmap({
      url: url('text'),
      mapSuccess: (_: Response) => {
        throw new Error('what?')
      }
    })
    expect(result).toEqual<typeof result>(failure({ mapError: new Error('what?') }))
  })

  test('fail, serverError', async () => {
    const result = await fetchmap({ url: url('not-found') })
    expect(result.tag).toEqual('failure')

    if (result.tag === 'failure') {
      expect(result.failure).toHaveProperty('serverError')

      if ('serverError' in result.failure) {
        expect(result.failure.serverError).toBeInstanceOf(Response)
      }
    }
  })

  test('fail, serverError, mapFailure text', async () => {
    const result = await fetchmap({ url: url('not-found'), mapFailure: 'text' })
    expect(result).toEqual<typeof result>(failure({ serverError: 'Not Found' }))
  })

  test('fail, serverError, mapFailure json', async () => {
    const result = await fetchmap({ url: url('server-error'), mapFailure: 'json' })
    expect(result).toEqual<typeof result>(failure({ serverError: { error: 'Server error' } }))
  })

  test('fail, mapError, mapFailure json', async () => {
    const result = await fetchmap({ url: url('not-found'), mapFailure: 'json' })
    expect(result).toEqual<typeof result>(
      failure({
        mapError: new FetchError(
          'invalid json response body at http://localhost:5005/not-found reason: Unexpected token N in JSON at position 0',
          ''
        )
      })
    )
  })

  test('fail, serverError, mapFailure function', async () => {
    const result = await fetchmap({
      url: url('server-error'),
      mapFailure: (r: Response) => r.status
    })
    expect(result).toEqual<typeof result>(failure({ serverError: 500 }))
  })

  test('fail, serverError, mapFailure text, no route', async () => {
    const result = await fetchmap({ url: url('what'), mapFailure: 'text' })
    expect(result).toEqual<typeof result>(failure({ serverError: whatError }))
  })
})
