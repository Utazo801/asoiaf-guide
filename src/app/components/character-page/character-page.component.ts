import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../services/character.service';
import { ActivatedRoute, Route } from '@angular/router';
import { Character } from '../../models/character.type';
import { Observable, map, tap } from 'rxjs';
import { SearchResult } from '../../models/search-result.type';
import { UserInputComponent } from '../user-input/user-input.component';
import { HouseService } from '../../services/house.service';
import { House } from '../../models/house.type';
import _, { sortBy } from 'lodash';

@Component({
  selector: 'app-character-page',
  templateUrl: './character-page.component.html',
  styleUrl: './character-page.component.css',
})
export class CharacterPageComponent {
  currentPage: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  maxPages: number = 0;
  houses!: House[]; //An array containing houses associated with characters.
  characters!: Observable<SearchResult<Character>>; //An observable emitting search results of characters.

  /**
   * Constructor of the `CharacterPageComponent` class.
   * @param characterService - The service for fetching character data.
   */
  constructor(private characterService: CharacterService) {}

  /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    this.getCharacters();
  }
  /**
   * Moves to the previous page of characters.
   */
  previousPage(): void {
    this.currentPage--;
    this.getCharacters();
  }
  /**
   * Moves to the next page of characters.
   */
  nextPage(): void {
    this.currentPage++;
    this.getCharacters();
  }

   /**
   * Fetches characters based on current pagination and search criteria.
   */
  getCharacters() {
    this.characters = this.characterService.getCharacters({
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
    });
    this.characters.subscribe((r) => {
      this.maxPages = Math.ceil(r.allResults / this.pageSize);
      this.currentPage = r.page;
    });
  }

}
