import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

export class PreviewImage {
    
    public getUploadedImages(value) {
        console.log(value);
        let imageMasonry = [];

        for (let i = 1; i <= value.length; i += 2) {

                    if(value[i]){

                        imageMasonry.push([
                            {
                                columns: [ 
                                    { 
                                        stack: [
                                                    {
                                                        image: value[i-1].imageFile,
                                                        fit: [250, 280]
                                                        // maxwidth: 250,
                                                        // height:416,
                                                    },
                                                    {
                                                        text: value[i-1].imageCaption, 
                                                        style: 'testcaption',
                                                        margin: [ 0, 10, 0, 0 ],
                                                    }
                                        ],
                                        unbreakable: true,
                                    },
                                    { 
                                        stack: [
                                                    {
                                                        image: value[i].imageFile,
                                                        fit: [250, 280]
                                                        // maxwidth: 250,
                                                        // height:416,
                                                    },
                                                    {
                                                        text: value[i].imageCaption, 
                                                        style: 'testcaption',
                                                        margin: [ 0, 10, 0, 0 ],
                                                    }
                                        ],
                                        unbreakable: true,
           
                                    },    
                                ],
                                columnGap: 20,
                                margin: [ 0, 20, 0, 0 ],
                            },
    
                        ])

                    }else{

                            imageMasonry.push([
                                {
                                    columns: [ 
                                        {
                                            stack: [
                                                {
                                                    image: value[i-1].imageFile,
                                                    fit: [250, 280]
                                                    // maxwidth: 250,
                                                    // height:416,
                                                },
                                                {
                                                    text: value[i-1].imageCaption, 
                                                    style: 'testcaption',
                                                    margin: [ 0, 10, 0, 0 ],
                                                }
                                            ],
                                            unbreakable: true,
                                        }

                                    ],
                                    columnGap: 20,
                                    margin: [ 0, 20, 0, 0 ],
                                },
                            ])
                    }
        }
        return imageMasonry;
    }
}