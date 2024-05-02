import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../services/character.service';
import { ActivatedRoute, Route } from '@angular/router';
import { Character } from '../../models/character.type';
import { Observable, tap } from 'rxjs';
import { SearchResult } from '../../models/search-result.type';
import { UserInputComponent } from '../user-input/user-input.component';
import { HouseService } from '../../services/house.service';
import { House } from '../../models/house.type';
import _ from 'lodash';

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

  constructor(
    private characterService: CharacterService,
    private houseService: HouseService
  ) {}

  ngOnInit(): void {
    this.getCharacters();
    this.houses = [];
    this.houseService.getHouses().subscribe((h) => (this.houses = h.results));
  }

  previousPage(): void {
    this.currentPage--;
    this.getCharacters();
  }

  nextPage(): void {
    this.currentPage++;
    this.getCharacters();
  }
  getCharacters() {
    this.characters = this.characterService.getCharacters({
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
    });
    this.characters.subscribe((r) => {
      //console.log(r.results);
      this.maxPages = Math.ceil(r.allResults / this.pageSize);
      this.currentPage = r.page;
    });
  }
  getHouseName(id: number) {
    let house = _.find(this.houses || [], (c) => c.id == id);

    return house && house.name;
  }

  houses!: House[];
  selectedCharacter!: Character;
  characters!: Observable<SearchResult<Character>>;
}
