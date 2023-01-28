import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseBodyInterface } from '../types/response-body.interface';

@Catch()
export class ApiExceptionFilter<T> implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    const code: number = exception.getStatus ? exception.getStatus() : 500;
    const message: string =
      code >= 500
        ? '内部服务器错误'
        : exception.message
        ? exception.message
        : '未知错误';

    const resBody: ResponseBodyInterface = {
      code,
      data: null,
      message,
    };
    await response.send(resBody);
    console.error(exception);
  }
}
