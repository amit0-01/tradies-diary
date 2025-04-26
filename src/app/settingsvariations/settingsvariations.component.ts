import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject} from '@angular/core';
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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

declare const $: any;

@Component({
  selector: 'app-settingsvariations',
  templateUrl: './settingsvariations.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class SettingsVariationsComponent implements OnInit {

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

    projectList:any = [];
    hiProjVarNo = 0;

    prevVarNumber;
    
    adminData;

    colorBtnDefault;

    colorHlightDefault;

    constructor(
        private data_api: DatasourceService,
        private spinnerService: NgxSpinnerService,
        public authService: AuthenticationService,
        private formBuilder: FormBuilder,
        private pdfImage: PdfImage,
        public datepipe: DatePipe,
        private rolechecker: RoleChecker,
        private afStorage: AngularFireStorage,
        public dialog: MatDialog,
    ) { }

    public ngOnInit() {
        this.rolechecker.check(4)
        this.editForm = this.formBuilder.group({
            varEmailRecipient : ['', Validators.required],
            varDefaultOpening : '',
            varDefaultClosing : '',
            varSetJobNum: '',
            varSetCode : '',
            // varSetStartNumber: '',
            bmLineitem : '',
            bmTotalFigure : '',
            bmHideAll : '',
            qtyHideAll : '',
            unitHideAll : '',
            unitCostHideAll : '',
            gstHideAll : '',
            itemTotalHideAll : ''
            // logo: ['', Validators.required],
            // pdfCompanyName: '',
            // emailTo: this.formBuilder.array([]),
            // emailCC: this.formBuilder.array([]),
            // emailBCC: this.formBuilder.array([]),
            // projectReqestRecepient: this.formBuilder.array([]),
        });

        // this.getEmailSettings();
        this.getVariationSettings();
        this.getAdminSettings();
        this.getFBProjects();

        this.accountFirebase = this.data_api.getCurrentProject();
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
            this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    getFBProjects(): void {
      this.data_api.getFBProjects().subscribe(data => {
        console.log(data);
  
          if(data){

            data.forEach(data =>{ 
                if(data.counterVariation){
                  this.projectList.push({
                      projectName: data.projectName,
                      counterVariation: data.counterVariation
                  });
                }else{
                  this.projectList.push({
                    projectName: data.projectName,
                    counterVariation: 0
                });
                }

            })

            this.projectList.sort((a, b) => {
              return b.counterVariation - a.counterVariation;
            });

            this.hiProjVarNo = this.projectList[0].counterVariation ? this.projectList[0].counterVariation: 0;
            console.log(this.projectList);
          }

      });
    }


    checkGlobalBooleanVariationSettings(value){
        if( ((value == true) || (value == false)) && (value !== '') ){
          return true;
        }else{
          return false;
        }
    }

    getVariationSettings(){
        this.spinnerService.show();
        this.data_api.getFBVariationsSettings().subscribe((data) => {
            console.log(data);
            if(data){
            
                this.editForm.patchValue({
                    varEmailRecipient : data.varEmailRecipient,
                    varDefaultOpening : data.varDefaultOpening,
                    varDefaultClosing : data.varDefaultClosing,
                    bmHideAll: this.checkGlobalBooleanVariationSettings(data.bmHideAll) ? data.bmHideAll : false,
                    bmLineitem: this.checkGlobalBooleanVariationSettings(data.bmLineitem) ? data.bmLineitem : false,
                    bmTotalFigure: this.checkGlobalBooleanVariationSettings(data.bmTotalFigure) ? data.bmTotalFigure : false,
                    varSetJobNum: data.varSetJobNum ? data.varSetJobNum : true,
                    varSetCode: data.varSetCode ? data.varSetCode : 'V',
                    // varSetStartNumber: data.varSetStartNumber ? data.varSetStartNumber : 0,
                    qtyHideAll: this.checkGlobalBooleanVariationSettings(data.qtyHideAll) ? data.qtyHideAll : false,
                    unitHideAll: this.checkGlobalBooleanVariationSettings(data.unitHideAll) ? data.unitHideAll : false,
                    unitCostHideAll: this.checkGlobalBooleanVariationSettings(data.unitCostHideAll) ? data.unitCostHideAll : false,
                    gstHideAll: this.checkGlobalBooleanVariationSettings(data.gstHideAll) ? data.gstHideAll : false,
                    itemTotalHideAll: this.checkGlobalBooleanVariationSettings(data.itemTotalHideAll) ? data.itemTotalHideAll : false,
                });

              // this.prevVarNumber = data.varSetStartNumber ? data.varSetStartNumber : 0;

            //   if(data.pdfCompanyName){
            //     this.editForm.patchValue({
            //         pdfCompanyName: data.pdfCompanyName,
            //     });
            //   }

            //   if(data.logo){
            //     this.getBase64ImageFromURL(data.logo).subscribe((base64Data: string) => {   
            //         this.imageURL = base64Data;
            //         this.imageURLRaw = base64Data;
            //     });
            //   }

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

      
    // public getEmailSettings(){
    // this.spinnerService.show();
    //     this.data_api.getEmailSettings().subscribe((data) => {
    //             console.log(data);
    //             this.spinnerService.hide();
    //             this.emailData = data;
                
    //             let EmailTo;
    //             let EmailCC;
    //             let EmailBCC;
    //             let ProjectReqestRecepient;

    //             if(this.emailData[0].approval_to_email){
    //                 EmailTo = JSON.parse(this.emailData[0].approval_to_email);

    //                 EmailTo.forEach(value => {
    //                     const emailTo = this.editForm.get('emailTo') as FormArray;
    //                     emailTo.push(this.formBuilder.control(value));
    //                 });
    //             }

    //             if(this.emailData[0].approval_to_email){
    //                 EmailCC = JSON.parse(this.emailData[0].approval_to_cc);

    //                 EmailCC.forEach(value => {
    //                     const emailCC = this.editForm.get('emailCC') as FormArray;
    //                     emailCC.push(this.formBuilder.control(value));
    //                 });
    //             }

    //             if(this.emailData[0].approval_to_email){
    //                 EmailBCC = JSON.parse(this.emailData[0].approval_to_bcc);

    //                 EmailBCC.forEach(value => {
    //                     const emailBCC = this.editForm.get('emailBCC') as FormArray;
    //                     emailBCC.push(this.formBuilder.control(value));
    //                 });
    //             }


    //             if(this.emailData[0].project_request_email){
    //                 ProjectReqestRecepient = JSON.parse(this.emailData[0].project_request_email);

    //                 ProjectReqestRecepient.forEach(value => {
    //                     const ProjectReqestRecepient = this.editForm.get('projectReqestRecepient') as FormArray;
    //                     ProjectReqestRecepient.push(this.formBuilder.control(value));
    //                 });

    //             }
                

    //             console.log(data);
    //         }
    //     );
    // }


    public savestep1(){

        // if( (this.prevVarNumber != this.editForm.value.varSetStartNumber) && (this.hiProjVarNo > this.editForm.value.varSetStartNumber)){
        //     swal.fire({
        //         title: "Please set the Variation Starting Number field higher than the highest number among the project's current variation numbers to avoid duplication.",
        //         // text: "You clicked the button!",
        //         buttonsStyling: false,
        //         customClass: {
        //             confirmButton: 'btn btn-success',
        //         },
        //         icon: "error"
        //     })
        //     return;
        // }

        this.spinnerService.show();
        this.data_api.updateFBVariationsSettings(this.editForm.value).then(() => {
            console.log('Updated successfully!');
            this.spinnerService.hide();

           swal.fire({
                title: "Variations Settings Updated",
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

        // if( (this.imageURL != this.imageURLRaw) ){
        //     console.log('with Logo');
        //     this.savestep2();
        // }else{
        //     console.log('Without Logo');
        //     this.updateWithoutLogo();
        // }
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
        let ref = this.afStorage.ref(this.accountFirebase+'/admin/logo');
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

    // public updateWithoutLogo(){

    //     this.data_api.updateFBAdminSettingsWithoutLogo(this.editForm.value.adminEmail, this.editForm.value.pdfCompanyName).then(() => {
    //         console.log('Updated successfully!');
    //         this.spinnerService.hide();

    //        swal.fire({
    //             title: "Admin Settings Updated",
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

    public savestep3(){

        // this.data_api.updateFBAdminSettingsWithLogo(this.editForm.value.adminEmail, this.editForm.value.logo, this.editForm.value.pdfCompanyName).then(() => {
        //     console.log('Updated successfully!');
        //     this.spinnerService.hide();

        //    swal.fire({
        //         title: "Admin Settings Updated",
        //         // text: "You clicked the button!",
        //         buttonsStyling: false,
        //         customClass: {
        //             confirmButton: 'btn btn-success',
        //         },
        //         icon: "success"
        //     })

        //     setTimeout(() => {
        //         window.location.reload();
        //     }, 1000); 

        // });
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

    openProjectCounterDialog(): void {
        const dialogRef = this.dialog.open(ProjectCounterDialog, {
            width: '400px',
            data: this.projectList
        });
  
        // dialogRef.afterClosed().subscribe(result => {

        // });
        
    }

}

@Component({
    selector: 'project-counterdialog',
    templateUrl: 'project-counterdialog.html',
  })
  
  export class ProjectCounterDialog implements OnInit {
  
    addFestForm: FormGroup;
    projectListDialog:any = [];
    
    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ProjectCounterDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }
  
    ngOnInit() {
        this.projectListDialog = this.data;
    }

    // getFBProjects(): void {
    //     this.spinnerService.show();
    //     this.data_api.getFBProjects().subscribe(data => {
    //       console.log(data);
    
    //         if(data){
    //           this.projectList = data;
    //           this.spinnerService.hide();
    //         }
    
    //     });
    //   }
  }