export default class Response {
    headers: { [key: string]: string } = {};
    constructor(public code: number, public content: any = '') {}

    setHeaders(headers: { [key: string]: string }) {
        this.headers = headers;
        return this;
    }

    setHeader(header: string, value: string) {
        this.headers[header] = value;
        return this;
    }
}