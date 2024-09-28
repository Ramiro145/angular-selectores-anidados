import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl = 'https://restcountries.com/v3.1'

  private _regions:Region[] = [Region.Africa, Region.Americas, Region.Europe, Region.Asia,Region.Oceania];

  constructor(
    //necesario que este al mismo nivel que el servicio,
    //por lo que se importa en el app module
    private http:HttpClient
  ) { }

  get regions():Region[] {
    return structuredClone(this._regions);
  }

  getCountriesByRegion(region:Region):Observable<SmallCountry[]>{

    if(!region) return of([]);

    const url = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        //transformar lo que parece un Country a SmallCountry
        map(countries => countries.map(country => ({
          name:country.name.common,
          cca3:country.cca3,
          //El operador de coalescencia nula
          borders:country.borders ?? []
        })))
      );

  }

  getCountryByAlphaCode(alphaCode:string):Observable<SmallCountry>{
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>(url)
      .pipe(
        map(country => {
          return {
            name: country.name.common,
            cca3: country.cca3,
            borders: country.borders ?? []
          }
        })
      )
  }

  getCountryBordersByCodes(borders:string[]): Observable<SmallCountry[]>{
    if(!borders || borders.length === 0) return of([]);

    const countriesRequest:Observable<SmallCountry>[]= [];

    borders.forEach(code => {

      const request = this.getCountryByAlphaCode(code);
      countriesRequest.push(request);

    });


    //cuando sea llamado va a emitir hasta que todos los observables
    //dentro del arreglo emitan un valor
    return combineLatest(countriesRequest);
  }

}
