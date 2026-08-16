import { Injectable } from '@nestjs/common';
import { Observable, Subject, finalize } from 'rxjs';

/**
 * In-memory realtime hub for course chats (SSE based).
 * Each connected user gets an RxJS Subject; chat events are pushed to the
 * subjects of every participant of the related course.
 */
@Injectable()
export class ChatEventsService {
  private connections = new Map<number, Set<Subject<any>>>();
  private onlineUsers = new Set<number>();

  subscribe(userId: number): Observable<any> {
    const subject = new Subject<any>();
    let subs = this.connections.get(userId);
    if (!subs) {
      subs = new Set<Subject<any>>();
      this.connections.set(userId, subs);
    }
    subs.add(subject);
    this.onlineUsers.add(userId);

    return subject.asObservable().pipe(
      finalize(() => {
        subs.delete(subject);
        if (subs.size === 0) {
          this.connections.delete(userId);
          this.onlineUsers.delete(userId);
        }
      }),
    );
  }

  /** Push an event to a set of user ids (e.g. all course participants). */
  emitToUsers(userIds: number[], type: string, data: unknown) {
    for (const id of userIds) {
      const subs = this.connections.get(id);
      if (!subs || subs.size === 0) continue;
      const payload = { type, data };
      for (const s of subs) {
        s.next(payload);
      }
    }
  }

  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  /** Number of currently connected users (used by heartbeat/debug). */
  connectedCount(): number {
    return this.onlineUsers.size;
  }
}
