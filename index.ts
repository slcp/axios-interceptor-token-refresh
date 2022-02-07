import axios, { Axios, AxiosRequestConfig } from "axios"

const userWillExpire = (): boolean => true
const userHasExpired = (): boolean => true
const isAuthenticatedRequest = (request: AxiosRequestConfig) => {
    if (typeof request.headers?.Authorization !== "string") {
        return false;
    }
    if (request.headers.Authorization.startsWith("Bearer")) {
        return true
    }
}

const refreshToken = (): Promise<void> => Promise.resolve()

const token = ""

const updateBearerToken = (request: AxiosRequestConfig) => {
    request.headers = request.headers || {}
    request.headers.Authorization = `Bearer ${token}`
    return request
}

let refreshPromise: Promise<void> | undefined;
const refreshAccessTokenIfRequired = async () => {
    if (!userHasExpired() && !userWillExpire()) {
        return
    }

    if (!refreshPromise) {
        refreshPromise = refreshToken()
    }

    await refreshPromise
    refreshPromise = undefined
}

const updateBearerTokenInterceptor = async (config) => {
    if (!isAuthenticatedRequest(config)) {
        return config
    }
    await refreshAccessTokenIfRequired()
    return updateBearerToken(config)
}


export const authorizeRequestInterceptor = async (config: AxiosRequestConfig) => {
    await refreshAccessTokenIfRequired()
    return updateBearerToken(config)
}

export const withAuthorization = (instance: Axios) => {
    instance.interceptors.request.use(authorizeRequestInterceptor, undefined);
    return instance;
}

axios.interceptors.request.use(updateBearerTokenInterceptor, undefined);
export default axios;