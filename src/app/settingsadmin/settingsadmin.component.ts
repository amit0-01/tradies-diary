import { Component, OnInit, Renderer2, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import { DatasourceService } from '../services/datasource.service';
import { PdfImage } from '../services/pdf-image';

import { Observable, Observer } from 'rxjs';
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
import {MatChipInputEvent} from '@angular/material/chips';
import {ActivatedRoute, Params, Router} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { RoleChecker } from '../services/role-checker.service';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import {  first, reduce, map, finalize  } from 'rxjs/operators';
import imageCompression from 'browser-image-compression';

declare const $: any;

@Component({
  selector: 'app-settingsadmin',
  templateUrl: './settingsadmin.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class SettingsAdminComponent implements OnInit {

    editForm: FormGroup;
    public emailData;

    visible: boolean = true;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    separatorKeysCodes = [ENTER, COMMA];
    public imageURLRaw;
    public imageURL;
    accountFirebase;

    currentWebWorker: true
    maxSizeMB: number = 1
    maxWidthOrHeight: number = 1024

    showColourHover = false;
    showColourHighlight = false;
    showEnabledButton = false;
    showHoveredButton = false;

    adminData;

    colorBtnDefault;

    currentPopColour;

    @ViewChild('colourHover') colourHover: ElementRef;
    @ViewChild('popColourHover') popColourHover: ElementRef;

    @ViewChild('colourHighlight') colourHighlight: ElementRef;
    @ViewChild('popColourHighlight') popColourHighlight: ElementRef;

    @ViewChild('colourEnabledButton') colourEnabledButton: ElementRef;
    @ViewChild('popColourEnabledButton') popColourEnabledButton: ElementRef;

    @ViewChild('colourHoveredButton') colourHoveredButton: ElementRef;
    @ViewChild('popColourHoveredButton') popColourHoveredButton: ElementRef;

    constructor(
        private data_api: DatasourceService,
        private spinnerService: NgxSpinnerService,
        public authService: AuthenticationService,
        private formBuilder: FormBuilder,
        private pdfImage: PdfImage,
        public datepipe: DatePipe,
        private rolechecker: RoleChecker,
        private afStorage: AngularFireStorage,
        private renderer: Renderer2
    ) {
        this.renderer.listen('window', 'click',(e:Event)=>{
            /**
             * Only run when toggleButton is not clicked
             * If we don't check this, all clicks (even on the toggle button) gets into this
             * section which in the result we might never see the menu open!
             * And the menu itself is checked here, and it's where we check just outside of
             * the menu and button the condition abbove must close the menu
             */
            if( e.target !== this.colourHover.nativeElement && e.target!==this.popColourHover.nativeElement && !this.popColourHover.nativeElement.contains(e.target)){
                this.showColourHover = false;
            }
            if( e.target !== this.colourHighlight.nativeElement && e.target!==this.popColourHighlight.nativeElement && !this.popColourHighlight.nativeElement.contains(e.target)){
                this.showColourHighlight = false;
            }
            if( e.target !== this.colourEnabledButton.nativeElement && e.target!==this.popColourEnabledButton.nativeElement && !this.popColourEnabledButton.nativeElement.contains(e.target)){
                this.showEnabledButton = false;
            }
            if( e.target !== this.colourHoveredButton.nativeElement && e.target!==this.popColourHoveredButton.nativeElement && !this.popColourHoveredButton.nativeElement.contains(e.target)){
                this.showHoveredButton = false;
            }

       });

     }

    public ngOnInit() {
        this.rolechecker.check(4)
        this.editForm = this.formBuilder.group({
            adminEmail : ['', Validators.required],
            logo: '',
            pdfCompanyName: '',
            pdfPhone: '',
            pdfMobile: '',
            pdfEmail: '',
            pdfAddress: '',
            emailSignature: '',
            textSignature: '',
            colourHover:'',
            colourHighlight:'',
            colourEnabledButton:'',
            colourHoveredButton:'',
            // emailTo: this.formBuilder.array([]),
            // emailCC: this.formBuilder.array([]),
            // emailBCC: this.formBuilder.array([]),
            // projectReqestRecepient: this.formBuilder.array([]),
        });

        // this.getEmailSettings();
        this.getAdminSettings();
        
        this.accountFirebase = this.data_api.getCurrentProject();
    }

    textChanged($event) {
        if ($event.editor.getLength() > 500) {
            $event.editor.deleteText(500, $event.editor.getLength());
        }
    }

    onButtonEnter(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
        console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    getAdminSettings(){
        this.spinnerService.show();
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';

            if(data){
              if(data.adminEmail){
                this.editForm.patchValue({
                    adminEmail: data.adminEmail,
                });
              }

              if(data.pdfCompanyName){
                this.editForm.patchValue({
                    pdfCompanyName: data.pdfCompanyName,
                });
              }

              if(data.pdfPhone){
                this.editForm.patchValue({
                    pdfPhone: data.pdfPhone,
                });
              }

              if(data.pdfMobile){
                this.editForm.patchValue({
                    pdfMobile: data.pdfMobile,
                });
              }

              if(data.pdfEmail){
                this.editForm.patchValue({
                    pdfEmail: data.pdfEmail,
                });
              }

              if(data.pdfAddress){
                this.editForm.patchValue({
                    pdfAddress: data.pdfAddress,
                });
              }

              if(data.textSignature){
                this.editForm.patchValue({
                    textSignature: data.textSignature,
                });
              }

              if(data.emailSignature){
                this.editForm.patchValue({
                    emailSignature: data.emailSignature,
                });
              }

              if(data.colourHover){
                this.editForm.patchValue({
                    colourHover: data.colourHover,
                });
              }else{
                this.editForm.patchValue({
                    colourHover: '#F44336',
                });
              }

              if(data.colourHighlight){
                this.editForm.patchValue({
                    colourHighlight: data.colourHighlight,
                });
              }else{
                this.editForm.patchValue({
                    colourHighlight: '#0771DE',
                });
              }

              if(data.colourEnabledButton){
                this.editForm.patchValue({
                    colourEnabledButton: data.colourEnabledButton,
                });
              }else{
                this.editForm.patchValue({
                    colourEnabledButton: '#070707',
                });
              }

              if(data.colourHoveredButton){
                this.editForm.patchValue({
                    colourHoveredButton: data.colourHoveredButton,
                });
              }else{
                this.editForm.patchValue({
                    colourHoveredButton: '#ADADAD',
                });
              }



              if(data.logo){
                this.getBase64ImageFromURL(data.logo).subscribe((base64Data: string) => {   
                    this.imageURL = base64Data;
                    this.imageURLRaw = base64Data;
                });
              }

              

            }
            this.spinnerService.hide();
        }); 
    }

    getImage(imageUrl: string) {
        this.getBase64ImageFromURL(imageUrl).subscribe((base64Data: string) => {
          // this.base64TrimmedURL = base64Data;
          // this.createBlobImageFileAndShow();
          return base64Data;
        });
    }
  
    getBase64ImageFromURL(url: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
          // create an image object
          let img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = url;
          if (!img.complete) {
            // This will call another method that will create image from url
            img.onload = () => {
              observer.next(this.getBase64Image(img));
              observer.complete();
            };
            img.onerror = err => {
              observer.error(err);
            };
          } else {
            observer.next(this.getBase64Image(img));
            observer.complete();
          }
        });
      }
  
      getBase64Image(img: HTMLImageElement): string {
        // We create a HTML canvas object that will create a 2d image
        var canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        // This will draw image
        ctx.drawImage(img, 0, 0);
        // Convert the drawn image to Data URL
        let dataURL: string = canvas.toDataURL("image/png");
        return dataURL;
        // this.base64DefaultURL = dataURL;
        // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
      }

    hideColourPopUp(){
        this.showColourHover = false;
        this.showColourHighlight = false;
        this.showEnabledButton = false;
        this.showHoveredButton = false;
    }
          
    changeColourHover(event){
        this.editForm.patchValue({
            colourHover: event.color.hex
        }); 
    }

    changeColourHighlight(event){
        this.editForm.patchValue({
            colourHighlight: event.color.hex
        }); 
    }

    changeColourEnabledButton(event){
        this.editForm.patchValue({
            colourEnabledButton: event.color.hex
        });           
    }

    changeColourHoveredButton(event){
        this.editForm.patchValue({
            colourHoveredButton: event.color.hex
        }); 
    }

    selectColour(event){
        var target = event.target || event.srcElement || event.currentTarget;
        var elementId = target.attributes.id.nodeValue;
        
        if(elementId == 'colourHover'){
            this.showColourHover = true;
            this.currentPopColour = this.editForm.value.colourHover;
        }else if(elementId == 'colourHighlight'){
            this.showColourHighlight = true;
            this.currentPopColour =  this.editForm.value.colourHighlight;;
        }else if(elementId == 'colourEnabledButton'){
            this.showEnabledButton = true;
            this.currentPopColour =  this.editForm.value.colourEnabledButton;;
        }else if(elementId == 'colourHoveredButton'){
            this.showHoveredButton = true;
            this.currentPopColour =  this.editForm.value.colourHoveredButton;;
        }
        
    }

    public savestep1(){

        if (this.editForm.invalid) {

            swal.fire({
                title: "Please fill required fields!",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })
    
            return;
        } 

        if( (this.imageURL != this.imageURLRaw) ){
            console.log('with Logo');
            this.savestep2();
        }else{
            console.log('Without Logo');
            this.updateWithoutLogo();
        }
    }

    // public savestep1Old(){
    //     if( (this.editForm.controls.adminEmail.dirty == true)  && (this.imageURL != this.imageURLRaw) ){
    //         console.log('both');
    //         this.savestep2();
    //     }else if( (this.editForm.controls.adminEmail.dirty == true)  && (this.imageURL == this.imageURLRaw) ){
    //         console.log('admin email only');
    //         this.updateFBEmailSettings();
    //     }else if( (this.editForm.controls.adminEmail.dirty != true)  && (this.imageURL != this.imageURLRaw) ){
    //         console.log('logo only');
    //         this.updateFBLogoSettings1();
    //     }else{
    //         swal.fire({
    //             title: "No changes detected.",
    //             // text: "You clicked the button!",
    //             buttonsStyling: false,
    //             customClass: {
    //                 confirmButton: 'btn btn-success',
    //             },
    //             icon: "error"
    //         })
    //     }

    // }

    public savestep2(){
        this.spinnerService.show();

        let base64image = this.imageURL;
        let id = Math.random().toString(36).substring(2);
        let ref = this.afStorage.ref(this.accountFirebase+'/admin/logo.png');
        //let base64String = base64image.split(',').pop();
        let task = ref.putString(base64image, 'data_url');
        let _percentage$ = task.percentageChanges();

        task.snapshotChanges().pipe(
            finalize(() => {
              ref.getDownloadURL().subscribe((url) => {
                console.log(url); 
                this.editForm.patchValue({
                    logo: url
                });
                this.savestep3();
                //this.downloadURLs = this.downloadURLs.concat([url]);
                //imageDone = imageDone + 1;
                //if(imageDone == imageLen){
                  //this.progressOverlay.hide();
                  //this.saveStep3();
                //} 
              });
        })).subscribe();

    }

    public updateWithoutLogo(){

        this.data_api.updateFBAdminSettingsWithoutLogo(this.editForm.value).then(() => {
            console.log('Updated successfully!');
            this.spinnerService.hide();

           swal.fire({
                title: "Admin Settings Updated",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-success',
                },
                icon: "success"
            })

            setTimeout(() => {
                window.location.reload();
            }, 1000); 

        });
    }

    public savestep3(){

        this.data_api.updateFBAdminSettingsWithLogo(this.editForm.value).then(() => {
            console.log('Updated successfully!');
            this.spinnerService.hide();

           swal.fire({
                title: "Admin Settings Updated",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-success',
                },
                icon: "success"
            })

            setTimeout(() => {
                window.location.reload();
            }, 1000); 

        });
    }

    // public updateFBEmailSettings() {

    //     console.log(this.editForm.value);


    //     this.spinnerService.show();

    //     this.data_api.updateFBAdminSettingsEmailOnly(this.editForm.value.adminEmail).then(() => {
    //         console.log('Updated successfully!');
    //         this.spinnerService.hide();

    //         swal.fire({
    //             title: "Admin Email Settings Updated",
    //             // text: "You clicked the button!",
    //             buttonsStyling: false,
    //             customClass: {
    //                 confirmButton: 'btn btn-success',
    //             },
    //             icon: "success"
    //         })

    //         setTimeout(() => {
    //             window.location.reload();
    //         }, 1000); 

    //     });
    // }

    // public updateFBLogoSettings1() {
    //     // if (this.editForm.invalid) {
    //     //     alert('invalid');
    //     //     return;
    //     // }

    //     console.log(this.editForm.value);


    //     this.spinnerService.show();

    //     let base64image = this.imageURL;
    //     let id = Math.random().toString(36).substring(2);
    //     let ref = this.afStorage.ref(this.accountFirebase+'/admin/logo');
    //     //let base64String = base64image.split(',').pop();
    //     let task = ref.putString(base64image, 'data_url');
    //     let _percentage$ = task.percentageChanges();

    //     task.snapshotChanges().pipe(
    //         finalize(() => {
    //           ref.getDownloadURL().subscribe((url) => {
    //             console.log(url); 
    //             this.editForm.patchValue({
    //                 logo: url
    //             });
    //             this.updateFBLogoSettings2();
    //             //this.downloadURLs = this.downloadURLs.concat([url]);
    //             //imageDone = imageDone + 1;
    //             //if(imageDone == imageLen){
    //               //this.progressOverlay.hide();
    //               //this.saveStep3();
    //             //} 
    //           });
    //     })).subscribe();
    // }

    // public updateFBLogoSettings2() {
    //     this.data_api.updateFBAdminSettingsLogoOnly(this.editForm.value.logo).then(() => {
    //         console.log('Updated successfully!');
    //         this.spinnerService.hide();

    //        swal.fire({
    //             title: "Account Logo Settings Updated",
    //             // text: "You clicked the button!",
    //             buttonsStyling: false,
    //             customClass: {
    //                 confirmButton: 'btn btn-success',
    //             },
    //             icon: "success"
    //         })

    //         setTimeout(() => {
    //             window.location.reload();
    //         }, 1000); 

    //     });
    // }

    // public updateEmailSettings() {

    //     if (this.editForm.invalid) {
    //         alert('invalid');
    //         return;
    //     }

    //     console.log(this.editForm.value);


    //     this.spinnerService.show();

    //     this.data_api.updateEmailSettings(this.editForm.value)
    //         .subscribe(
    //             (result) => {
    //                 console.log(result);
    //             if(result){

    //                 swal.fire({
    //                     title: "Admin Email Settings Updated",
    //                     // text: "You clicked the button!",
    //                     buttonsStyling: false,
    //                     customClass: {
    //                         confirmButton: 'btn btn-success',
    //                     },
    //                     icon: "success"
    //                 })

    //                 this.spinnerService.hide();

    //             }else{
    //                 swal.fire({
    //                     title: "Error in Updating Admin Email Settings",
    //                     // text: "You clicked the button!",
    //                     buttonsStyling: false,
    //                     customClass: {
    //                         confirmButton: 'btn btn-success',
    //                     },
    //                     icon: "error"
    //                 })

    //             }
    //         },
    //         (error) => {
    //             console.log(error)
    //             swal.fire({
    //                 title: error.error.message,
    //                 // text: "You clicked the button!",
    //                 buttonsStyling: false,
    //                 customClass: {
    //                     confirmButton: 'btn btn-success',
    //                 },
    //                 icon: "error"
    //             })
                
    //         }
            
    //         );   

    // }

    async onFileChange(event) {

        if(event.target.files && event.target.files.length) {
      
            const imageFile = event.target.files[0];
              
            //   var options = {
            //     maxSizeMB: this.maxSizeMB,
            //     maxWidthOrHeight: 500,
            //     useWebWorker: this.currentWebWorker,
            //     maxIteration: 50,
            //     onProgress: (p) => {
            //       this.spinnerService.show();
            //       if(p == 100){
            //         this.spinnerService.hide();
            //       }
            //     }
            //   }
      
            //   console.log(imageFile);
      
            //   // Crop Lnadscape images and convert to base64
            //   const imageCropped = await this.fileListToBase64(event.target.files);
      
            //   // Convert Base64 to File
             
            //   console.log(imageCropped);
      
              // Convert Base64 to File
            //   const compressedFiles = await  Promise.all(
            //     imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
            //   )
            //const imageFiles = Array.from(event.target.files);
            //const imageFile = event.target.files[0];
              // Compress File
            //   const compressedFile = await  Promise.all(
            //     await imageFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
            //   )
      
              let reader = new FileReader();
      
              reader.onload = () => {
      
                //   this.editForm.patchValue({
                //     imageFile: reader.result,
                //   });
                  
                this.imageURL = reader.result;
                console.log(reader.result);
              }
              reader.readAsDataURL(imageFile);
        }
      }
      
    addEmailTo(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const emailTo = this.editForm.get('emailTo') as FormArray;
            emailTo.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeEmailTo(index: number): void {
        const emailTo = this.editForm.get('emailTo') as FormArray;

        if (index >= 0) {
            emailTo.removeAt(index);
        }
    }

    addEmailCC(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const emailCC = this.editForm.get('emailCC') as FormArray;
            emailCC.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeEmailCC(index: number): void {
        const emailCC = this.editForm.get('emailCC') as FormArray;

        if (index >= 0) {
            emailCC.removeAt(index);
        }
    }

    addEmailBCC(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const emailBCC = this.editForm.get('emailBCC') as FormArray;
            emailBCC.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeEmailBCC(index: number): void {
        const emailBCC = this.editForm.get('emailBCC') as FormArray;

        if (index >= 0) {
            emailBCC.removeAt(index);
        }
    }

    addProjectReqestRecepient(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const ProjectReqestRecepient = this.editForm.get('projectReqestRecepient') as FormArray;
            ProjectReqestRecepient.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeProjectReqestRecepient(index: number): void {
        const ProjectReqestRecepient = this.editForm.get('projectReqestRecepient') as FormArray;

        if (index >= 0) {
            ProjectReqestRecepient.removeAt(index);
        }
    }

}