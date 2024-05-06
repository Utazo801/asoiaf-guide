import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$: Observable<string> = this.searchTermSubject.asObservable();

  constructor() {}

  setSearchTerm(searchTerm: string) {
    this.searchTermSubject.next(searchTerm);
  }

  getSearchTerm(): string {
    return this.searchTermSubject.value;
  }
}
