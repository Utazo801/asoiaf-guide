import { Component, OnInit } from '@angular/core';
import { Character } from './models/character.type';
import { CharacterService } from './services/character.service';
import { HouseService } from './services/house.service';
import { BookService } from './services/book.service';
import { Book } from './models/book.type';
import { House } from './models/house.type';

/**
 * The root component of the application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'asoiaf-guide'; //The title of the application.

  characters: Character[] = []; //Array to store characters.
  books: Book[] = []; //Array to store books.
  houses: House[] = []; //Array to store houses.

   /**
   * Constructor of the `AppComponent` class.
   * @param characterService - The service for fetching characters.
   * @param houseService - The service for fetching houses.
   * @param bookService - The service for fetching books.
   */
  constructor(
    private characterService: CharacterService,
    private houseService: HouseService,
    private bookService: BookService
  ) {}

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit() {}
}
