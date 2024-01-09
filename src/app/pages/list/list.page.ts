import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AsyncPipe } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { addIcons } from 'ionicons';
import { female, help, male } from 'ionicons/icons';
import { CharacterResult, Gender } from '../../services/interfaces';
import {
  InfiniteScrollCustomEvent,
  SearchbarCustomEvent,
} from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonIcon,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSearchbar,
    IonToast,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ListPage implements OnInit {
  private readonly _charactersService = inject(CharacterService);

  readonly characters: CharacterResult[] = [];
  readonly loadingArray: number[] = new Array(20).fill(0);
  currentPage = 1;
  currentSearch = '';
  lastPage = 1;
  infiniteLoadingDisabled = false;
  loading = false;
  showFetchingError = false;
  showNoResultsError = false;
  showNoMoreCharactersError = false;

  constructor() {
    addIcons({
      male,
      female,
      help,
    });
  }

  ngOnInit() {
    this.loading = true;
    this._fetchMoreCharacters();
  }

  protected readonly Gender = Gender;

  loadNextPage(event: InfiniteScrollCustomEvent) {
    this._fetchMoreCharacters(event);
  }

  searchCharacters(event: SearchbarCustomEvent) {
    this.currentSearch = event.detail.value ?? '';
    this.loading = true;
    this.currentPage = 1;
    this.infiniteLoadingDisabled = false;
    this._charactersService
      .getCharacters(this.currentPage, this.currentSearch)
      .subscribe({
        next: (apiResult) => {
          this.lastPage = apiResult.info.pages;
          this.currentPage++;
          this.characters.splice(
            0,
            this.characters.length,
            ...apiResult.results,
          );
          this.loading = false;
        },
        error: (err) => {
          if (err.status === 404) {
            this.characters.splice(0, this.characters.length);
          }
          this.loading = false;
        },
      });
  }

  private _fetchMoreCharacters(event?: InfiniteScrollCustomEvent) {
    this._charactersService
      .getCharacters(this.currentPage, this.currentSearch)
      .subscribe({
        next: (apiResult) => {
          this.lastPage = apiResult.info.pages;
          this.currentPage++;
          this.characters.push(...apiResult.results);
          this.loading = false;
          event?.target.complete();
        },
        error: (err) => {
          this.showFetchingError = true;
          this.loading = false;
          if (err.status === 404) {
            this.infiniteLoadingDisabled = true;
            this.showNoMoreCharactersError = true;
          } else {
            this.showFetchingError = true;
          }
          event?.target.complete();
        },
      });
  }
}
