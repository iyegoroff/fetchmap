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

// source: https://github.com/microsoft/TypeScript/issues/38646#issuecomment-1054510795
type NonUndefined<T> = T extends unknown
  ? { readonly [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined> }
  : never

type MapTextResponse<Resp extends BasicResponse> = {
  readonly text: (body: string, response: Resp) => Result
  readonly json?: undefined
  readonly blob?: undefined
  readonly arrayBuffer?: undefined
  readonly formData?: undefined
  readonly noBody?: undefined
}

type MapJsonResponse<Resp extends BasicResponse> = {
  readonly json: (body: unknown, response: Resp) => Result
  readonly text?: undefined
  readonly blob?: undefined
  readonly arrayBuffer?: undefined
  readonly formData?: undefined
  readonly noBody?: undefined
}

type MapBlobResponse<Resp extends BasicResponse> = {
  readonly blob: (body: Blob, response: Resp) => Result
  readonly json?: undefined
  readonly text?: undefined
  readonly arrayBuffer?: undefined
  readonly formData?: undefined
  readonly noBody?: undefined
}

type MapArrayBufferResponse<Resp extends BasicResponse> = {
  readonly arrayBuffer: (body: ArrayBuffer, response: Resp) => Result
  readonly json?: undefined
  readonly blob?: undefined
  readonly text?: undefined
  readonly formData?: undefined
  readonly noBody?: undefined
}

type MapFormDataResponse<Resp extends BasicResponse> = {
  readonly formData: (body: FormData, response: Resp) => Result
  readonly json?: undefined
  readonly blob?: undefined
  readonly arrayBuffer?: undefined
  readonly text?: undefined
  readonly noBody?: undefined
}

type MapNoBodyResponse<Resp extends BasicResponse> = {
  readonly noBody: (response: Resp) => Result
  readonly json?: undefined
  readonly blob?: undefined
  readonly arrayBuffer?: undefined
  readonly formData?: undefined
  readonly text?: undefined
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

type InternalMultiMapResponse<Resp extends BasicResponse> = {
  readonly [code: number]: NonUndefined<MapResponse<Resp>>
  readonly ok: NonUndefined<MapResponse<Resp>>
  readonly notOk: NonUndefined<MapResponse<Resp>>
}

type MapResultOf<
  Resp extends BasicResponse,
  Map extends NonUndefined<MapResponse<Resp>>
> = Map extends {
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
  RawMap extends Partial<MultiMapResponse<Resp>>,
  Map extends MultiMapResponse<Resp>,
  FailureKeys extends keyof Map = NotOkKeys<Resp, Map>,
  SuccessKeys extends keyof Map = OkKeys<Resp, Map>
> = FailureResult<
  | (Map[keyof Map] extends NonUndefined<MapResponse<Resp>>
      ? FailureOf<MapResultOf<Resp, Map[keyof Map]>> extends never
        ? never
        : {
            readonly validationError: FailureOf<
              | (Map[SuccessKeys] extends NonUndefined<MapJsonResponse<Resp>>
                  ? ReturnType<Map[SuccessKeys]['json']>
                  : Map[SuccessKeys] extends NonUndefined<MapBlobResponse<Resp>>
                  ? ReturnType<Map[SuccessKeys]['blob']>
                  : Map[SuccessKeys] extends NonUndefined<MapTextResponse<Resp>>
                  ? ReturnType<Map[SuccessKeys]['text']>
                  : Map[SuccessKeys] extends NonUndefined<MapFormDataResponse<Resp>>
                  ? ReturnType<Map[SuccessKeys]['formData']>
                  : Map[SuccessKeys] extends NonUndefined<MapArrayBufferResponse<Resp>>
                  ? ReturnType<Map[SuccessKeys]['arrayBuffer']>
                  : Map[SuccessKeys] extends NonUndefined<MapNoBodyResponse<Resp>>
                  ? ReturnType<Map[SuccessKeys]['noBody']>
                  : Map[SuccessKeys] extends NonUndefined<MapResponse<Resp>>
                  ? MapResultOf<Resp, Map[SuccessKeys]>
                  : never)
              | (Map[FailureKeys] extends NonUndefined<MapJsonResponse<Resp>>
                  ? ReturnType<Map[FailureKeys]['json']>
                  : Map[FailureKeys] extends NonUndefined<MapBlobResponse<Resp>>
                  ? ReturnType<Map[FailureKeys]['blob']>
                  : Map[FailureKeys] extends NonUndefined<MapTextResponse<Resp>>
                  ? ReturnType<Map[FailureKeys]['text']>
                  : Map[FailureKeys] extends NonUndefined<MapFormDataResponse<Resp>>
                  ? ReturnType<Map[FailureKeys]['formData']>
                  : Map[FailureKeys] extends NonUndefined<MapArrayBufferResponse<Resp>>
                  ? ReturnType<Map[FailureKeys]['arrayBuffer']>
                  : Map[FailureKeys] extends NonUndefined<MapNoBodyResponse<Resp>>
                  ? ReturnType<Map[FailureKeys]['noBody']>
                  : Map[FailureKeys] extends NonUndefined<MapResponse<Resp>>
                  ? MapResultOf<Resp, Map[FailureKeys]>
                  : never)
            >
          }
      : never)
  | {
      readonly serverError: SuccessOf<
        Map[FailureKeys] extends NonUndefined<MapJsonResponse<Resp>>
          ? ReturnType<Map[FailureKeys]['json']>
          : Map[FailureKeys] extends NonUndefined<MapBlobResponse<Resp>>
          ? ReturnType<Map[FailureKeys]['blob']>
          : Map[FailureKeys] extends NonUndefined<MapTextResponse<Resp>>
          ? ReturnType<Map[FailureKeys]['text']>
          : Map[FailureKeys] extends NonUndefined<MapFormDataResponse<Resp>>
          ? ReturnType<Map[FailureKeys]['formData']>
          : Map[FailureKeys] extends NonUndefined<MapArrayBufferResponse<Resp>>
          ? ReturnType<Map[FailureKeys]['arrayBuffer']>
          : Map[FailureKeys] extends NonUndefined<MapNoBodyResponse<Resp>>
          ? ReturnType<Map[FailureKeys]['noBody']>
          : Map[FailureKeys] extends NonUndefined<MapResponse<Resp>>
          ? MapResultOf<Resp, Map[FailureKeys]>
          : never
      >
    }
  | { readonly clientError: unknown }
  | (RawMap extends Record<string, never> ? never : { readonly mapError: unknown })
>

type FetchSuccessResult<
  Resp extends BasicResponse,
  Map extends MultiMapResponse<Resp>,
  SuccessKeys extends keyof Map = OkKeys<Resp, Map>
> = SuccessResult<
  SuccessOf<
    Map[SuccessKeys] extends NonUndefined<MapJsonResponse<Resp>>
      ? ReturnType<Map[SuccessKeys]['json']>
      : Map[SuccessKeys] extends NonUndefined<MapBlobResponse<Resp>>
      ? ReturnType<Map[SuccessKeys]['blob']>
      : Map[SuccessKeys] extends NonUndefined<MapTextResponse<Resp>>
      ? ReturnType<Map[SuccessKeys]['text']>
      : Map[SuccessKeys] extends NonUndefined<MapFormDataResponse<Resp>>
      ? ReturnType<Map[SuccessKeys]['formData']>
      : Map[SuccessKeys] extends NonUndefined<MapArrayBufferResponse<Resp>>
      ? ReturnType<Map[SuccessKeys]['arrayBuffer']>
      : Map[SuccessKeys] extends NonUndefined<MapNoBodyResponse<Resp>>
      ? ReturnType<Map[SuccessKeys]['noBody']>
      : Map[SuccessKeys] extends NonUndefined<MapResponse<Resp>>
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
> = FetchSuccessResult<Resp, Map> | FetchFailureResult<Resp, PartialMap, Map>

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
  const validationErrorFailure = <T>(validationError: T) => failure({ validationError })

  const mapFun = async <Resp extends BasicResponse>(
    response: Resp,
    map: MapResponse<Resp> = { noBody: success }
  ) =>
    map.noBody !== undefined
      ? map.noBody(response)
      : map.json !== undefined
      ? map.json(await response.json(), response)
      : map.text !== undefined
      ? map.text(await response.text(), response)
      : map.blob !== undefined
      ? map.blob(await response.blob(), response)
      : map.arrayBuffer !== undefined
      ? map.arrayBuffer(await response.arrayBuffer(), response)
      : map.formData(await response.formData(), response)

  /**
   * Non-throwing `fetch` wrapper
   *
   * @param map An object to map `response.status` to validating transform. Keys can be response
   * status numbers + `ok` and `notOk`. If no mapping for received response status specified, it
   * will use `ok` transform for statuses in the inclusive range from 200 to 299 and `notOk`
   * otherwise. Both `ok` and `notOk` just return `SuccessResult` with received `Response` object by
   * default. Each transform is an object that represents a mapping from body reading method
   * (`json`, `text`, `blob`, `arrayBuffer`, `formData`) to
   * `(body: BodyType, response: Response) => Result<Success, Failure>` validating transform or an
   * object without body mapping - `{ noBody: (response: Response) => Result<Success, Failure> }`
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
  async function fetchmap<
    Response extends Awaited<ReturnType<Fetch>>,
    Map extends Partial<MultiMapResponse<Response>>
  >(map: Map, input: Input, init?: Init): Promise<PrettyType<FetchResult<Response, Map>>>

  async function fetchmap(
    map: Partial<InternalMultiMapResponse<BasicResponse>>,
    input: Input,
    init?: Init
  ): Promise<FetchResult<BasicResponse, InternalMultiMapResponse<BasicResponse>>> {
    try {
      const response = await fetch(input, init)
      const { status } = response
      const isOk = status >= 200 && status <= 299

      try {
        const validated = await mapFun(
          response,
          map[status] === undefined ? (isOk ? map.ok : map.notOk) : map[status]
        )

        return validated.tag === 'success'
          ? (isOk ? success : serverErrorFailure)(validated.success)
          : validationErrorFailure(validated.failure)
      } catch (mapError) {
        return failure({ mapError })
      }
    } catch (clientError) {
      return failure({ clientError })
    }
  }

  return fetchmap
}

const s = {}
type X<T> = T extends Record<string, never> ? 1 : 2

type S = X<{ x: 1 }>
