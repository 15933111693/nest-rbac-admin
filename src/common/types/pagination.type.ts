export type PaginationType<Data, Order> = {
  data?: Data;
  order?: Order;
  current?: number;
  size?: number;
  isAll?: boolean;
};

export type ReturnPaginationType<T> = {
  list: Array<T>;
  total: number;
};

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
