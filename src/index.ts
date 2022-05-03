type MapResponse =
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'formData'
  | ((response: Response) => unknown)

type MultiMapResponse =
  | MapResponse
  | {
      readonly [code: number]: MapResponse
      readonly default: MapResponse
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

type MultiMapResultOf<Map extends MultiMapResponse> = Map extends MapResponse
  ? MapResultOf<Map>
  : Map[keyof Map] extends MapResponse
  ? MapResultOf<Map[keyof Map]>
  : never

type FetchSuccessResult<Map extends MultiMapResponse | undefined> = {
  readonly tag: 'success'
  readonly success: Map extends MultiMapResponse ? MultiMapResultOf<Map> : Response
}

type FetchFailureResult<
  MapSuccess extends MultiMapResponse | undefined,
  MapFailure extends MultiMapResponse | undefined
> = {
  readonly tag: 'failure'
  readonly failure:
    | { readonly clientError: unknown }
    | (MapFailure extends MultiMapResponse
        ? { readonly mapError: unknown }
        : MapSuccess extends MultiMapResponse
        ? { readonly mapError: unknown }
        : never)
    | {
        readonly serverError: MapFailure extends MultiMapResponse
          ? MultiMapResultOf<MapFailure>
          : Response
      }
}

type FetchResult<
  MapSuccess extends MultiMapResponse | undefined,
  MapFailure extends MultiMapResponse | undefined
> = FetchSuccessResult<MapSuccess> | FetchFailureResult<MapSuccess, MapFailure>

type CommonFetchResult = Promise<
  FetchResult<MultiMapResponse | undefined, MultiMapResponse | undefined>
>

type FetchInit<
  MapSuccess extends MultiMapResponse | undefined,
  MapFailure extends MultiMapResponse | undefined
> = {
  readonly url: string
  readonly mapSuccess?: MapSuccess
  readonly mapFailure?: MapFailure
} & RequestInit

type PrettyType<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

const serverErrorFailure = <T>(serverError: T) => failure({ serverError })

const mapFun = (response: Response, map: MapResponse) =>
  typeof map === 'string' ? response[map]() : map(response)

export function fetchmap<
  MapSuccess extends MultiMapResponse | undefined = undefined,
  MapFailure extends MultiMapResponse | undefined = undefined
>(
  init: FetchInit<MapSuccess, MapFailure>,
  fetcher: typeof fetch
): Promise<PrettyType<FetchResult<MapSuccess, MapFailure>>>

export function fetchmap<
  MapSuccess extends MultiMapResponse | undefined = undefined,
  MapFailure extends MultiMapResponse | undefined = undefined
>(
  init: FetchInit<MapSuccess, MapFailure>
): (fetcher: typeof fetch) => Promise<PrettyType<FetchResult<MapSuccess, MapFailure>>>

export function fetchmap(
  init: FetchInit<MultiMapResponse, MultiMapResponse>,
  fetcher?: typeof fetch
): CommonFetchResult | ((f: typeof fetch) => CommonFetchResult) {
  if (fetcher === undefined) {
    return (f: typeof fetch) => fetchmap(init, f)
  }

  const { url, mapSuccess, mapFailure, ...reqInit } = init

  return fetcher(url, reqInit)
    .then(async (response) => {
      const map = response.ok ? mapSuccess : mapFailure
      const result = response.ok ? success : serverErrorFailure

      if (map === undefined) {
        return result(response)
      }

      try {
        return result(
          await mapFun(
            response,
            typeof map === 'object' ? map[response.status] ?? map.default : map
          )
        )
      } catch (mapError) {
        return failure({ mapError })
      }
    })
    .catch((clientError: unknown) => failure({ clientError }))
}
