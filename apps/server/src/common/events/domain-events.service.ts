import { Injectable } from '@nestjs/common';
import { Observable, Subject, filter, map } from 'rxjs';

export interface DomainEvent<T = unknown> {
  name: string;
  payload: T;
}

/**
 * Minimal in-process event bus (single Nest process). Producers call `emit`,
 * feature listeners subscribe with `on(name)`. Built on an RxJS Subject so we
 * add no runtime dependency. Delivery is synchronous and fire-and-forget:
 * subscriber errors must not break the emitter.
 */
@Injectable()
export class DomainEventsService {
  private readonly stream$ = new Subject<DomainEvent>();

  emit<T>(name: string, payload: T): void {
    this.stream$.next({ name, payload });
  }

  on<T>(name: string): Observable<T> {
    return this.stream$.pipe(
      filter((event) => event.name === name),
      map((event) => event.payload as T),
    );
  }
}
