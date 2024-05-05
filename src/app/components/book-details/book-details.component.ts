import { Component } from '@angular/core';
import { Book } from '../../models/book.type';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { CharacterService } from '../../services/character.service';
import { Character } from '../../models/character.type';
import _, { max } from 'lodash';
import { SearchResult } from '../../models/search-result.type';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css',
})
export class BookDetailsComponent {
  id!: number;
  book!: Book;
  characters!: Character[];

  currentPageOfNamedCharacters: number = 0;
  currentPageOfPOVCharacters: number = 0;

  maxPageNamedCharacters: number = 0;
  maxPagePovCharacters: number = 0;

  pageSizeNamedCharacters: number = 5; // Number of characters per page
  pageSizePOVCharacters: number = 5; // Number of POV characters per page

  pagedNamedCharacterIds: number[] = []; // Array to hold paginated character ids
  pagedPOVCharacterIds: number[] = []; // Array to hold paginated POV character ids

  NamedCharacterIds: number[] = [];
  POVCharacterIds: number[] = [];

  NamedCharacterNames: Observable<string>[] = [];
  POVCharacterNames: Observable<string>[] = [];

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
    this.maxPageNamedCharacters = Math.ceil(
      this.book.characterids.length / this.pageSizeNamedCharacters
    );
    this.maxPagePovCharacters = Math.ceil(
      this.book.povCharactersids.length / this.pageSizePOVCharacters
    );
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
  // Method to paginate POV characters
  pagePOVCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pageSizePOVCharacters = event.pageSize;
    this.pagedPOVCharacterIds = this.book.povCharactersids.slice(
      startIndex,
      endIndex
    );

    const currentPagePOVMemberIds = this.POVCharacterIds.slice(
      startIndex,
      endIndex
    );
    this.POVCharacterNames = this.loadPovCharacterArray(
      currentPagePOVMemberIds
    );
    this.currentPageOfPOVCharacters = event.pageIndex;
    this.maxPagePovCharacters =
      Math.ceil(this.POVCharacterIds.length / event.pageSize) - 1;
  }

  pageNamedCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pageSizeNamedCharacters = event.pageSize;
    this.pagedNamedCharacterIds = this.book.characterids.slice(
      startIndex,
      endIndex
    );

    const currentPageNamedMemberIds = this.NamedCharacterIds.slice(
      startIndex,
      endIndex
    );
    this.NamedCharacterNames = this.loadNamedCharacterArray(
      currentPageNamedMemberIds
    );
    this.currentPageOfNamedCharacters = event.pageIndex;
    this.maxPageNamedCharacters =
      Math.ceil(this.NamedCharacterIds.length / event.pageSize) - 1;
  }

  getCharacters() {
    this.characterService
      .getCharacters()
      .subscribe((r) => (this.characters = r.results));
  }

  getCharacterName(id: number): Observable<string> {
    return this.characterService.getCharacterName(id);
  }

  private loadNamedCharacterArray(
    characterIds: number[]
  ): Observable<string>[] {
    return this.NamedCharacterIds.map((id) => this.getCharacterName(id));
  }
  private loadPovCharacterArray(characterIds: number[]): Observable<string>[] {
    return this.POVCharacterIds.map((id) => this.getCharacterName(id));
  }

  updatePagedPOVCharacterIds() {
    const startIndex =
      this.currentPageOfPOVCharacters * this.pageSizePOVCharacters;
    const endIndex = Math.min(
      startIndex + this.pageSizePOVCharacters,
      this.POVCharacterIds.length
    );

    const currentPagePOVMemberIds = this.POVCharacterIds.slice(
      startIndex,
      endIndex
    );

    this.POVCharacterNames = this.loadPovCharacterArray(
      currentPagePOVMemberIds
    );
    this.pagedPOVCharacterIds = currentPagePOVMemberIds;
  }
  updatePagedNamedCharacterIds() {
    const startIndex =
      this.currentPageOfNamedCharacters * this.pageSizeNamedCharacters;
    const endIndex = Math.min(
      startIndex + this.pageSizePOVCharacters,
      this.NamedCharacterIds.length
    );

    const currentPageNamedMemberIds = this.POVCharacterIds.slice(
      startIndex,
      endIndex
    );

    this.POVCharacterNames = this.loadPovCharacterArray(
      currentPageNamedMemberIds
    );
    this.pagedPOVCharacterIds = currentPageNamedMemberIds;
  }
}
