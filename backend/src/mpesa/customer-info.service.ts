import { Injectable } from '@nestjs/common';


@Injectable()
export class CustomerInfoService {
  private store = new Map<
    string,
    { userId: number, planName: string, duration: string }
  >();

  set(
    key: string,
    userId: number,
    planName: string,
    duration: string
  ) {
    this.store.set(key, { userId, planName, duration });
  }

  get(
    key: string,
  ):
    | { userId: number; planName: string, duration: string }
    | undefined {
    return this.store.get(key);
  }

  delete(key: string) {
    this.store.delete(key);
  }
}
