type OkStatus =
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 209
  | 210
  | 211
  | 212
  | 213
  | 214
  | 215
  | 216
  | 217
  | 218
  | 219
  | 220
  | 221
  | 222
  | 223
  | 224
  | 225
  | 226
  | 227
  | 228
  | 229
  | 230
  | 231
  | 232
  | 233
  | 234
  | 235
  | 236
  | 237
  | 238
  | 239
  | 240
  | 241
  | 242
  | 243
  | 244
  | 245
  | 246
  | 247
  | 248
  | 249
  | 250
  | 251
  | 252
  | 253
  | 254
  | 255
  | 256
  | 257
  | 258
  | 259
  | 260
  | 261
  | 262
  | 263
  | 264
  | 265
  | 266
  | 267
  | 268
  | 269
  | 270
  | 271
  | 272
  | 273
  | 274
  | 275
  | 276
  | 277
  | 278
  | 279
  | 280
  | 281
  | 282
  | 283
  | 284
  | 285
  | 286
  | 287
  | 288
  | 289
  | 290
  | 291
  | 292
  | 293
  | 294
  | 295
  | 296
  | 297
  | 298
  | 299

type MapResponse =
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'formData'
  | ((response: Response) => unknown)

type MultiMapResponse = {
  readonly [code: number]: MapResponse
  readonly ok: MapResponse
  readonly notOk: MapResponse
}

type MapResult = {
  readonly json: unknown
  readonly text: string
  readonly blob: Blob
  readonly arrayBuffer: ArrayBuffer
  readonly formData: FormData
}

type MapResultOf<Map extends MapResponse> = Map extends (r: Response) => infer T
  ? T
  : Map extends keyof MapResult
  ? MapResult[Map]
  : never

type OkKeys<Map extends MultiMapResponse> = (OkStatus | 'ok') & keyof Map

type NotOkKeys<Map extends MultiMapResponse, Keys = keyof Map> = Keys extends OkStatus | 'ok'
  ? never
  : Keys

type FetchSuccessResult<
  Map extends MultiMapResponse,
  SuccessKeys extends keyof Map = OkKeys<Map>
> = {
  readonly tag: 'success'
  readonly success: Map[SuccessKeys] extends MapResponse ? MapResultOf<Map[SuccessKeys]> : never
}

type FetchFailureResult<
  Map extends MultiMapResponse,
  FailureKeys extends keyof Map = NotOkKeys<Map>
> = {
  readonly tag: 'failure'
  readonly failure:
    | { readonly clientError: unknown }
    | { readonly mapError: unknown }
    | {
        readonly serverError: Map[FailureKeys] extends MapResponse
          ? MapResultOf<Map[FailureKeys]>
          : never
      }
}

type FetchResult<
  PartialMap extends Partial<MultiMapResponse>,
  Map extends MultiMapResponse = {
    readonly [Key in keyof PartialMap | 'ok' | 'notOk']: PartialMap[Key] extends MapResponse
      ? PartialMap[Key]
      : (response: Response) => Response
  }
> = FetchSuccessResult<Map> | FetchFailureResult<Map>

type CommonFetchResult = Promise<FetchResult<MultiMapResponse>>

type PrettyType<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

type FetchParams = Parameters<typeof fetch>

/**
 * Non-curried form of `fetchmap`
 *
 * @param map An object to map `response.status` to `(response: Response) => unknown` transform.
 * Keys can be numbers + `ok` and `notOk`. If no mapping for received response status specified, it
 * will use `ok` transform for statuses in the inclusive range from 200 to 299 and `notOk`
 * otherwise. Both `ok` and `notOk` just return received `Response` object by default. Each
 * transform is a string literal that represents a body reading method (`json`, `text`, `blob`,
 * `arrayBuffer`, `formData`) or a function that takes `Response` and returns something.
 *
 * @param input Standard `fetch` first argument
 *
 * @param init Standard `fetch` second argument
 *
 * @param fetcher A `fetch` function
 *
 * @returns Success or failure result.
 * - If `fetch` function itself **did throw** an error then a **failure** result containing the
 * object with `clientError` property set to thrown value will be returned.
 * - If transform function **did throw** an error then a **failure** result containing the object
 * with `mapError` property set to thrown value will be returned.
 * - If response status is **outside** inclusive range from 200 to 299 and transform function **did
 * not throw** an error then a **failure** result containing the object with `serverError` property
 * set to transformed value will be returned.
 * - If response status is **inside** inclusive range from 200 to 299 and transform function **did
 * not throw** an error then a **success** result containing the transformed value will be returned.
 */
export function fetchmap<Map extends Partial<MultiMapResponse>>(
  map: Map,
  input: FetchParams[0],
  init: FetchParams[1],
  fetcher: typeof fetch
): Promise<PrettyType<FetchResult<Map>>>

/**
 * Curried form of `fetchmap`
 *
 * @param map An object to map `response.status` to `(response: Response) => unknown` transform.
 * Keys can be numbers + `ok` and `notOk`. If no mapping for received response status specified, it
 * will use `ok` transform for statuses in the inclusive range from 200 to 299 and `notOk`
 * otherwise. Both `ok` and `notOk` just return received `Response` object by default.  Each
 * transform is a string literal that represents a body reading method (`json`, `text`, `blob`,
 * `arrayBuffer`, `formData`) or a function that takes `Response` and returns something.
 *
 * @param ... Standard `fetch` arguments
 *
 * @returns Function that takes a `fetch` function and returns a success or failure result.
 * - If `fetch` function itself **did throw** an error then a **failure** result containing the
 * object with `clientError` property set to thrown value will be returned.
 * - If transform function **did throw** an error then a **failure** result containing the object
 * with `mapError` property set to thrown value will be returned.
 * - If response status is **outside** inclusive range from 200 to 299 and transform function **did
 * not throw** an error then a **failure** result containing the object with `serverError` property
 * set to transformed value will be returned.
 * - If response status is **inside** inclusive range from 200 to 299 and transform function **did
 * not throw** an error then a **success** result containing the transformed value will be returned.
 */
export function fetchmap<Map extends Partial<MultiMapResponse>>(
  map: Map,
  ...params: FetchParams
): (fetcher: typeof fetch) => Promise<PrettyType<FetchResult<Map>>>

export function fetchmap(
  map: Partial<MultiMapResponse>,
  input: FetchParams[0],
  init: FetchParams[1],
  fetcher?: typeof fetch
): CommonFetchResult | ((f: typeof fetch) => CommonFetchResult) {
  return fetcher === undefined
    ? (fn: typeof fetch) => fetchmap(map, input, init, fn)
    : fetcher(input, init)
        .then(async (response) => {
          const { status } = response
          const isOk = status >= 200 && status <= 299

          try {
            return (isOk ? success : serverErrorFailure)(
              await mapFun(response, map[status] ?? (isOk ? map.ok : map.notOk) ?? identity)
            )
          } catch (mapError) {
            return failure({ mapError })
          }
        })
        .catch((clientError: unknown) => failure({ clientError }))
}

const serverErrorFailure = <T>(serverError: T) => failure({ serverError })

const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

const mapFun = (response: Response, map: MapResponse) =>
  typeof map === 'string' ? response[map]() : map(response)

const identity = <T>(x: T) => x
