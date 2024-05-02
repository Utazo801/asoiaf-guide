import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Character } from './models/character.type';
import { CharacterService } from './services/character.service';
import { HouseService } from './services/house.service';
import { BookService } from './services/book.service';
import { Book } from './models/book.type';
import { House } from './models/house.type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'asoiaf-guide';

  characters: Character[] = [];
  books: Book[] = [];
  houses: House[] = [];

  constructor(
    private characterService: CharacterService,
    private houseService: HouseService,
    private bookService: BookService
  ) {}

  ngOnInit() {}
}
