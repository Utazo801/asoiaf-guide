import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Book } from '../models/book.type';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'https://anapioficeandfire.com/api';
  private books: Book[];
  constructor(private http: HttpClient) {
    this.books = [];
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
  private getDataFromStorage(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private setDataToStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
  loadBooks(): Observable<any[]> {
    const books = this.getDataFromStorage('got_books');
    if (books) {
      return of(books);
    } else {
      return this.http.get<any[]>(`${this.apiUrl}/books`).pipe(
        tap((data) => this.setDataToStorage('got_books', data)),
        catchError(this.handleError<any[]>('loadBooks', []))
      );
    }
  }
  getBookById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/books/${id}`)
      .pipe(catchError(this.handleError<any>('getBookById')));
  }

  getBookByFilter(options?: {
    searchTerm?: string;
    pageSize?: number;
    page?: number;
  }) {
    let pageSize = (options && options.pageSize) || 5;
    let page = (options && options.page) || 0;
    let searchTerm = (options && options.searchTerm) || '';
    let allResults = searchTerm.length
      ? _.filter(
          this.books,
          (c) =>
            _.find(
              [c.name], //should implement fromReleaseDate, toReleaseDate as well
              (e) => e && e.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
            ) !== undefined
        )
      : this.books;
  }
}
