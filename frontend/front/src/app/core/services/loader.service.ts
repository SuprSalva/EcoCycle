import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('Cargando...');

  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  public message$: Observable<string> = this.messageSubject.asObservable();

  constructor() { }

  show(message: string = 'Cargando...'): void {
    this.messageSubject.next(message);
    this.isLoadingSubject.next(true);
  }

  hide(): void {
    this.isLoadingSubject.next(false);
  }
}
