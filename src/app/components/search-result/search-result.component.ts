import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchResult } from '../../models/search-result.type';
import { Character } from '../../models/character.type';
import { Book } from '../../models/book.type';
import { House } from '../../models/house.type';
import { CharacterService } from '../../services/character.service';
import { HouseService } from '../../services/house.service';
import { BookService } from '../../services/book.service';
import { SearchService } from '../../services/search.service';


/**
 * Represents the component responsible for displaying search results for characters, houses, and books.
 */
@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css'],
})
export class SearchResultsComponent implements OnInit {
  characterSearchResult!: Observable<SearchResult<Character>>; // An observable emitting search results for characters.
  houseSearchResult!: Observable<SearchResult<House>>; //An observable emitting search results for houses.
  bookSearchResult!: Observable<SearchResult<Book>>; // An observable emitting search results for books.

   /**
   * Constructor of the `SearchResultsComponent` class.
   * @param characterService - The service for fetching character data.
   * @param houseService - The service for fetching house data.
   * @param bookService - The service for fetching book data.
   * @param searchService - The service for handling search functionality.
   */
  constructor(
    private characterService: CharacterService,
    private houseService: HouseService,
    private bookService: BookService,
    private searchService: SearchService
  ) {}
  /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    this.search(this.searchService.getSearchTerm());
  }
 /**
   * Performs a search using the provided search term.
   * @param searchTerm - The term to search for.
   */
  search(searchTerm: string) {
    this.characterSearchResult = this.characterService.getCharacters({
      searchTerm,
    });
    this.houseSearchResult = this.houseService.getHouses({ searchTerm });
    this.bookSearchResult = this.bookService.getBooks({ searchTerm });
  }
  /**
   * Handles pagination for search results based on the search type.
   * @param event - The pagination event.
   * @param searchType - The type of search (character, house, or book).
   */
  pageChanged(event: any, searchType: string) {
    let page: number;
    const searchTerm = this.searchService.getSearchTerm();

    if (searchType === 'character') {
      page = event.pageIndex;
      this.characterSearchResult = this.characterService.getCharacters({
        searchTerm,
        page,
      });
    } else if (searchType === 'house') {
      page = event.pageIndex;
      this.houseSearchResult = this.houseService.getHouses({
        searchTerm,
        page,
      });
    } else if (searchType === 'book') {
      page = event.pageIndex;
      this.bookSearchResult = this.bookService.getBooks({ searchTerm, page });
    }
  }
}
