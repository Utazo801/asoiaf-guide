import { Component } from '@angular/core';
import { Book } from '../../models/book.type';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { CharacterService } from '../../services/character.service';
import { Character } from '../../models/character.type';
import _ from 'lodash';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css',
})
export class BookDetailsComponent {
  id!: number;
  book!: Book;
  characters!: Character[];
  pageSizeCharacters: number = 5; // Number of characters per page
  pageSizePOVCharacters: number = 5; // Number of POV characters per page
  pagedCharacterIds: number[] = []; // Array to hold paginated character ids
  pagedPOVCharacterIds: number[] = []; // Array to hold paginated POV character ids
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private characterService: CharacterService
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id') ?? 'no';
    if (bookId === 'no') {
      this.router.navigate(['page-not-found']);
    }
    this.id = parseInt(bookId);
    this.getBook(this.id);
    this.getCharacters();
  }
  getBook(id: number) {
    this.bookService.getBookByID(id).subscribe(
      (book) => {
        if (book !== null) {
          this.book = book;
        } else {
          // Handle the case when character is null
          console.error('Book not found');
          this.router.navigate(['page-not-found']);
        }
      },
      (error) => {
        // Handle error
        console.error('Error fetching character:', error);
      }
    );
  }
  pageCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pagedCharacterIds = this.book.characterids.slice(startIndex, endIndex);
  }

  // Method to paginate POV characters
  pagePOVCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pagedPOVCharacterIds = this.book.povCharactersids.slice(
      startIndex,
      endIndex
    );
  }

  getCharacters() {
    this.characterService
      .getCharacters()
      .subscribe((r) => (this.characters = r.results));
  }
  getCharacterName(id: number) {
    //Look for character in cache, if it isnt there, fetch it from api and store in a different cache
    let character = _.find(this.characters || [], (c) => c.id == id);
    return character && character.name;
  }
}
