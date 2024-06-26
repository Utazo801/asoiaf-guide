import { Character } from '../models/character.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, map, merge, of, tap } from 'rxjs';
import * as _ from 'lodash';
import { SearchResult } from '../models/search-result.type';
import { Book } from '../models/book.type';


/**
 * Service responsible for fetching and managing book data.
 */
@Injectable({
  providedIn: 'root',
})
export class BookService {
  apiUrl = 'https://anapioficeandfire.com/api/books'; //API URL for fetching book data.
  private storageKey = 'books'; //Key for storing books in local storage.
  private books: Book[] = []; //Array to hold cached book data.

  /**
   * Constructor of the `BookService` class.
   * @param http - The HTTP client for making requests.
   */
  constructor(private http: HttpClient) {
    this.getBooks();
  }
/**
   * Fetches books based on the provided options.
   * @param options - Options for filtering and pagination.
   * @returns An observable emitting the search results of books.
   */
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

 /**
   * Fetches books from the API based on the provided options.
   * @param options - Options for filtering and pagination.
   * @returns An observable emitting an array of books.
   */
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
          this.BookProcessing(book);
        });
        this.saveArray(book);
      })
    );
  }
/**
   * Processes book data received from the API.
   * @param book - The book object to process.
   */
  private BookProcessing(book: Book) {
    const urlParts = book.url.split('/');
    book.id = parseInt(urlParts[urlParts.length - 1]);
    book.characterids = [];
    book.povCharactersids = [];
    book.characters.forEach((a) => {
      const urlcharParts = a.split('/');
      book.characterids.push(parseInt(urlcharParts[urlcharParts.length - 1]));
    });
    book.povCharacters.forEach((a) => {
      const urlpovParts = a.split('/');
      book.povCharactersids.push(parseInt(urlpovParts[urlpovParts.length - 1]));
    });
  }
 /**
   * Fetches a single book from the API by ID.
   * @param id - The ID of the book to fetch.
   * @returns An observable emitting the fetched book or null if not found.
   */
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
  /**
   * Retrieves a book by ID.
   * @param id - The ID of the book to retrieve.
   * @returns An observable emitting the book with the specified ID.
   */
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
  /**
   * Retrieves the name of a book by ID.
   * @param id - The ID of the book.
   * @returns An observable emitting the name of the book.
   */
  getBookName(id: number): Observable<string> {
    // Look for character in cache
    const existingData = localStorage.getItem(this.storageKey);
    let cachedBooks: Character[] = [];
    if (existingData) {
      cachedBooks = JSON.parse(existingData);
    }
    let book = _.find(cachedBooks || [], (c) => c.id == id);

    if (book && book.name) {
      return of(book.name);
    } else if (book && book.aliases && book.aliases.length > 0) {
      return of(book.aliases[0]);
    } else {
      // If character is not found in cache, fetch it from the API
      return this.getBookByID(id).pipe(
        map((book) => {
          if (book && book.name) {
            return book.name;
          } else if (book && book.authors && book.authors.length > 0) {
            return book.authors[0];
          } else {
            return book!.id.toString();
          }
        })
      );
    }
  }
   /**
   * Saves an array of books to local storage.
   * @param books - The array of books to save.
   */
  private saveArray(books: Book[]) {
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
    this.books = cachedBooks.sort((a, b) => a.id - b.id);
    const characterData = JSON.stringify(cachedBooks);
    localStorage.setItem(this.storageKey, characterData);
  }
  /**
   * Saves a single book to local storage.
   * @param book - The book to save.
   */
  saveSingle(book: Book) {
    let tempBooks: Book[] = [];
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      tempBooks = JSON.parse(cachedData);
      if (!tempBooks.some((c) => c.id === book.id)) {
        tempBooks.push(book);
      }
    }
    tempBooks = tempBooks.sort((a, b) => a.id - b.id);

    localStorage.setItem(this.storageKey, JSON.stringify(tempBooks));
    this.getBooks();
  }
}
