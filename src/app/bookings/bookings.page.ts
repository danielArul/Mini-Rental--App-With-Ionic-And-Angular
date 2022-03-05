import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PlacesService } from '../places/places.service';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading = false;
  private bookingSub: Subscription;

  constructor(private bookingService: BookingService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    })
  }

  onCancelBooking(bookingId:string, slidingEl: IonItemSliding){
    slidingEl.close();
    this.loadingCtrl.create({message: 'Cancelling...'}).then(loadingEl => {
      loadingEl.present();
    this.bookingService.cancelBooking(bookingId).subscribe(() => {
      loadingEl.dismiss();
      });
    });
    //cancel booking with id offerid
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(()=>{
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
      if(this.bookingSub){
        this.bookingSub.unsubscribe();
      }
  }

}
