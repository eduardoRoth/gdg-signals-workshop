import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterApiResult, CharacterResult } from './interfaces';
import { map } from 'rxjs';

const BASE_URL = 'https://rickandmortyapi.com/api/character';
@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private readonly _http = inject(HttpClient);
  constructor() {}

  getCharacters(page: number = 1, name='') {
    return this._http.get<CharacterApiResult>(`${BASE_URL}?page=${page}&name=${name}`);
  }

  getCharacter(id: number) {
    return this._http.get<CharacterResult>(`${BASE_URL}/${id}`);
  }
}
