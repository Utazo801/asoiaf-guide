import { Routes } from '@angular/router';
import { AsoiafGuideComponent } from './components/asoiaf-guide/asoiaf-guide.component';
import { CharacterPageComponent } from './components/character-page/character-page.component';
import { HousePageComponent } from './components/house-page/house-page.component';
import { BookPageComponent } from './components/book-page/book-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CharacterDetailsComponent } from './components/character-details/character-details.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { HouseDetailsComponent } from './components/house-details/house-details.component';
import { SearchResultsComponent } from './components/search-result/search-result.component';

export const routes: Routes = [
  { path: '', component: AsoiafGuideComponent },
  { path: 'characters', component: CharacterPageComponent },
  { path: 'characters/:id', component: CharacterDetailsComponent },
  { path: 'houses', component: HousePageComponent },
  { path: 'houses/:id', component: HouseDetailsComponent },
  { path: 'books', component: BookPageComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: '**', component: PageNotFoundComponent },
];
