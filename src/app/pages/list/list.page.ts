import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AsyncPipe } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { addIcons } from 'ionicons';
import { female, help, male } from 'ionicons/icons';
import {
  CharacterApiResult,
  CharacterResult,
  Gender,
} from '../../services/interfaces';
import {
  BehaviorSubject,
  delay,
  iif,
  map,
  of,
  scan,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  ],
})
export class ListPage {
  private readonly _charactersService = inject(CharacterService);

  readonly loadingArray = new Array(20).fill(1);

  private readonly _currentPage$$ = new BehaviorSubject<number>(1);
  readonly currentPage$ = this._currentPage$$.asObservable();

  private readonly _lastPage$$ = new BehaviorSubject<number>(1);
  readonly lastPage$ = this._lastPage$$.asObservable();

  private readonly _infiniteLoadingEvent$$ =
    new BehaviorSubject<InfiniteScrollCustomEvent | null>(null);
  readonly infiniteLoadingEvent$ = this._infiniteLoadingEvent$$.asObservable();

  private readonly _infiniteLoadingDisabled$$ = new BehaviorSubject<boolean>(
    false,
  );
  readonly infiniteLoadingDisabled$ =
    this._infiniteLoadingDisabled$$.asObservable();

  readonly charactersPerPage$ = this.currentPage$.pipe(
    delay(550),
    withLatestFrom(this.lastPage$),
    tap(([currentPage, lastPage]) =>
      currentPage === 1 && currentPage <= lastPage
        ? this._loading$$.next(true)
        : null,
    ),
    switchMap(([currentPage, lastPage]) =>
      iif(
        () => currentPage <= lastPage,
        this._charactersService.getCharacters(currentPage),
        of(null).pipe(tap(() => this._infiniteLoadingDisabled$$.next(true))),
      ),
    ),
    withLatestFrom(this.infiniteLoadingEvent$),
    tap(([result, event]) => {
      event?.target.complete();
      this._loading$$.next(false);
      if (result) {
        this._lastPage$$.next(result.info.pages);
      }
    }),
    map(([result]) => result?.results),
  );

  readonly characters$ = this.charactersPerPage$.pipe(
    scan(
      (characters, charactersPage) =>
        charactersPage ? characters.concat(charactersPage) : characters,
      [] as CharacterResult[],
    ),
  );

  private readonly _loading$$ = new BehaviorSubject<boolean>(true);
  readonly loading$ = this._loading$$.asObservable();
  constructor() {
    addIcons({
      male,
      female,
      help,
    });
  }

  protected readonly Gender = Gender;

  loadNextPage(event: InfiniteScrollCustomEvent) {
    this._infiniteLoadingEvent$$.next(event);
    this._currentPage$$.next(this._currentPage$$.value + 1);
  }
}
