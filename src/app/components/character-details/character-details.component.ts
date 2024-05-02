import { Component } from '@angular/core';
import { Character } from '../../models/character.type';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.css'
})
export class CharacterDetailsComponent {

  id!: number;
  character!: Observable<Character | null>; // Define a property to hold the character details

  constructor(private route: ActivatedRoute,private router: Router, private characterService: CharacterService) { }
  ngOnInit(): void {
    const characterId = this.route.snapshot.paramMap.get('id') ?? "no";
    if(characterId ==="no"){
      this.router.navigate(['page-not-found']);
    }
    this.id = parseInt(characterId);
    this.character = this.characterService.getCharacterByID(this.id)

    if(this.character === null){
      this.router.navigate(['page-not-found']);
    }
  }
}
