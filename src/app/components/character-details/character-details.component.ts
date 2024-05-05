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
  character!: Character; // Define a property to hold the character details
  houseNames!: string[];
  bookNames!: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService,
    private houseService: HouseService,
    private bookService: BookService
  ) {}
  ngOnInit(): void {
    const characterId = this.route.snapshot.paramMap.get('id') ?? 'no';
    if (characterId === 'no') {
      this.router.navigate(['page-not-found']);
    }
    this.id = parseInt(characterId);
    this.getCharacter(this.id);
  }

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

  parseURLs(url: string): number {
    let array = url.split('/');
    let id = parseInt(array[array.length - 1]);
    return id;
  }
  getCharacterName(id: number): Observable<string> {
    return this.characterService.getCharacterName(id);
  }

  getHouseName(id: number): Observable<string> {
    return this.houseService.getHouseName(id);
  }
  getBookName(id: number): Observable<string> {
    return this.bookService.getBookName(id);
  }
}
