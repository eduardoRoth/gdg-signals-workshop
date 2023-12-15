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
  IonButtons,
  IonBadge,
} from '@ionic/angular/standalone';
import { AsyncPipe } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { addIcons } from 'ionicons';
import { female, help, male } from 'ionicons/icons';
import { CharacterResult, Gender } from '../../services/interfaces';
import {
  BehaviorSubject,
  Subject,
  delay,
  firstValueFrom,
  iif,
  map,
  of,
  scan,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { RouterLink } from '@angular/router';

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
    RouterLink,
    IonButtons,
    IonBadge,
  ],
})
export class ListPage {
  private readonly _charactersService = inject(CharacterService);

  readonly loadingArray = new Array(20).fill(1);

  private readonly _currentPage$$ = new BehaviorSubject<number>(1);
  readonly currentPage$ = this._currentPage$$.asObservable();

  private readonly _lastPage$$ = new BehaviorSubject<number>(1);
  readonly lastPage$ = this._lastPage$$.asObservable();

  private readonly _totalCharacters$$ = new Subject<number>();
  readonly totalCharacters$ = this._totalCharacters$$.asObservable();

  private readonly _infiniteLoadingEvent$$ =
    new BehaviorSubject<InfiniteScrollCustomEvent | null>(null);
  readonly infiniteLoadingEvent$ = this._infiniteLoadingEvent$$.asObservable();

  private readonly _infiniteLoadingDisabled$$ = new BehaviorSubject<boolean>(
    false
  );
  readonly infiniteLoadingDisabled$ =
    this._infiniteLoadingDisabled$$.asObservable();

  private readonly _loading$$ = new BehaviorSubject<boolean>(true);
  readonly loading$ = this._loading$$.asObservable();

  readonly charactersPerPage$ = this.currentPage$.pipe(
    // 1
    delay(350),
    withLatestFrom(this.lastPage$), // 1
    tap(([currentPage, lastPage]) =>
      currentPage === 1 && currentPage <= lastPage
        ? this._loading$$.next(true)
        : null
    ),
    switchMap(([currentPage, lastPage]) =>
      iif(
        () => currentPage <= lastPage,
        this._charactersService.getCharacters(currentPage),
        of(null).pipe(tap(() => this._infiniteLoadingDisabled$$.next(true)))
      )
    ),
    withLatestFrom(this.infiniteLoadingEvent$),
    tap(([result, event]) => {
      event?.target.complete();
      this._loading$$.next(false);
      if (result) {
        this._lastPage$$.next(result.info.pages);
        this._totalCharacters$$.next(result.info.count);
      }
    }),
    map(([result]) => result?.results)
  );

  readonly characters$ = this.charactersPerPage$.pipe(
    scan(
      (characters, charactersPage) =>
        charactersPage ? characters.concat(charactersPage) : characters,
      [] as CharacterResult[]
    )
  );

  readonly loadedCharacters$ = this.characters$.pipe(
    map((characters) => characters.length)
  );

  constructor() {
    addIcons({
      male,
      female,
      help,
    });
  }

  protected readonly Gender = Gender;

  async loadNextPage(event: InfiniteScrollCustomEvent) {
    this._infiniteLoadingEvent$$.next(event);
    this._currentPage$$.next(this._currentPage$$.value + 1);
  }
}
