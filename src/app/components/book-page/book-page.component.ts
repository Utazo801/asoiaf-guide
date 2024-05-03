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

  constructor(
    private bookService: BookService,
    private characterService: CharacterService
  ) {}

  ngOnInit(): void {
    this.getBooks();
    this.characterService
      .getCharacters()
      .subscribe((h) => (this.characters = h.results));
  }

  previousPage(): void {
    this.currentPage--;
    this.getBooks();
  }

  nextPage(): void {
    this.currentPage++;
    this.getBooks();
  }
  getBooks() {
    this.books = this.bookService.getBooks({
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
    });
    this.books.subscribe((r) => {
      //console.log(r.results);
      this.maxPages = Math.ceil(r.allResults / this.pageSize);
      this.currentPage = r.page;
    });
  }
  getHouseName(id: number) {
    let house = _.find(this.characters || [], (c) => c.id == id);

    return house && house.name;
  }

  characters!: Character[];
  selectedBook!: Book;
  books!: Observable<SearchResult<Book>>;
}
