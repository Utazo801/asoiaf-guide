import { Component } from '@angular/core';
import { Character } from '../../models/character.type';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import _ from 'lodash';
import { HouseService } from '../../services/house.service';
import { Observable } from 'rxjs';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.css',
})
export class CharacterDetailsComponent {
  id!: number;
  character!: Character; // Property to hold the character details
  houseNames!: string[]; // An array containing names of houses associated with the character.
  bookNames!: string[]; //An array containing names of books associated with the character.

  /**
   * Constructor of the `CharacterDetailsComponent` class.
   * @param route - The activated route.
   * @param router - The router service.
   * @param characterService - The service for fetching character details.
   * @param houseService - The service for fetching house details.
   * @param bookService - The service for fetching book details.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService,
    private houseService: HouseService,
    private bookService: BookService
  ) {}

   /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    const characterId = this.route.snapshot.paramMap.get('id') ?? 'no';
    if (characterId === 'no') {
      this.router.navigate(['page-not-found']);
    }
    this.id = parseInt(characterId);
    this.getCharacter(this.id);
  }
/**
   * Retrieves the details of the character with the given ID.
   * @param id - The ID of the character.
   */
  getCharacter(id: number) {
    this.characterService.getCharacterByID(id).subscribe(
      (character) => {
        if (character !== null) {
          this.character = character;
        } else {
          // Handle the case when character is null
          console.error('Character not found');
          this.router.navigate(['page-not-found']);
        }
      },
      (error) => {
        // Handle error
        console.error('Error fetching character:', error);
      }
    );
  }
  /**
   * Parses the character's URL to extract the character's ID.
   * @param url - The URL of the character.
   * @returns The ID of the character.
   */
  parseURLs(url: string): number {
    let array = url.split('/');
    let id = parseInt(array[array.length - 1]);
    return id;
  }

  /**
   * Retrieves the name of the character with the given ID.
   * @param id - The ID of the character.
   * @returns An observable emitting the name of the character.
   */
  getCharacterName(id: number): Observable<string> {
    return this.characterService.getCharacterName(id);
  }
  /**
   * Retrieves the name of the house associated with the given ID.
   * @param id - The ID of the house.
   * @returns An observable emitting the name of the house.
   */
  getHouseName(id: number): Observable<string> {
    return this.houseService.getHouseName(id);
  }
  /**
   * Retrieves the name of the book associated with the given ID.
   * @param id - The ID of the book.
   * @returns An observable emitting the name of the book.
   */
  getBookName(id: number): Observable<string> {
    return this.bookService.getBookName(id);
  }
}
