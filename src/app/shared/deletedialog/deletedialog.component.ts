import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoriesDeleteDialog } from 'src/app/categories/categoriesbutton-render.component';
import { DatasourceService } from 'src/app/services/datasource.service';
declare const $: any;

@Component({
  selector: 'app-deletedialog',
  templateUrl: './deletedialog.component.html',
  styleUrls: ['./deletedialog.component.css']
})
export class DeletedialogComponent {
   
     deleteConfirm;
   
     adminData;
   
     colorBtnDefault;
   
     constructor(
       private formBuilder: FormBuilder,
       public dialogRef: MatDialogRef<CategoriesDeleteDialog>,
       private data_api: DatasourceService,
       @Inject(MAT_DIALOG_DATA) public data) {}
   
     onNoClick(): void {
       this.dialogRef.close();
     }

     check(event:string){
      this.deleteConfirm = event
      console.log(this.deleteConfirm)
     }
   
     confirmDelete(): void {
      console.log('this.dle', this.deleteConfirm)
       if(this.deleteConfirm == 'DELETE'){
         this.dialogRef.close(true);
       }else{
         this.dialogRef.close();
         $.notify({
           icon: 'notifications',
           message: 'Confirmation Failed'
         }, {
             type: 'danger',
             timer: 1000,
             placement: {
                 from: 'top',
                 align: 'center'
             },
             template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
               '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
               '<i class="material-icons" data-notify="icon">notifications</i> ' +
               '<span data-notify="title">{1}</span> ' +
               '<span data-notify="message">{2}</span>' +
               '<div class="progress" data-notify="progressbar">' +
                 '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
               '</div>' +
               '<a href="{3}" target="{4}" data-notify="url"></a>' +
             '</div>'
         });
       }
     }
   
     onButtonEnter(hoverName: HTMLElement) {
       hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
       console.log(hoverName);
     }
   
     onButtonOut(hoverName: HTMLElement) {
         hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
     }
}
