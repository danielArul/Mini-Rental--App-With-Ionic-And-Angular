import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData{
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    // new Place(
    //   'p1',
    //   'Manhattan Mansion',
    //   'In the heart of New Yrok City',
    //   'https://image.shutterstock.com/image-photo/castle-fantasy-view-cloudy-foggy-260nw-1899760570.jpg',
    //   149.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'abc'
    // ),
    // new Place(
    //   'p2',
    //   'L\'Amour Toujours',
    //   'A romantic place in Paris',
    //   'https://media.gettyimages.com/photos/empty-pavement-with-modern-architecture-picture-id1207663571?s=612x612',
    //   189.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'abc'
    // ),
    // new Place(
    //   'p3',
    //   'The Foggy Palace',
    //   'Not your average trip',
    //   'https://cdn-com.cosentino.com/wp-content/uploads/2021/04/20201109_COSENTINO_COSENTINO-CITY-5971-LR-scaled-1.jpg',
    //   99.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'abc'
    // ),
  ]) ;

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces(){
    return this.http.get<{[key: string]: PlaceData}>('https://mini-rental-default-rtdb.firebaseio.com/offered-places.json').
    pipe(map(resData => {
      console.log("res",resData);
      const places = [];
      for(const key in resData){
        if(resData.hasOwnProperty(key)){
          places.push(new Place(key, resData[key].title, resData[key].description, resData[key].imageUrl, resData[key].price,
            new Date(resData[key].availableFrom),
            new Date(resData[key].availableTo),
            resData[key].userId,
            resData[key].location));
        }
      }
      return places;
    }),tap(places=> {
      this._places.next(places);
    }));
  }

  getPlace(id:string){
    return this.http.get<PlaceData>(`https://mini-rental-default-rtdb.firebaseio.com/offered-places/${id}.json`).
    pipe(map(placeData=>{
      return new Place(id, placeData.title, placeData.description, placeData.imageUrl, placeData.price,
         new Date(placeData.availableFrom), new Date(placeData.availableTo), placeData.userId,placeData.location);
    }));
  }

  addPlace(title: string, description: string, price: number, dateFrom : Date, dateTo: Date, location:PlaceLocation){
    let generatedId: string;
    const newPlace = new Place(Math.random.toString(), title, description,
    'https://cdn-com.cosentino.com/wp-content/uploads/2021/04/20201109_COSENTINO_COSENTINO-CITY-5971-LR-scaled-1.jpg', price,
    dateFrom, dateTo, this.authService.userId,location);
    console.log('This is the new place',newPlace);
    return this.http.post<{name: string}>('https://mini-rental-default-rtdb.firebaseio.com/offered-places.json', { ...newPlace, id:null })
    .pipe(
      switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),tap(places=>{
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );

    return this._places.pipe(take(1),delay(1000),tap(places =>{
      setTimeout(()=>{
        this._places.next(places.concat(newPlace));
      },1000)
    }));
  }

  updatePlace(placeId: string, title: string, description:string){
    let updatedPlaces: Place[];
     return this.places.pipe(take(1), switchMap(places => {
       if(!places || places.length <=0){
         return this.fetchPlaces();
       }
       else{
         return of(places);
       }

    }),
    switchMap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id, title, description, oldPlace.imageUrl,
      oldPlace.price, oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId, oldPlace.location);
      return this.http.put(`https://mini-rental-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,
        { ... updatedPlaces[updatedPlaceIndex], id: null}
      );
    }), tap(() => {
      this._places.next(updatedPlaces);
    })
    );
   }
}
