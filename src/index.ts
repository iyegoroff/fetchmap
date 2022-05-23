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
type SuccessResult<Success> = {
  readonly tag: 'success'
  readonly success: Success
}

type FailureResult<Failure> = {
  readonly tag: 'failure'
  readonly failure: Failure
}

type SuccessOf<ResultLike> = ResultLike extends SuccessResult<infer S> ? S : never
type FailureOf<ResultLike> = ResultLike extends FailureResult<infer F> ? F : never

type Result<Success = unknown, Failure = unknown> = SuccessResult<Success> | FailureResult<Failure>

type MapTextResponse<Resp extends BasicResponse> = {
  readonly text: (text: string, response: Resp) => Result
}

type MapJsonResponse<Resp extends BasicResponse> = {
  readonly json: (json: unknown, response: Resp) => Result
}

type MapBlobResponse<Resp extends BasicResponse> = {
  readonly blob: (blob: Blob, response: Resp) => Result
}

type MapArrayBufferResponse<Resp extends BasicResponse> = {
  readonly arrayBuffer: (arrayBuffer: ArrayBuffer, response: Resp) => Result
}

type MapFormDataResponse<Resp extends BasicResponse> = {
  readonly formData: (formData: FormData, response: Resp) => Result
}

type MapNoBodyResponse<Resp extends BasicResponse> = {
  readonly noBody: (response: Resp) => Result
}

type MapResponse<Resp extends BasicResponse> =
  | MapTextResponse<Resp>
  | MapJsonResponse<Resp>
  | MapBlobResponse<Resp>
  | MapArrayBufferResponse<Resp>
  | MapFormDataResponse<Resp>
  | MapNoBodyResponse<Resp>

type MultiMapResponse<Resp extends BasicResponse> = {
  readonly [code: number]: MapResponse<Resp>
  readonly ok: MapResponse<Resp>
  readonly notOk: MapResponse<Resp>
}

type MapResultOf<Resp extends BasicResponse, Map extends MapResponse<Resp>> = Map extends {
  readonly noBody: (r: Resp) => infer T
}
  ? ('json' | 'blob' | 'arrayBuffer' | 'formData' | 'text') & keyof Map extends never
    ? T
    : never
  : Map extends { readonly text: (b: string, r: Resp) => infer T }
  ? ('json' | 'blob' | 'arrayBuffer' | 'formData' | 'noBody') & keyof Map extends never
    ? T
    : never
  : Map extends { readonly json: (b: unknown, r: Resp) => infer T }
  ? ('text' | 'blob' | 'arrayBuffer' | 'formData' | 'noBody') & keyof Map extends never
    ? T
    : never
  : Map extends { readonly blob: (b: Blob, r: Resp) => infer T }
  ? ('json' | 'text' | 'arrayBuffer' | 'formData' | 'noBody') & keyof Map extends never
    ? T
    : never
  : Map extends { readonly arrayBuffer: (b: ArrayBuffer, r: Resp) => infer T }
  ? ('json' | 'blob' | 'text' | 'formData' | 'noBody') & keyof Map extends never
    ? T
    : never
  : Map extends { readonly formData: (b: FormData, r: Resp) => infer T }
  ? ('json' | 'blob' | 'arrayBuffer' | 'text' | 'noBody') & keyof Map extends never
    ? T
    : never
  : never

type OkKeys<Resp extends BasicResponse, Map extends MultiMapResponse<Resp>> = (OkStatus | 'ok') &
  keyof Map

type NotOkKeys<
  Resp extends BasicResponse,
  Map extends MultiMapResponse<Resp>,
  Keys = keyof Map
> = Keys extends OkStatus | 'ok' ? never : Keys

type FetchFailureResult<
  Resp extends BasicResponse,
  Map extends MultiMapResponse<Resp>,
  FailureKeys extends keyof Map = NotOkKeys<Resp, Map>,
  SuccessKeys extends keyof Map = OkKeys<Resp, Map>
> = FailureResult<
  | (Map[keyof Map] extends MapResponse<Resp>
      ? FailureOf<MapResultOf<Resp, Map[keyof Map]>> extends never
        ? never
        : {
            readonly status: number
            readonly validationError: FailureOf<
              | (Map[SuccessKeys] extends MapJsonResponse<Resp>
                  ? ReturnType<Map[SuccessKeys]['json']>
                  : Map[SuccessKeys] extends MapBlobResponse<Resp>
                  ? ReturnType<Map[SuccessKeys]['blob']>
                  : Map[SuccessKeys] extends MapTextResponse<Resp>
                  ? ReturnType<Map[SuccessKeys]['text']>
                  : Map[SuccessKeys] extends MapFormDataResponse<Resp>
                  ? ReturnType<Map[SuccessKeys]['formData']>
                  : Map[SuccessKeys] extends MapArrayBufferResponse<Resp>
                  ? ReturnType<Map[SuccessKeys]['arrayBuffer']>
                  : Map[SuccessKeys] extends MapNoBodyResponse<Resp>
                  ? ReturnType<Map[SuccessKeys]['noBody']>
                  : Map[SuccessKeys] extends MapResponse<Resp>
                  ? MapResultOf<Resp, Map[SuccessKeys]>
                  : never)
              | (Map[FailureKeys] extends MapJsonResponse<Resp>
                  ? ReturnType<Map[FailureKeys]['json']>
                  : Map[FailureKeys] extends MapBlobResponse<Resp>
                  ? ReturnType<Map[FailureKeys]['blob']>
                  : Map[FailureKeys] extends MapTextResponse<Resp>
                  ? ReturnType<Map[FailureKeys]['text']>
                  : Map[FailureKeys] extends MapFormDataResponse<Resp>
                  ? ReturnType<Map[FailureKeys]['formData']>
                  : Map[FailureKeys] extends MapArrayBufferResponse<Resp>
                  ? ReturnType<Map[FailureKeys]['arrayBuffer']>
                  : Map[FailureKeys] extends MapNoBodyResponse<Resp>
                  ? ReturnType<Map[FailureKeys]['noBody']>
                  : Map[FailureKeys] extends MapResponse<Resp>
                  ? MapResultOf<Resp, Map[FailureKeys]>
                  : never)
            >
          }
      : never)
  | {
      readonly serverError: SuccessOf<
        Map[FailureKeys] extends MapJsonResponse<Resp>
          ? ReturnType<Map[FailureKeys]['json']>
          : Map[FailureKeys] extends MapBlobResponse<Resp>
          ? ReturnType<Map[FailureKeys]['blob']>
          : Map[FailureKeys] extends MapTextResponse<Resp>
          ? ReturnType<Map[FailureKeys]['text']>
          : Map[FailureKeys] extends MapFormDataResponse<Resp>
          ? ReturnType<Map[FailureKeys]['formData']>
          : Map[FailureKeys] extends MapArrayBufferResponse<Resp>
          ? ReturnType<Map[FailureKeys]['arrayBuffer']>
          : Map[FailureKeys] extends MapNoBodyResponse<Resp>
          ? ReturnType<Map[FailureKeys]['noBody']>
          : Map[FailureKeys] extends MapResponse<Resp>
          ? MapResultOf<Resp, Map[FailureKeys]>
          : never
      >
    }
  | { readonly clientError: unknown }
  | { readonly mapError: unknown }
>

type FetchSuccessResult<
  Resp extends BasicResponse,
  Map extends MultiMapResponse<Resp>,
  SuccessKeys extends keyof Map = OkKeys<Resp, Map>
> = SuccessResult<
  SuccessOf<
    Map[SuccessKeys] extends MapJsonResponse<Resp>
      ? ReturnType<Map[SuccessKeys]['json']>
      : Map[SuccessKeys] extends MapBlobResponse<Resp>
      ? ReturnType<Map[SuccessKeys]['blob']>
      : Map[SuccessKeys] extends MapTextResponse<Resp>
      ? ReturnType<Map[SuccessKeys]['text']>
      : Map[SuccessKeys] extends MapFormDataResponse<Resp>
      ? ReturnType<Map[SuccessKeys]['formData']>
      : Map[SuccessKeys] extends MapArrayBufferResponse<Resp>
      ? ReturnType<Map[SuccessKeys]['arrayBuffer']>
      : Map[SuccessKeys] extends MapNoBodyResponse<Resp>
      ? ReturnType<Map[SuccessKeys]['noBody']>
      : Map[SuccessKeys] extends MapResponse<Resp>
      ? MapResultOf<Resp, Map[SuccessKeys]>
      : never
  >
>

type FetchResult<
  Resp extends BasicResponse,
  PartialMap extends Partial<MultiMapResponse<Resp>>,
  Map extends MultiMapResponse<Resp> = {
    readonly [Key in keyof PartialMap | 'ok' | 'notOk']: PartialMap[Key] extends MapResponse<Resp>
      ? PartialMap[Key]
      : { readonly noBody: (response: Resp) => SuccessResult<Resp> }
  }
> = FetchSuccessResult<Resp, Map> | FetchFailureResult<Resp, Map>

type PrettyType<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

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

  const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
  const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

  const serverErrorFailure = <T>(serverError: T) => failure({ serverError })
  const validationErrorFailure = <T>(validationError: T, status: number) =>
    failure({ validationError, status })

  const mapFun = async <Resp extends BasicResponse>(response: Resp, map: MapResponse<Resp>) =>
    'noBody' in map
      ? map.noBody(response)
      : 'json' in map
      ? map.json(await response.json(), response)
      : 'text' in map
      ? map.text(await response.text(), response)
      : 'blob' in map
      ? map.blob(await response.blob(), response)
      : 'arrayBuffer' in map
      ? map.arrayBuffer(await response.arrayBuffer(), response)
      : map.formData(await response.formData(), response)

  /**
   * Non-throwing `fetch` wrapper
   *
   * @param map An object to map `response.status` to validating transform. Keys can be response
   * status numbers + `ok` and `notOk`. If no mapping for received response status specified, it
   * will use `ok` transform for statuses in the inclusive range from 200 to 299 and `notOk`
   * otherwise. Both `ok` and `notOk` just return `SuccessResult` with received `Response` object by
   * default. Each transform is a `(response: Response) => Result<Success, Failure>` function or an
   * object that represents a mapping from body reading method (`json`, `text`, `blob`,
   * `arrayBuffer`, `formData`) to `(body: BodyType, response: Response) => Result<Success, Failure>`
   * validating transform.
   *
   * @param input `fetch` function first argument
   *
   * @param init `fetch` function second argument
   *
   * @returns Success or failure result.
   * - If `fetch` function itself **did throw** an error then a **failure** result containing an
   * object with `clientError` property set to thrown value will be returned.
   * - If validating transform **did throw** an error then a **failure** result containing an object
   * with `mapError` property set to thrown value will be returned.
   * - If validating transform **did not throw** an error but **fail to validate** the received data
   * then a **failure** result containing an object with `validationError` property set to
   * validation error will be returned.
   * - If response status is **outside** inclusive range from 200 to 299 and transform function **did
   * not throw** an error and **succeed to validate** the received data then a **failure** result
   * containing an object with `serverError` property set to transformed value will be returned.
   * - If response status is **inside** inclusive range from 200 to 299 and transform function **did
   * not throw** an error and **succeed to validate** the received data then a **success** result
   * containing the transformed value will be returned.
   */
  function fetchmap<
    Response extends Awaited<ReturnType<Fetch>>,
    Map extends Partial<MultiMapResponse<Response>>
  >(map: Map, input: Input, init?: Init): Promise<PrettyType<FetchResult<Response, Map>>>

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
          const validated = await mapFun(
            response,
            map[status] ?? (isOk ? map.ok : map.notOk) ?? { noBody: success }
          )

          return validated.tag === 'success'
            ? (isOk ? success : serverErrorFailure)(validated.success)
            : validationErrorFailure(validated.failure, status)
        } catch (mapError) {
          return failure({ mapError })
        }
      })
      .catch((clientError: unknown) => failure({ clientError }))
  }

  return fetchmap
}
