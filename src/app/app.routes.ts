import { Routes } from '@angular/router';
import { AsoiafGuideComponent } from './components/asoiaf-guide/asoiaf-guide.component';
import { CharacterPageComponent } from './components/character-page/character-page.component';
import { HousePageComponent } from './components/house-page/house-page.component';
import { BookPageComponent } from './components/book-page/book-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AsoiafGuideComponent },
  { path: 'characters', component: CharacterPageComponent },
  { path: 'characters/:id', component: CharacterPageComponent },
  { path: 'houses', component: HousePageComponent },
  { path: 'houses/:id', component: HousePageComponent },
  { path: 'books', component: BookPageComponent },
  { path: 'books/:id', component: BookPageComponent },
  { path: '**', component: PageNotFoundComponent },
];
