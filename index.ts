import axios, { AxiosRequestConfig } from "axios"

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

axios.interceptors.request.use(async (config) => {
    if (!isAuthenticatedRequest(config)) {
        return config
    }

    if (!userHasExpired() && !userWillExpire()) {
        return config
    }

    if (userHasExpired() || userWillExpire()) {
        if (!refreshPromise) {
            refreshPromise = refreshToken()
        }
        await refreshPromise
        refreshPromise = undefined
        return updateBearerToken(config)
    }

    return config;
}, undefined);