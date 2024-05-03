import { Character } from '../models/character.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, map, merge, of, tap } from 'rxjs';
import * as _ from 'lodash';
import { SearchResult } from '../models/search-result.type';
import { Book } from '../models/book.type';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  apiUrl = 'https://anapioficeandfire.com/api/books';
  private storageKey = 'books';
  private books: Book[] = [];
  constructor(private http: HttpClient) {
    this.getBooks();
  }

  getBooks(options?: {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    fromReleaseDate?: Date;
    toReleaseDate?: Date;
  }): Observable<SearchResult<Book>> {
    const pageSize = options?.pageSize || 10;
    const page = options?.page || 1;
    const searchTerm = options?.name || '';
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    // Check if characters are available in local storage
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempChars: Book[] = JSON.parse(cachedData);
      const totalResults = tempChars.length;

      // Check if there is enough cached data to satisfy the request
      if (totalResults >= endIndex) {
        const allResults = searchTerm.length
          ? tempChars.filter((c) =>
              [c.name, c.isbn, c.mediaType, c.publisher, c.released].some(
                (e) => e && e.toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
          : tempChars.slice(startIndex, endIndex);

        return of({
          allResults: totalResults,
          results: allResults,
          page: page,
          pageSize: pageSize,
          searchTerm: searchTerm,
        });
      }
    }

    // If there is not enough cached data or no cached data, fetch from API
    return this.fetchBooksFromApi(options).pipe(
      map((data) => {
        const totalResults = data.length;
        const results = data;

        return <SearchResult<Book>>{
          allResults: totalResults,
          results: results,
          page: page,
          pageSize: pageSize,
          searchTerm: searchTerm,
        };
      })
    );
  }

  private fetchBooksFromApi(options?: {
    page?: number;
    pageSize?: number;
    name?: string;
    fromReleaseDate?: Date;
    toReleaseDate?: Date;
  }): Observable<Book[]> {
    let pageSize = options && options.pageSize ? options.pageSize : 10;
    let page = options && options.page ? options.page : 1;
    let queryparams = new HttpParams()
      .append('page', page.toString())
      .append('pageSize', pageSize.toString());

    if (options) {
      if (options.name) queryparams = queryparams.append('name', options.name);
    }

    return this.http.get<Book[]>(this.apiUrl, { params: queryparams }).pipe(
      tap((book) => {
        book.forEach((book) => {
          const urlParts = book.url.split('/');
          book.id = parseInt(urlParts[urlParts.length - 1]);
          book.characterids = [];
          book.povCharactersids = [];
          book.characters.forEach((a) => {
            const urlcharParts = a.split('/');
            book.characterids.push(
              parseInt(urlcharParts[urlcharParts.length - 1])
            );
          });
          book.povCharacters.forEach((a) => {
            const urlpovParts = a.split('/');
            book.povCharactersids.push(
              parseInt(urlpovParts[urlpovParts.length - 1])
            );
          });
        });
        this.saveArray(book);
      })
    );
  }

  fetchFromAPIByID(id: number): Observable<Book | null> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      map((book) => {
        this.saveSingle(book);
        return book; // Return the character
      }),
      catchError((error) => {
        console.error('Error fetching character from API:', error);
        return of(null); // Return Observable with null value in case of error
      })
    );
  }
  saveSingle(book: Book) {
    let tempBooks: Book[] = [];
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      tempBooks = JSON.parse(cachedData);
    }
    tempBooks.push(book);
    localStorage.setItem(this.storageKey, JSON.stringify(tempBooks));
    this.getBooks();
  }

  getBookByID(id: number): Observable<Book | null> {
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempBook: Book[] = JSON.parse(cachedData);
      const foundBook = tempBook.find((t) => t.id === id);
      if (foundBook) {
        return of(foundBook);
      } else {
        // If character is not found in the cached data, fetch it from the API
        return this.fetchFromAPIByID(id);
      }
    } else {
      // If there's no cached data, fetch the character from the API
      return this.fetchFromAPIByID(id);
    }
  }
  private saveArray(books: Book[]) {
    console.log(books);
    // Get existing data from localStorage
    const existingData = localStorage.getItem(this.storageKey);
    let cachedBooks: Book[] = [];

    // Parse existing data if it exists
    if (existingData) {
      cachedBooks = JSON.parse(existingData);
    }

    // Check for duplicates and add new data
    books.forEach((newBook) => {
      if (!cachedBooks.some((c) => c.id === newBook.id)) {
        cachedBooks.push(newBook);
      }
    });

    // Save updated data back to localStorage
    this.books = cachedBooks;
    const characterData = JSON.stringify(cachedBooks);
    localStorage.setItem(this.storageKey, characterData);
  }
}
