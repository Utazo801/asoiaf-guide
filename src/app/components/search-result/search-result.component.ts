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

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css'],
})
export class SearchResultsComponent implements OnInit {
  characterSearchResult!: Observable<SearchResult<Character>>;
  houseSearchResult!: Observable<SearchResult<House>>;
  bookSearchResult!: Observable<SearchResult<Book>>;

  constructor(
    private characterService: CharacterService,
    private houseService: HouseService,
    private bookService: BookService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.search(this.searchService.getSearchTerm());
  }

  search(searchTerm: string) {
    this.characterSearchResult = this.characterService.getCharacters({
      searchTerm,
    });
    this.houseSearchResult = this.houseService.getHouses({ searchTerm });
    this.bookSearchResult = this.bookService.getBooks({ searchTerm });
  }
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
