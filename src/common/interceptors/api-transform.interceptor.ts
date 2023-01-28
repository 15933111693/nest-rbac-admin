import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { ResponseBodyInterface } from '../types/response-body.interface';

@Injectable()
export class ApiTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response: Response = ctx.getResponse();

        response.header('Content-Type', 'application/json; charset=utf-8');

        const resBody: ResponseBodyInterface = {
          code: response.statusCode,
          message: '请求成功',
          data,
        };

        return resBody;
      }),
    );
  }
}
