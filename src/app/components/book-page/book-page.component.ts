import { Component } from '@angular/core';
import { Book } from '../../models/book.type';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { CharacterService } from '../../services/character.service';
import { Character } from '../../models/character.type';
import { Observable } from 'rxjs';
import { SearchResult } from '../../models/search-result.type';
import _ from 'lodash';

@Component({
  selector: 'app-book-page',
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.css',
})
export class BookPageComponent {
  currentPage: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  maxPages: number = 0;

  characters!: Character[]; //An array containing characters fetched from the character service.
  books!: Observable<SearchResult<Book>>; // An observable emitting search results of books.

   /**
   * Constructor of the `BookPageComponent` class.
   * @param bookService - The service for fetching book data.
   * @param characterService - The service for fetching character data.
   */
  constructor(
    private bookService: BookService,
    private characterService: CharacterService
  ) {}
  /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    this.getBooks();
    this.characterService
      .getCharacters()
      .subscribe((h) => (this.characters = h.results));
  }
/**
   * Moves to the previous page of books.
   */
  previousPage(): void {
    this.currentPage--;
    this.getBooks();
  }
 /**
   * Moves to the next page of books.
   */
  nextPage(): void {
    this.currentPage++;
    this.getBooks();
  }
  /**
   * Fetches books based on current pagination and search criteria.
   */
  getBooks() {
    this.books = this.bookService.getBooks({
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
    });
    this.books.subscribe((r) => {
      this.maxPages = Math.ceil(r.allResults / this.pageSize);
      this.currentPage = r.page;
    });
  }

}
