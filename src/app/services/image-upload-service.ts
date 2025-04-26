import { Injectable } from '@angular/core';
// import { Observable, Observer, BehaviorSubject,Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MyService {

    private message = new BehaviorSubject('false');
    sharedMessage = this.message.asObservable();
  
    constructor() { }
  
    nextMessage(message: string) {
      this.message.next(message)
    }

    }
