import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'countries-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit{

  public countriesByRegion: SmallCountry[] = [];

  public borders: SmallCountry [] = [];

  public myForm:FormGroup = this.fb.group({
    region:['', Validators.required],
    country:['', Validators.required],
    border:['', Validators.required],
  })

  constructor(
    private fb:FormBuilder,
    private countriesService:CountriesService
  ){}

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChanged();
  }

  get regions():Region[] {
    return this.countriesService.regions;
  }


  public onRegionChange():void{
    this.myForm.get('region')!.valueChanges
    .pipe(
      tap(() => this.myForm.get('country')?.setValue('')),
      tap(() => this.borders = []),
      //recibe el valor de un observable y se suscribe a otro
      switchMap(region => this.countriesService.getCountriesByRegion(region))
    )
    .subscribe(countries => {
      this.countriesByRegion = countries.sort((c1,c2)=>c1.name.localeCompare(c2.name));
    })
  }

  public onCountryChanged(){
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap(()=> this.myForm.get('border')?.setValue('')),
      tap(() => this.borders = []),
      //si la condición se cumple continua con los demás operadores
      filter( (value:string) => value.length > 0),
      //recibe el valor de un observable y se suscribe a otro
      switchMap((alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode)),
      switchMap((country) => this.countriesService.getCountryBordersByCodes(country.borders))
    )
    .subscribe(country => {
      this.borders = country;
    })
  }

}
