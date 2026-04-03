type DefaultBody = Record<string, unknown>;
type RequestOptions = {
    cache?: RequestCache;
    headers?: HeadersInit;
};

export class FetchWrapper {
    #baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    constructor(baseURL: string) {
        this.#baseURL = baseURL;
    }

    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        const response = await fetch(this.#baseURL + endpoint, {
            cache: options?.cache,
            headers: options?.headers,
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}.`);
        }

        return response.json();
    }
    
    post<T, B = DefaultBody>(endpoint: string, body: B, options?: RequestOptions): Promise<T> {
        return this.#send<B>("POST", endpoint, body, options);
    }


    put<T,B=DefaultBody>(endpoint: string, body : B, options?: RequestOptions):Promise<T>{
        return this.#send<B>("PUT",endpoint,body, options)
    }
    
    delete<T, B>(endpoint:string,body: B, options?: RequestOptions):Promise<T>{
        return this.#send("DELETE", endpoint, body, options)
    }


    async #send<B>(method: string, endpoint: string, body?: B, options?: RequestOptions) {
        const response = await fetch(this.#baseURL + endpoint, {
            method,
            cache: options?.cache,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}.`);
        }

        return response.json();
    }
}
