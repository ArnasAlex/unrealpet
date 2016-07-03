interface IControllerConfig {
    name: string;
    actions: Array<IControllerAction>;
}

interface IControllerAction{
    name: string;
    func: Function;
    method: HttpMethod;
    roles: Array<Role>;
}

declare const enum HttpMethod {
    get = 1,
    post = 2
}

declare const enum Role {
    Authenticated = 1,
    Admin = 2
}

declare const enum WorkerType {
    WebServer = 1,
    BackgroundJob = 2,
    BackgroundJobInterval = 3
}