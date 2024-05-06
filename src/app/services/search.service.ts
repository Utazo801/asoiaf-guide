import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service responsible for managing search term.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {

  private searchTermSubject = new BehaviorSubject<string>(''); //Subject to hold the current search term.
  searchTerm$: Observable<string> = this.searchTermSubject.asObservable(); //Observable to subscribe to changes in the search term.

   /**
   * Constructor of the `SearchService` class.
   */
  constructor() {}

   /**
   * Sets the search term to the provided value.
   * @param searchTerm - The search term to set.
   */
  setSearchTerm(searchTerm: string) {
    this.searchTermSubject.next(searchTerm);
  }

  /**
   * Retrieves the current search term.
   * @returns The current search term.
   */
  getSearchTerm(): string {
    return this.searchTermSubject.value;
  }
}
