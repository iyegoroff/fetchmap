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

type BasicResponse = {
  readonly status: number
  readonly arrayBuffer: () => Promise<ArrayBuffer>
  readonly blob: () => Promise<Blob>
  readonly formData: () => Promise<FormData>
  readonly json: () => Promise<unknown>
  readonly text: () => Promise<string>
}

/**
 * Creates a `fetchmap` from third-party `fetch` function.
 *
 * @param fetch A `fetch`-like function. Should take two parameters and return a `Promise<BasicResponse>`.
 * `BasicResponse` requires only `status`, `arrayBuffer`, `blob`, `formData`, `json` and `text`
 * properties of standard `Response` type to be defined.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function createFetchmap<Fetch extends (input: any, init?: any) => Promise<BasicResponse>>(
  fetch: Fetch
) {
  type Input = Parameters<Fetch>[0]
  type Init = Parameters<Fetch>[1]

  type MapResponse<Resp extends BasicResponse> =
    | 'json'
    | 'text'
    | 'blob'
    | 'arrayBuffer'
    | 'formData'
    | ((response: Resp) => unknown)

  type MultiMapResponse<Resp extends BasicResponse> = {
    readonly [code: number]: MapResponse<Resp>
    readonly ok: MapResponse<Resp>
    readonly notOk: MapResponse<Resp>
  }

  type MapResult = {
    readonly json: unknown
    readonly text: string
    readonly blob: Blob
    readonly arrayBuffer: ArrayBuffer
    readonly formData: FormData
  }

  type MapResultOf<Resp extends BasicResponse, Map extends MapResponse<Resp>> = Map extends (
    r: Resp
  ) => infer T
    ? T
    : Map extends keyof MapResult
    ? MapResult[Map]
    : never

  type OkKeys<Resp extends BasicResponse, Map extends MultiMapResponse<Resp>> = (OkStatus | 'ok') &
    keyof Map

  type NotOkKeys<
    Resp extends BasicResponse,
    Map extends MultiMapResponse<Resp>,
    Keys = keyof Map
  > = Keys extends OkStatus | 'ok' ? never : Keys

  type FetchSuccessResult<
    Resp extends BasicResponse,
    Map extends MultiMapResponse<Resp>,
    SuccessKeys extends keyof Map = OkKeys<Resp, Map>
  > = {
    readonly tag: 'success'
    readonly success: Map[SuccessKeys] extends MapResponse<Resp>
      ? MapResultOf<Resp, Map[SuccessKeys]>
      : never
  }

  type FetchFailureResult<
    Resp extends BasicResponse,
    Map extends MultiMapResponse<Resp>,
    FailureKeys extends keyof Map = NotOkKeys<Resp, Map>
  > = {
    readonly tag: 'failure'
    readonly failure:
      | { readonly clientError: unknown }
      | { readonly mapError: unknown }
      | {
          readonly serverError: Map[FailureKeys] extends MapResponse<Resp>
            ? MapResultOf<Resp, Map[FailureKeys]>
            : never
        }
  }

  type FetchResult<
    Resp extends BasicResponse,
    PartialMap extends Partial<MultiMapResponse<Resp>>,
    Map extends MultiMapResponse<Resp> = {
      readonly [Key in keyof PartialMap | 'ok' | 'notOk']: PartialMap[Key] extends MapResponse<Resp>
        ? PartialMap[Key]
        : (response: Resp) => Resp
    }
  > = FetchSuccessResult<Resp, Map> | FetchFailureResult<Resp, Map>

  type PrettyType<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

  const serverErrorFailure = <T>(serverError: T) => failure({ serverError })

  const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
  const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

  const mapFun = <Resp extends BasicResponse>(response: Resp, map: MapResponse<Resp>) =>
    typeof map === 'string' ? response[map]() : map(response)

  const identity = <T>(x: T) => x

  /**
   * Non-throwing `fetch` wrapper
   *
   * @param map An object to map `response.status` to `<T>(response: Response) => T` transform.
   * Keys can be numbers + `ok` and `notOk`. If no mapping for received response status specified, it
   * will use `ok` transform for statuses in the inclusive range from 200 to 299 and `notOk`
   * otherwise. Both `ok` and `notOk` just return received `Response` object by default. Each
   * transform is a string literal that represents a body reading method (`json`, `text`, `blob`,
   * `arrayBuffer`, `formData`) or a function that takes `Response` and returns something.
   *
   * @param input `fetch` function first argument
   *
   * @param init `fetch` function second argument
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
  function fetchmap<Map extends Partial<MultiMapResponse<Awaited<ReturnType<Fetch>>>>>(
    map: Map,
    input: Input,
    init?: Init
  ): Promise<PrettyType<FetchResult<Awaited<ReturnType<Fetch>>, Map>>>

  function fetchmap(
    map: Partial<MultiMapResponse<BasicResponse>>,
    input: Input,
    init?: Init
  ): Promise<FetchResult<BasicResponse, MultiMapResponse<BasicResponse>>> {
    return fetch(input, init)
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

  return fetchmap
}
