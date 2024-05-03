import { Component } from '@angular/core';
import { Character } from '../../models/character.type';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.css',
})
export class CharacterDetailsComponent {
  id!: number;
  character!: Character; // Define a property to hold the character details

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService
  ) {}
  ngOnInit(): void {
    const characterId = this.route.snapshot.paramMap.get('id') ?? 'no';
    if (characterId === 'no') {
      this.router.navigate(['page-not-found']);
    }
    this.id = parseInt(characterId);
    this.getCharacter(this.id);
    if (this.character === null) {
    }
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
}
