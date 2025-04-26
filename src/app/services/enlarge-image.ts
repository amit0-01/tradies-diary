import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnlargeImage {

    public imgSrc;

    public enlargeImage(imgSrc) {
        
        this.imgSrc =imgSrc;
        console.log(this.imgSrc);
        
    }

}