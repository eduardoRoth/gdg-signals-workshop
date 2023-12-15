import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import {
  CharacterApiResult,
  CharacterResult,
  Gender,
} from '../../services/interfaces';
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
export class ListSignalPage {
  private readonly _charactersService = inject(CharacterService);

  private readonly _personajes = signal<CharacterResult[]>([]);
  readonly personajes = this._personajes.asReadonly();

  readonly totalPersonajesCargados = computed(() => this.personajes().length);

  private readonly _totalPersonajes = signal<number>(0);
  readonly totalPersonajes = this._totalPersonajes.asReadonly();

  private readonly _cargando = signal<boolean>(true);
  readonly cargando = this._cargando.asReadonly();

  private readonly _eventoCarga = signal<InfiniteScrollCustomEvent | null>(
    null
  );

  private readonly _loadingArray = signal<number[]>(Array(20));
  readonly loadingArray = this._loadingArray.asReadonly();

  private readonly _paginaActual = signal<number>(1);
  readonly paginaActual = this._paginaActual.asReadonly();

  private readonly _paginaFinal = signal<number>(1);
  readonly paginaFinal = this._paginaFinal.asReadonly();

  private readonly _cargarMas = signal<boolean>(true);
  readonly cargarMas = this._cargarMas.asReadonly();

  constructor() {
    addIcons({
      male,
      female,
      help,
    });
    effect(async () => {
      const paginaActual = this.paginaActual();
      untracked(() => this._cargando.set(true));
      try {
        const resultadoPagina: CharacterApiResult = await firstValueFrom(
          this._charactersService.getCharacters(paginaActual)
        );

        this._personajes.update((personajes) =>
          [...personajes].concat(resultadoPagina.results)
        );
        this._paginaFinal.set(resultadoPagina.info.count);
      } catch (err) {
        this._cargarMas.set(false);
      } finally {
        this._cargando.set(false);
        this._eventoCarga()?.target.complete();
      }
    });
  }

  protected readonly Gender = Gender;

  async loadNextPage(event: InfiniteScrollCustomEvent) {
    this._eventoCarga.set(event);
    this._paginaActual.update((paginaActual) => ++paginaActual);
  }
}
