import { Global, Injectable, NotFoundException } from '@nestjs/common';

interface IRequestSuccess<T> {
  data?: T;
  message?: string;
}

export interface IRequestPagination<T> {
  data: T[];
  total: number;
  limit: number;
  currentPage: number;
  message?: string;
}

@Injectable()
@Global()
export class ApiResponseService<T = any> {
  success({ message, data }: IRequestSuccess<T> = {}) {
    return { success: true, message: message || 'Success', payload: data };
  }

  pagination({
    currentPage,
    data,
    limit,
    total,
    message,
  }: IRequestPagination<T>) {
    const perPage = Math.ceil(total / limit);

    if ((currentPage > perPage || currentPage < 1) && currentPage !== 1) {
      throw new NotFoundException();
    }

    return {
      success: true,
      message: message || 'Success',
      payload: {
        data,
        total,
        currentPage,
        perPage,
        limit,
      },
    };
  }
}
