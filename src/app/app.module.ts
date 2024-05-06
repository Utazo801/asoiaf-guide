import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { routes } from './app.routes';

//Service classes
import { CharacterService } from './services/character.service';
import { HouseService } from './services/house.service';
import { BookService } from './services/book.service';
import { RouterModule } from '@angular/router';

//Components
import { AppComponent } from './app.component';
import { AsoiafGuideComponent } from './components/asoiaf-guide/asoiaf-guide.component';
import { CharacterPageComponent } from './components/character-page/character-page.component';
import { BookPageComponent } from './components/book-page/book-page.component';
import { HousePageComponent } from './components/house-page/house-page.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UserInputComponent } from './components/user-input/user-input.component';
import { CharacterDetailsComponent } from './components/character-details/character-details.component';
import { HouseDetailsComponent } from './components/house-details/house-details.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';

//Angular Material
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';
import { SearchService } from './services/search.service';
import { SearchResultsComponent } from './components/search-result/search-result.component';

@NgModule({
  imports: [
    HttpClientModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    MatToolbarModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatListModule,
    MatCardModule,
    MatPaginatorModule,
    MatTreeModule,
  ],
  declarations: [
    AppComponent,
    AsoiafGuideComponent,
    CharacterPageComponent,
    BookPageComponent,
    HousePageComponent,
    NavbarComponent,
    UserInputComponent,
    CharacterDetailsComponent,
    HouseDetailsComponent,
    BookDetailsComponent,
    SearchResultsComponent,
  ],
  providers: [
    CharacterService,
    HouseService,
    BookService,
    SearchService,

    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
