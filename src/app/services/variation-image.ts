import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import htmlToPdfmake from 'html-to-pdfmake';

@Injectable({
    providedIn: 'root'
  })

export class VariationImage {
    
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
                                                        image: value[i-1].itemImage,
                                                        fit: [250, 280]
                                                        // maxwidth: 250,
                                                        // height:416,
                                                    },
                                                    {
                                                        text: htmlToPdfmake(value[i-1].imageCaption), 
                                                        style: 'testcaption',
                                                        margin: [ 0, 10, 0, 0 ],
                                                    }
                                        ],
                                        unbreakable: true,
                                    },
                                    { 
                                        stack: [
                                                    {
                                                        image: value[i].itemImage,
                                                        fit: [250, 280]
                                                        // maxwidth: 250,
                                                        // height:416,
                                                    },
                                                    {
                                                        text: htmlToPdfmake(value[i].imageCaption), 
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
                                                    image: value[i-1].itemImage,
                                                    fit: [250, 280]
                                                    // maxwidth: 250,
                                                    // height:416,
                                                },
                                                {
                                                    text: htmlToPdfmake(value[i-1].imageCaption), 
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