import HttpStatus from "http-status-codes";
import { ApiDataResponsePaginated, ApiDataResponse, ApiResponse, ApiErrorResponse } from "./ApiResponses";

// You have Response filter to change the data output before sending it to your consumer https://tsed.io/docs/response-filter.html#wrap-responses
// @ResponseFilter("application/json")
// export class WrapperResponseFilter implements ResponseFilterMethods {
//   transform(data: any, ctx: Context) {
//     return {result: "success", data, errors: []};
//   }
// }
export class HttpResponse<T = any> {
  public result = "success";
  constructor(public status: number, public message?: string, public data?: T | any) {}

  serialize(): ApiResponse<T> {
    return { result: "success", message: this.message, data: this.data };
  }
}

/// TODO you have @tsed/exceptions for that :) and @Catch exception filter to format error before sending it to your consumer
// https://tsed.io/docs/exceptions.html#exception-filter
// See examples
//
export class HttpErrorResponse extends HttpResponse<any> {
  constructor(public status: number, public message?: string, public data?: any, public error?: Error) {
    super(status, message, data);
    this.result = "error";
  }

  serialize(): ApiErrorResponse {
    return { message: this.message, data: this.data, result: "error", error: this.error };
  }
}

// Error responses
export class BadRequest extends HttpErrorResponse {
  constructor(message = "Bad request", data?: any, error?: Error) {
    super(HttpStatus.BAD_REQUEST, message, data, error);
  }
}

export class Unauthorized extends HttpErrorResponse {
  constructor(message = "Unauthorized", data?: any, error?: Error) {
    super(HttpStatus.UNAUTHORIZED, message, data, error);
  }
}

export class Forbidden extends HttpErrorResponse {
  constructor(message = "Forbidden", data?: any, error?: Error) {
    super(HttpStatus.FORBIDDEN, message, data, error);
  }
}

export class NotFound extends HttpErrorResponse {
  constructor(message = "Not found", data?: any, error?: Error) {
    super(HttpStatus.NOT_FOUND, message, data, error);
  }
}

export class InternalServerError extends HttpErrorResponse {
  constructor(message = "Internal server error", data?: any, error?: Error) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, data, error);
  }
}

// Success responses
export class Ok<T extends object = {}> extends HttpResponse<T> {
  constructor(messageOrData?: T | string) {
    // Sends back a message variable with text or a data variable with any depending on received value
    super(
      HttpStatus.OK,
      typeof messageOrData === "string" ? messageOrData : undefined,
      typeof messageOrData == "object" ? messageOrData : undefined
    );
  }
}

export class Created<T extends object = {}> extends HttpResponse<T> {
  constructor(messageOrData?: string | T) {
    // Sends back a message variable with text or a data variable with any depending on received value
    super(
      HttpStatus.CREATED,
      typeof messageOrData === "string" ? messageOrData : undefined,
      typeof messageOrData == "object" ? messageOrData : undefined
    );
  }
}

export class PaginatedResult<T extends object = {}> extends Ok<T[]> {
  constructor(data: T[], public totalCount: number, public offset: number, public nextUrl?: string) {
    super(data);
  }

  serialize(): ApiDataResponsePaginated<T> {
    return {
      ...(super.serialize() as ApiDataResponse<T[]>),
      size: (this.data as object[]).length,
      totalCount: this.totalCount,
      offset: this.offset,
      nextUrl: this.nextUrl,
    };
  }
}
