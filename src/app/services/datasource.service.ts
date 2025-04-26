import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders,HttpBackend, HttpParams } from '@angular/common/http';
// import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';
import { of, Observable, forkJoin } from 'rxjs';
import { take, first , map, concatMap, mergeMap, tap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
// import { Bookingdata } from '../model/bookingdata';
import { environment } from '../../environments/environment';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import Tutorial from '../models/tutorial.model';
import Timesheet from '../models/timesheet.model';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getStorage, ref, list } from "firebase/storage";
import 'rxjs/add/operator/map';
import { arrayUnion, arrayRemove } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class DatasourceService {
  apiURL;
  bridgeURL;
  logoURL;
  pdfHeaderUrl1;
  pdfHeaderUrl2;
  pdfFooterURL;
  tokenURL;
  resetUrl;
  accountFirebase;

  userDetails = JSON.parse(localStorage.getItem('currentUser'));
  // bridgeURL = 'https://dcb-diary.sitebyspin.com/wp-json/report/v1';
  //bridgeURL = 'https://www.dcb.com.au/wp-json/report/v1';
  private httpWithoutInterceptor: HttpClient;
  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json;charset=UTF-8'
    })
  } 

  // private dbPath = '/tutorials';
  // private dbPath2 = '/timesheets';

  // tutorialsRef: AngularFirestoreCollection<Tutorial>;
  // timesheetsRef: AngularFirestoreCollection<Timesheet>;

  constructor(
    private link: HttpClient, 
    handler: HttpBackend, 
    private afs: AngularFirestore,
    private functions: AngularFireFunctions,
    ) { 
    
    // this.tutorialsRef = afs.collection(this.dbPath);
    // this.timesheetsRef = afs.collection(this.dbPath2);

    if(location.origin == 'http://localhost:4200'){
      console.log('4200 is woking')
      this.bridgeURL = 'https://api-staging.tradiesdiary.com/wp-json/report/v1';
      this.apiURL = 'https://api-staging.tradiesdiary.com/wp-json/wp/v2';
      this.logoURL='https://api-staging.tradiesdiary.com/logo.png';
      this.pdfHeaderUrl1='https://api-staging.tradiesdiary.com/header1.png';
      this.pdfHeaderUrl2='https://api-staging.tradiesdiary.com/header2.png';
      this.pdfFooterURL='https://api-staging.tradiesdiary.com/footer.png';
      this.tokenURL='https://api-staging.tradiesdiary.com/wp-json/jwt-auth/v1/token/validate';
      this.resetUrl = 'https://api-staging.tradiesdiary.com/wp-json/bdpwr/v1';
      //this.accountFirebase = 'firebase';
      this.accountFirebase = 'diarystaging';
      // this.bridgeURL = 'https://api-tradies-diary.tradiesdiary.com/wp-json/report/v1';
      // this.apiURL = 'https://api-tradies-diary.tradiesdiary.com/wp-json/wp/v2';
      // this.logoURL='https://api-tradies-diary.tradiesdiary.com/logo.png';
      // this.pdfHeaderUrl1='https://api-tradies-diary.tradiesdiary.com/header1.png';
      // this.pdfHeaderUrl2='https://api-tradies-diary.tradiesdiary.com/header2.png';
      // this.pdfFooterURL='https://api-tradies-diary.tradiesdiary.com/footer.png';
      // this.tokenURL='https://api-tradies-diary.tradiesdiary.com/wp-json/jwt-auth/v1/token/validate';
      // this.resetUrl = 'https://api-tradies-diary.tradiesdiary.com/wp-json/bdpwr/v1';
      // //this.accountFirebase = 'firebase';
      // this.accountFirebase = 'diary';

    }else if(location.origin == 'https://192.168.1.2:4200'){
      this.bridgeURL = 'https://api-staging.tradiesdiary.com/wp-json/report/v1';
      this.apiURL = 'https://api-staging.tradiesdiary.com/wp-json/wp/v2';
      this.logoURL='https://api-staging.tradiesdiary.com/logo.png';
      this.pdfHeaderUrl1='https://api-staging.tradiesdiary.com/header1.png';
      this.pdfHeaderUrl2='https://api-staging.tradiesdiary.com/header2.png';
      this.pdfFooterURL='https://api-staging.tradiesdiary.com/footer.png';
      this.tokenURL='https://api-staging.tradiesdiary.com/wp-json/jwt-auth/v1/token/validate';
      this.resetUrl = 'https://api-staging.tradiesdiary.com/wp-json/bdpwr/v1';
      //this.accountFirebase = 'firebase';
      this.accountFirebase = 'diarystaging';
    }
    else if(location.origin.includes('tradies-testing')){
      console.log('tradies testing wokring')
      this.bridgeURL = 'https://api-tradies-diary.tradiesdiary.com/wp-json/report/v1';
      this.apiURL = 'https://api-tradies-diary.tradiesdiary.com/wp-json/wp/v2';
      this.logoURL='https://api-tradies-diary.tradiesdiary.com/logo.png';
      this.pdfHeaderUrl1='https://api-tradies-diary.tradiesdiary.com/header1.png';
      this.pdfHeaderUrl2='https://api-tradies-diary.tradiesdiary.com/header2.png';
      this.pdfFooterURL='https://api-tradies-diary.tradiesdiary.com/footer.png';
      this.tokenURL='https://api-tradies-diary.tradiesdiary.com/wp-json/jwt-auth/v1/token/validate';
      this.resetUrl = 'https://api-tradies-diary.tradiesdiary.com/wp-json/bdpwr/v1';
      //this.accountFirebase = 'firebase';
      this.accountFirebase = 'diary';
      
    }
    else if(location.origin.includes('vercel.app')){
      this.bridgeURL = 'https://api-staging.tradiesdiary.com/wp-json/report/v1';
      this.apiURL = 'https://api-staging.tradiesdiary.com/wp-json/wp/v2';
      this.logoURL='https://api-staging.tradiesdiary.com/logo.png';
      this.pdfHeaderUrl1='https://api-staging.tradiesdiary.com/header1.png';
      this.pdfHeaderUrl2='https://api-staging.tradiesdiary.com/header2.png';
      this.pdfFooterURL='https://api-staging.tradiesdiary.com/footer.png';
      this.tokenURL='https://api-staging.tradiesdiary.com/wp-json/jwt-auth/v1/token/validate';
      this.resetUrl = 'https://api-staging.tradiesdiary.com/wp-json/bdpwr/v1';
      //this.accountFirebase = 'firebase';
      this.accountFirebase = 'diarystaging';
      console.log('vercel is  wokring') 
      // this.bridgeURL = 'https://api-tradies-diary.tradiesdiary.com/wp-json/report/v1';
      // this.apiURL = 'https://api-tradies-diary.tradiesdiary.com/wp-json/wp/v2';
      // this.logoURL='https://api-tradies-diary.tradiesdiary.com/logo.png';
      // this.pdfHeaderUrl1='https://api-tradies-diary.tradiesdiary.com/header1.png';
      // this.pdfHeaderUrl2='https://api-tradies-diary.tradiesdiary.com/header2.png';
      // this.pdfFooterURL='https://api-tradies-diary.tradiesdiary.com/footer.png';
      // this.tokenURL='https://api-tradies-diary.tradiesdiary.com/wp-json/jwt-auth/v1/token/validate';
      // this.resetUrl = 'https://api-tradies-diary.tradiesdiary.com/wp-json/bdpwr/v1';
      // //this.accountFirebase = 'firebase';
      // this.accountFirebase = 'diary';
      
      
    }
    else{
     console.log('main else is working')
      var full = window.location.host
      //window.location.host is subdomain.domain.com
      var parts = full.split('.')
      var sub = parts[0]
      this.bridgeURL = 'https://api-'+sub+'.tradiesdiary.com/wp-json/report/v1';
      this.apiURL = 'https://api-'+sub+'.tradiesdiary.com/wp-json/wp/v2';
      this.logoURL='https://api-'+sub+'.tradiesdiary.com/logo.png';
      this.pdfHeaderUrl1='https://api-'+sub+'.tradiesdiary.com/header1.png';
      this.pdfHeaderUrl2='https://api-'+sub+'.tradiesdiary.com/header2.png';
      this.pdfFooterURL='https://api-'+sub+'.tradiesdiary.com/footer.png';
      this.tokenURL='https://api-'+sub+'.tradiesdiary.com/wp-json/jwt-auth/v1/token/validate';
      this.resetUrl = 'https://api-'+sub+'.tradiesdiary.com/wp-json/bdpwr/v1';
      this.accountFirebase = sub;
    
    }
  
    this.httpWithoutInterceptor  = new HttpClient(handler);

  }


  getTimestamp() {
      return firebase.firestore.FieldValue.serverTimestamp();
  }

  getCurrentProject(){
    //console.log('this.accontfirebase', this.accountFirebase);
    
      return this.accountFirebase;
  }

  //Firebase Timesheet
  async createTimesheet(formValue) {
    let docRef = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').add(formValue);
    try {
      const docAdded = await docRef;
      return docAdded.id;
    }
    catch (err) {
      return err;
    }   
  }

  updateFBTimesheet(id,formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).update(formValue)
  }

  updateFBTimesheetWithoutImage(id,formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).update({
      start: formValue.start,
      break: formValue.break,
      finish: formValue.finish,
      accomplishments: formValue.accomplishments,
      modifiedDate: formValue.modifiedDate,
      modifiedAt: formValue.modifiedAt
    })
  }

  updateFBTimesheetWithoutImagebySupervisor(id,formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).update({
      projectId: formValue.projectId,
      selectedDate: formValue.selectedDate,
      start: formValue.start,
      break: formValue.break,
      finish: formValue.finish,
      accomplishments: formValue.accomplishments,
      modifiedDate: formValue.modifiedDate,
      modifiedBy: formValue.modifiedBy,
      modifiedAt: formValue.modifiedAt
    })
  }

  updateFBTimesheetApprove(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).update({
      acceptedStatus: true,
    })
  }

  updateFBTimesheetReject(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).update({
      acceptedStatus: false,
    })
  }

  updateFBTimesheetArchive(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).update({
      acceptedStatus: false,
      archiveStatus: true
    })
  }

  updateFBTimesheetUnArchive(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).update({
      acceptedStatus: false,
      archiveStatus: false
    })
  }

  // getTimesheet(): any {
  //   let itemDoc = this.afs.doc(this.accountFirebase+'/timesheet/zUO1KW8wuurLejwe1Lwz');
  //   return itemDoc.valueChanges();
  // }

  getTimesheetSpec(projectId,date,workerID): any {
    var startDate = new Date(date) ;
    var endDate = new Date(date);
    endDate.setDate(startDate.getDate() + 1);
    //console.log(projectId);
    //console.log(startDate);
    //console.log(endDate);
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("projectId", '==', projectId)
    .where("workerID", '==', workerID)
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  deleteFBTimesheet(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet').doc(id).delete()
  }

  //Firebase Daily Report
  async createFBDailyReport(formValue) {
    let docRef = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport').add(formValue);
    try {
      const docAdded = await docRef;
      return docAdded.id;
    }
    catch (err) {
      return err;
    }   
  }

  updateFBDailyReport(id,formValue): any {
    console.log('id',id);
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport').doc(id).update(formValue)
  }
  
  deleteFBDailyReport(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport').doc(id).delete()
  }

  updateFBDailyReportStaffCount(id, count): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport').doc(id).update({
      staffCount: count,
    })
  }

  getFBDailyReport(projectId,date): any {
    var startDate = new Date(date) ;
    var endDate = new Date(date);
    endDate.setDate(startDate.getDate() + 1);
    console.log(projectId);
    console.log(startDate);
    console.log(endDate);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("projectId", '==', projectId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(debounceTime(500));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBDailyWorkerLogs(projectId,startDate,endDate): any {
    //console.log(projectId);
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("projectId", '==', projectId)
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate2));
    return itemCol.valueChanges({ idField: 'id' }).pipe(debounceTime(500));
    //return itemCol.valueChanges({ idField: 'id' });
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBDailyReports(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref.orderBy('todaysDate', 'desc'));
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBDailyReportsSupervisor(batch): any {
      let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => 
      ref.where('projectId', 'in', [...batch])
      .orderBy('todaysDate', 'desc')
      .limit(10)
      );
      return itemCol.valueChanges({ idField: 'id' });
  }

    //Firebase Daily Report
    // async createFBVariation(formValue) {
    //   let docRef = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations').add(formValue);
    //   try {
    //     const docAdded = await docRef;
    //     return docAdded.id;
    //   }
    //   catch (err) {
    //     return err;
    //   }   
    // }

    async createFBVariation(id, formValue) {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations').doc(id).set(formValue)
    }

    // create rfis

    async createFBRFI(id, formValue) {
      //console.log('formvlaue', formValue);
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis').doc(id).set(formValue)
    }

    async createFBSelection(id, formValue) {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections').doc(id).set(formValue)
    }


    updateFBVariation(id,formValue): any {
      console.log("formvalue",formValue)
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations').doc(id).update(formValue)
    }

    updateFBRFI(id,formValue): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis').doc(id).update(formValue)
    }

    updateFBSelection(id,formValue): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections').doc(id).update(formValue)
    }

    approveAdminFBVariation(id,data): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations').doc(id).update({
        status: data.status,
        comments: data.comments,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        approvedRole: data.approvedRole,
      })
    }

    // approve fb rfi

    approveAdminFBRFI(id,data): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis').doc(id).update({
        status: data.status,
        comments: data.comments,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        approvedRole: data.approvedRole,
      })
    }
    
    
    // approve fb selection
    approveAdminFBSelection(id,data): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections').doc(id).update({
        status: data.status,
        comments: data.comments,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        approvedRole: data.approvedRole,
      })
    }

    getFBVariation(id?): any {
      if(id){
      let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations').doc(id);
      return itemDoc.valueChanges({ idField: 'id' });
      } else{
        let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations')
        return itemDoc.valueChanges({ idField: 'id' });
      }
    }

    getFBAFI(id?): any {
      if(id){
      let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis').doc(id);
      return itemDoc.valueChanges({ idField: 'id' });
      } else{
        let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis');
      return itemDoc.valueChanges({ idField: 'id' });
      }
    }

    // get firevase slection

    getFBSelection(id?): any {
      if(id){
      let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections').doc(id);
      return itemDoc.valueChanges({ idField: 'id' });
    } else{
      let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections')
      return itemDoc.valueChanges({ idField: 'id' });
    }
    }
    
    deleteFBVariation(id): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations').doc(id).delete()
    }

    // DELETE FB RFI
    deleteFBRFI(id): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis').doc(id).delete()
    }


    // delete fb selection

        
    deleteFBSelection(id): any {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections').doc(id).delete()
    }
    
    getFBVariations(projectId): any {
      //console.log(projectId);
      let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations', ref => ref
      .where("projectId", '==', projectId));
      // return itemCol.valueChanges({ idField: 'id' }).pipe(debounceTime(500));
      return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    }

  // getFBDailyReportsPageFirst(): any {
  //   let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //   .orderBy('todaysDate', 'desc')
  //   .limit(5)
  //   );
  //   return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  // }

  // async getFBDailyReportsFirst(): Promise<any> {
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //   .orderBy('todaysDate', 'desc')
  //   .limit(5)
  //   ).snapshotChanges()
  //   .subscribe(response => {
  //       if (!response.length) {
  //         //console.log("No Data Available");
  //         return false;
  //       }
  //       return response;
  //   });
  // }
  
  // getFBDailyReportsPageNext(lastVisible): any {
  //   let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //   .orderBy('todaysDate', 'desc')
  //   .startAfter(lastVisible)
  //   .limit(5)
  //   );
  //   return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  // }

  //Firebase Weekly Report
  getFBWeeklyReport(projectId,date): any {
    var startDate = new Date(date) ;
    var endDate = new Date(date);
    endDate.setDate(startDate.getDate() + 1);
    //console.log(projectId);
    //console.log(startDate);
    //console.log(endDate);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref
    .where("projectId", '==', projectId)
    .where("weekendDate", '>=', startDate)
    .where("weekendDate", '<', endDate));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }
  
  getFBWeeklyReports(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref.orderBy('weekendDate', 'desc'));
    return itemCol.valueChanges({ idField: 'id' });
  }

  async createFBWeeklyReport(id, formValue) {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport').doc(id).set(formValue)
    // let docRef = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport').add(formValue);
    // try {
    //   const docAdded = await docRef;
    //   return docAdded.id;
    // }
    // catch (err) {
    //   return err;
    // }   
  }

  updateFBWeeklyReport(id,formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport').doc(id).update(formValue);
  }

  deleteFBWeeklyReport(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport').doc(id).delete()
  }

  getFBWeeklyReportSpec(id): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport').doc(id);
    return itemDoc.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getWeeklyTimesheetSpec(projectId,startDate, endDate): any {
    // var endDate = new Date(date);
    // var startDate = new Date(date) ; 
    // startDate.setDate(endDate.getDate() + 1);
    //console.log(projectId);
    //console.log(startDate);
    //console.log(endDate);
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("projectId", '==', projectId)
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  //Firebase Project
  createProject(formValue): any {
    console.log('formvalue', formValue);
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects').add(formValue);
  }

  updateFBProject(id,formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects').doc(id).update(formValue)
  }

  updateFBProjectLostDaysHours(id,lostTotalDays,lostTotalHours): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects').doc(id).update({
      lostTotalDays: lostTotalDays,
      lostTotalHours: lostTotalHours
    })
  }

  getFBProjects(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects', ref => ref
    .orderBy('projectName', 'asc')
    );
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.valueChanges({ idField: 'id' })
  }

  getFBProjectsSelection(): any {
    //console.log('running for selection')
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects', ref => ref
    .orderBy('projectName', 'asc')
    );
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    //return itemCol.valueChanges({ idField: 'id' })
    return itemCol.get();
  }

  getFBProjectsWorker(workerID): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects', ref => ref
    .where("projectWorker", 'array-contains', workerID));
    return itemCol.valueChanges({ idField: 'id' })
  }
  
  getFBProjectsSupervisor(supervisorID): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects', ref => ref
    .where("siteSupervisor", '==', supervisorID)); 
    return itemCol.valueChanges({ idField: 'id' })
  }

  getFBProjectsAltSupervisor(supervisorID): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects', ref => ref
    .where("altSupervisor", 'array-contains', supervisorID));
    return itemCol.valueChanges({ idField: 'id' })
  }

  getFBProjectsRecipientVariation(externalUserID): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects', ref => ref
    .where("recipientVariation", 'array-contains', externalUserID));
    return itemCol.valueChanges({ idField: 'id' })
  }

  getFBProject(id): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects').doc(id);
    return itemDoc.valueChanges({ idField: 'id' });
  }

  //Firebase User
  createUser(formValue): any {
    return this.afs.collection('users').add(formValue);
  }

  updateFBUser(id,formValue): any {
    return this.afs.collection('/users').doc(id).update(formValue)
  }

  deleteFBUser(id): any {
    return this.afs.collection('/users').doc(id).delete()
  }

 checkFBUserExist(emailVal): any {
    let itemCol = this.afs.collection('users', ref => ref
    .where("userEmail", '==', emailVal));
    return itemCol.valueChanges();
  }

  getFBUser(id): any {
        
    let itemDoc = this.afs.collection('/users').doc(id);
    return itemDoc.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBUsers(): any {

    let itemCol = this.afs.collection('users', ref => ref
    .where("userAccounts", 'array-contains', this.accountFirebase));
    //console.log(itemCol, 'itemcol')
    return itemCol.valueChanges({ idField: 'id' }).pipe(debounceTime(500));
  }

  getFBUsersOrdered(): any {
    let itemCol = this.afs.collection('users', ref => ref
    .orderBy('userLastName', 'asc')
    .where("userAccounts", 'array-contains', this.accountFirebase));
    return itemCol.valueChanges({ idField: 'id' }).pipe(debounceTime(500));
  }

  getFBUsersOrderedFname(): any {
    let itemCol = this.afs.collection('users', ref => ref
    .orderBy('userFirstName', 'asc')
    .where("userAccounts", 'array-contains', this.accountFirebase));
    return itemCol.valueChanges({ idField: 'id' }).pipe(debounceTime(500));
  }

  getFBWorkers(): any {
    let itemCol = this.afs.collection('users', ref => ref
    .where("userRole", '==', 'project_worker')
    .orderBy('userFirstName', 'asc')
    .where("userAccounts", 'array-contains', this.accountFirebase));
    return itemCol.valueChanges();
  }

  getFBSupervisors(): any {
    let itemCol = this.afs.collection('users', ref => ref
    .where("userRole", '==', 'project_supervisor')
    .orderBy('userFirstName', 'asc')
    .where("userAccounts", 'array-contains', this.accountFirebase));
    return itemCol.valueChanges().pipe(debounceTime(500));
  }

  // getFBProjectOwners(): any {
  //   let itemCol = this.afs.collection('users', ref => ref
  //   .where("userAccounts", 'array-contains', this.accountFirebase)
  //   .where("userRole", '==', 'project_owner'));
  //   return itemCol.valueChanges();
  // }

  //Firebase Trades
  async createTrades(formValue) {
    let docRef = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/trades').collection('/tradesList').add(formValue)
      try {
        const docAdded = await docRef;
        return docAdded.id;
      }
      catch (err) {
        return err;
      }
  }

  getFBTrade(id): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/trades').collection('/tradesList').doc(id);
    return itemDoc.valueChanges().pipe(take(1));
  }

  updateFBTrades(id,formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/trades').collection('/tradesList').doc(id).update(formValue)
  }

  deleteFBTrades(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/trades').collection('/tradesList').doc(id).delete()
  }

  getFBAllTrades(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/trades').collection('/tradesList');
    return itemCol.valueChanges({ idField: 'id' });
  }


  //Firebase Products
  async createFBProduct(formValue) {

      let docRef = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products').collection('/productsList').add(formValue)

      try {
        const docAdded = await docRef;

        let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products');

         await itemDoc.set(
            {productArray: arrayUnion({
              productArrayID: docAdded.id, 
              productArrayName: formValue.productName,  
              productArraySizeType: formValue.productSizeType,
              productArrayUnit: formValue.productUnit,
              productArrayCost: formValue.productCost
            })},{ merge: true }
          );

          return docAdded.id;
      }
      catch (err) {
        return err;
      }   
    
  }

  async updateFBProduct(oldFormValue, newFormValue) {

    try {
      
      await this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products').collection('/productsList').doc(oldFormValue.productArrayID).update(newFormValue);

      let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products');

      await itemDoc.set(
        {productArray: arrayRemove(oldFormValue)},{ merge: true }
      );
  
      return itemDoc.set(
        {productArray: arrayUnion({
          productArrayID: oldFormValue.productArrayID, 
          productArrayName: newFormValue.productName,  
          productArraySizeType: newFormValue.productSizeType,
          productArrayUnit: newFormValue.productUnit,
          productArrayCost: newFormValue.productCost
        })},{ merge: true }
      );

    }
    catch (err) {
      return err;
    }   

  }

  async deleteFBProduct(formValue){
    //return this.tutorialsRef.doc(id).delete();
    try {
      
      await this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products').collection('/productsList').doc(formValue.productArrayID).delete();

      let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products');

      return itemDoc.set(
        {productArray: arrayRemove(formValue)},{ merge: true }
      );
  
    }
    catch (err) {
      return err;
    }   

  }

  getFBProduct(id): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products').collection('/productsList').doc(id);
    return itemDoc.valueChanges().pipe(take(1));
  }

  getFBProducts(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products').collection('/productsList');
    return itemCol.valueChanges();
  }

  getFBProductsArray(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/products')
    return itemCol.valueChanges();
  }

  //Firebase Suppliers
  async createFBSupplier(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/suppliers');

    await itemDoc.set(
      {supplierArray: arrayUnion({supplierID: uuid, supplierName: arrayEntry})},{ merge: true }
    );

    return uuid;

  }

  importFBSupplier(arrayImports) {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/suppliers');

    return itemDoc.set(
      {supplierArray: arrayUnion(...arrayImports)},{ merge: true }
    );
  }

  updateFBSupplier(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/suppliers');

    itemDoc.set(
      {supplierArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {supplierArray: arrayUnion({supplierID: newArrayEntry.supplierID, supplierName: newArrayEntry.supplierName})},{ merge: true }
    );

  }

 deleteFBSupplier(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/suppliers');

    return itemDoc.set(
      {supplierArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBSuppliers(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/suppliers')
    return itemCol.valueChanges();
  }


  //Firebase Stages
  async createFBStage(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/stages');

    await itemDoc.set(
        {stageArray: arrayUnion({stageID: uuid, stageName: arrayEntry})},{ merge: true }
    );

    return uuid;

  }

  importFBStage(arrayImports) {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/stages');

    return itemDoc.set(
      {stageArray: arrayUnion(...arrayImports)},{ merge: true }
    );
  }


  updateFBStage(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/stages');

    itemDoc.set(
      {stageArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {stageArray: arrayUnion({stageID: newArrayEntry.stageID, stageName: newArrayEntry.stageName})},{ merge: true }
    );

  }

 deleteFBStage(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/stages');

    return itemDoc.set(
      {stageArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBStages(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/stages')
    return itemCol.valueChanges();
  }

  //Firebase Visitors
  async createFBVisitor(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/visitors');

    await itemDoc.set(
      {visitorArray: arrayUnion({ visitorID: uuid, visitorName: arrayEntry }) },{ merge: true }
    );

    return uuid;
  }

  async createFBVisitorDaily(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/visitors');

    await itemDoc.set(
      {visitorArray: arrayUnion({visitorID: uuid, visitorName: arrayEntry})},{ merge: true }
    );

    return arrayEntry;
  }

  importFBVisitor(arrayImports) {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/visitors');

    return itemDoc.set(
      {visitorArray: arrayUnion(...arrayImports)},{ merge: true }
    );
  }

  updateFBVisitor(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/visitors');

    itemDoc.set(
      {visitorArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {visitorArray: arrayUnion({visitorID: newArrayEntry.visitorID, visitorName: newArrayEntry.visitorName})},{ merge: true }
    );

  }

 deleteFBVisitor(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/visitors');

    return itemDoc.set(
      {visitorArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBVisitors(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/visitors')
    return itemCol.valueChanges();
  }

  //Firebase UOM
  async createFBUom(arrayEntry) {
      let uuid = this.afs.createId();
      let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/uom');
  
      await itemDoc.set(
        {uomArray: arrayUnion({uomID: uuid, uom: arrayEntry})},{ merge: true }
      );
  
      return uuid;
    }

  async createFBUomDaily(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/uom');

    await itemDoc.set(
      {uomArray: arrayUnion({uomID: uuid, uom: arrayEntry})},{ merge: true }
    );

    return arrayEntry;

  }

  updateFBUom(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/uom');

    itemDoc.set(
      {uomArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {uomArray: arrayUnion({uomID: newArrayEntry.uomID, uom: newArrayEntry.uom})},{ merge: true }
    );

  }

 deleteFBUom(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/uom');

    return itemDoc.set(
      {uomArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBUom(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/uom')
    return itemCol.valueChanges();
  }

  //Firebase Tools
  async createFBTool(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/tools');

    await itemDoc.set(
      {toolArray: arrayUnion({toolID: uuid, toolName: arrayEntry})},{ merge: true }
    );

    return uuid;

  }

  updateFBTool(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/tools');

    itemDoc.set(
      {toolArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {toolArray: arrayUnion({toolID: newArrayEntry.toolID, toolName: newArrayEntry.toolName})},{ merge: true }
    );

  }

  deleteFBTool(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/tools');

    return itemDoc.set(
      {toolArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBTools(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/tools')
    return itemCol.valueChanges();
  }

  //Firebase Costcentres
  async createFBCostcentre(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/costcentres');

    await itemDoc.set(
      {costcentreArray: arrayUnion({costcentreID: uuid, costcentreName: arrayEntry})},{ merge: true }
    );
    return uuid;
  }

  updateFBCostcentre(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/costcentres');

    itemDoc.set(
      {costcentreArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {costcentreArray: arrayUnion({costcentreID: newArrayEntry.costcentreID, costcentreName: newArrayEntry.costcentreName})},{ merge: true }
    );

  }

  deleteFBCostcentre(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/costcentres');

    return itemDoc.set(
      {costcentreArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBCostcentres(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/costcentres')
    return itemCol.valueChanges();
  }

  //Firebase ProductCategories
  async createFBProdCategory(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/prodcategories');

    await itemDoc.set(
      {prodCategoryArray: arrayUnion({prodCategoryID: uuid, prodCategoryName: arrayEntry})},{ merge: true }
    );

    return uuid;

  }

  updateFBProdCategory(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/prodcategories');

    itemDoc.set(
      {prodCategoryArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {prodCategoryArray: arrayUnion({prodCategoryID: newArrayEntry.prodCategoryID, prodCategoryName: newArrayEntry.prodCategoryName})},{ merge: true }
    );

  }

  deleteFBProdCategory(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/prodcategories');

    return itemDoc.set(
      {prodCategoryArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBProdCategories(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/prodcategories')
    return itemCol.valueChanges();
  }

  //Firebase Reason - Global List
  async createFBReason(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/reasons');

    await itemDoc.set(
      {reasonArray: arrayUnion({reasonID: uuid, reason: arrayEntry})},{ merge: true }
    );

    return uuid;

  }

  async createFBReasonDaily(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/reasons');

    await itemDoc.set(
      {reasonArray: arrayUnion({reasonID: uuid, reason: arrayEntry})},{ merge: true }
    );

    return arrayEntry;

  }

  updateFBReason(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/reasons');

    itemDoc.set(
      {reasonArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {reasonArray: arrayUnion({reasonID: newArrayEntry.reasonID, reason: newArrayEntry.reason})},{ merge: true }
    );

  }

  deleteFBReason(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/reasons');

    return itemDoc.set(
      {reasonArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBReasons(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/reasons')
    return itemCol.valueChanges();
  }

  
  //Firebase Variation Group Name - Global List
  async createFBVarGroupName(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/vargroupnames');

    await itemDoc.set(
      {nameArray: arrayUnion({groupNameID: uuid, groupName: arrayEntry})},{ merge: true }
    );

    return uuid;

  }

  async createFBVarGroupNameDaily(arrayEntry) {
    let uuid = this.afs.createId();
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/vargroupnames');

    await itemDoc.set(
      {nameArray: arrayUnion({groupNameID: uuid, groupName: arrayEntry})},{ merge: true }
    );

    return arrayEntry;

  }

  updateFBVarGroupName(oldArrayEntry, newArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/vargroupnames');

    itemDoc.set(
      {nameArray: arrayRemove(oldArrayEntry)},{ merge: true }
    );

    return itemDoc.set(
      {nameArray: arrayUnion({groupNameID: newArrayEntry.groupNameID, groupName: newArrayEntry.groupName})},{ merge: true }
    );

  }

  deleteFBVarGroupName(ArrayEntry): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/vargroupnames');

    return itemDoc.set(
      {nameArray: arrayRemove(ArrayEntry)},{ merge: true }
    );

  }

  getFBVarGroupNames(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/globalList').doc('/vargroupnames')
    return itemCol.valueChanges();
  }
  

  //Get All Firebase Recent Data
  getFBRecent(): any {
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase);
    return itemDoc.valueChanges();
  }

  getFBRecentDailyReport(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => 
    ref.orderBy('createdAt', 'desc')
    .limit(10)
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBRecentDailyReportSupervisor(id): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where('siteSupervisor', '==', id)
    .orderBy('createdAt', 'desc')
    .limit(10)
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBRecentWeeklyReport(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => 
    ref.orderBy('createdAt', 'desc')
    .limit(10)
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBRecentWeeklyReportSupervisor(id): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref
    .where('siteSupervisor', '==', id)
    .orderBy('createdAt', 'desc')
    .limit(10)
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBRecentWorkerEntryLogs(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => 
    ref.orderBy('createdAt', 'desc')
    .limit(10)
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBRecentWorkerEntryLogsSupervisor(batch): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => 
    ref.where('projectId', 'in', [...batch])
    .orderBy('createdAt', 'desc')
    .limit(10)
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBRecentProjects(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects', ref => ref
        .orderBy('createdAt', 'desc')
      // .limit(5)
    );
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.valueChanges({ idField: 'id' })
  }

    getFBClientVariations(clientID): any {    
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations', ref => ref
    .where("projectOwner", 'array-contains', clientID).orderBy("variantsNumber", 'desc') 
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  // GET FB CLIENT SELECTION

  getFBClientSelections(clientID): any {    
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
    .where("projectOwner", 'array-contains', clientID).orderBy('selectionNumber', 'desc')
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  // GET FB CLIENT RFI
  getFBClientRFIs(clientID): any {    
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
    .where("projectOwner", 'array-contains', clientID).orderBy('rfiNumber', 'desc')
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  getFBClientVariationsProject(projectId): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations', ref => ref
    .where("projectId", '==', projectId).orderBy("variantsNumber", "desc") 
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  // GET FB SELECTION

  getFBClientSelectionsProject(projectId): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
    .where("projectId", '==', projectId).orderBy('selectionNumber', 'desc')
    );
    return itemCol.valueChanges({ idField: 'id' });
  }

  // GET FB RFI
  getFBClientRfisProject(projectId): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
    .where("projectId", '==', projectId).orderBy('rfiNumber', 'desc')
    );
    console.log('itemcol', itemCol)
    return itemCol.valueChanges({ idField: 'id' });
  }


  updateFBUserSortDashboard(id,newValue): any {
    return this.afs.collection('/users').doc(id).update({
      sortDashboard:newValue
    })
  }

  //Set Firebase Recent Images Daily Report
  setRecentImagesDailyReport(_values): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).set({recentImagesDailyReport: _values}, { merge: true })
  }

  //Set Firebase Recent Images Weekly Report
  setRecentImagesWeeklyReport(_values): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).set({recentImagesWeeklyReport: _values}, { merge: true })
  }

  //Set Firebase Recent Images Worker
  setRecentImagesWorker(_values): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).set({recentImagesWorker: _values}, { merge: true })
  }

  //Set Firebase Recent Images Worker
  setRecentEntryWorker(_values): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).set({recentEntryWorker: _values}, { merge: true })
  }

  //Set Firebase Recent Daily Report
  setRecentEntryDailyReport(_values): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).set({recentEntryDaily: _values}, { merge: true })
  }

  //Set Firebase Recent Weekly Report
  setRecentEntryWeeklyReport(_values): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).set({recentEntryWeekly: _values}, { merge: true })
  }
  
  // Get Admin Settings
  getFBAdminSettings(){
    //console.log(this.accountFirebase);
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/admin_settings');
    //console.log(itemDoc);
    return itemDoc.valueChanges();
  }

  updateFBAdminSettingsEmailOnly(value): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/admin_settings').update({adminEmail: value})
  }

  updateFBAdminSettingsLogoOnly(value): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/admin_settings').update({logo: value})
  }

  updateFBAdminSettingsWithoutLogo(value): any {
  // updateFBAdminSettingsWithoutLogo(emailVal, pdfCompanyName): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/admin_settings').update({
      adminEmail: value.adminEmail, 
      pdfCompanyName: value.pdfCompanyName,
      pdfPhone: value.pdfPhone,
      pdfMobile: value.pdfMobile,
      pdfEmail: value.pdfEmail,
      pdfAddress: value.pdfAddress,
      emailSignature: value.emailSignature,
      textSignature: value.textSignature,
      colourHover: value.colourHover,
      colourHighlight: value.colourHighlight,
      colourEnabledButton: value.colourEnabledButton,
      colourHoveredButton: value.colourHoveredButton,
    })
  }

  updateFBAdminSettingsWithLogo(value): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/admin_settings').update({
      adminEmail: value.adminEmail, 
      pdfCompanyName: value.pdfCompanyName,
      pdfPhone: value.pdfPhone,
      pdfMobile: value.pdfMobile,
      pdfEmail: value.pdfEmail,
      pdfAddress: value.pdfAddress,
      emailSignature: value.emailSignature,
      textSignature: value.textSignature,
      colourHover: value.colourHover,
      colourHighlight: value.colourHighlight,
      colourEnabledButton: value.colourEnabledButton,
      colourHoveredButton: value.colourHoveredButton,
      logo: value.logo,
    })
  }

  getFBCounterDailyReport(){
    //console.log(this.accountFirebase);
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/counter_daily');
    //console.log(itemDoc);
    return itemDoc.valueChanges();
  }

  updateFBCounterDailyReport(value): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/counter_daily').set({reportNumber: value})
  }

  getFBCounterWeeklyReport(){
    //console.log(this.accountFirebase);
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/counter_weekly');
    //console.log(itemDoc);
    return itemDoc.valueChanges();
  }

  updateFBCounterWeeklyReport(value): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/counter_weekly').set({reportNumber: value})
  }

  // getFBCounterVariation(){
  //   //console.log(this.accountFirebase);
  //   let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/counter_variation');
  //   //console.log(itemDoc);
  //   return itemDoc.valueChanges();
  // }

  // updateFBCounterVariation(value): any {
  //   return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/counter_variation').set({reportNumber: value})
  // }

  updateFBCounterProjectVariation(id,counter): any {
    //console.log(id,counter, 'check both')
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects').doc(id).update({
      counterVariation: counter
    })
  }

  // UPDATE COUNTER SELECTION
  updateFBCounterProjectSelection(id,counter): any {
    //console.log(id,counter, 'check both')
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects').doc(id).update({
      counterSelection: counter
    })
  }

  // UPDATE COUNTER RFI 
  updateFBCounterProjectRFI(id,counter): any {
    //console.log(id,counter, 'check both')
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projects').doc(id).update({
      counterRFI: counter
    })
  }

  // Get Variations Settings
  getFBVariationsSettings(){
    //console.log(this.accountFirebase);
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/variations_settings');
    //console.log(itemDoc);
    return itemDoc.valueChanges();
  }

  // get rfi settings
  getFBRfisSettings(){
    //console.log(this.accountFirebase);
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/rfis_settings');
    //console.log(itemDoc);
    return itemDoc.valueChanges();
  }
  // GET SELECTION SETTING
  getFBSelectionSettings(){
    //console.log(this.accountFirebase);
    let itemDoc = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/selections_settings');
    //console.log(itemDoc);
    return itemDoc.valueChanges();
  }


  // async createFBVariationsSettings(formValue) {
  //   let docRef = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/variations_settings').add(formValue);
  //   try {
  //     const docAdded = await docRef;
  //     return docAdded.id;
  //   }
  //   catch (err) {
  //     return err;
  //   }   
  // }

  updateFBVariationsSettings(formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/variations_settings').set({
      varEmailRecipient: formValue.varEmailRecipient,
      varDefaultOpening: formValue.varDefaultOpening,
      varDefaultClosing: formValue.varDefaultClosing,
      varSetJobNum: formValue.varSetJobNum,
      varSetCode: formValue.varSetCode,
      // varSetStartNumber: formValue.varSetStartNumber,
      // bmLineitem: formValue.bmLineitem,
      // bmTotalFigure: formValue.bmTotalFigure,
      // bmHideAll: formValue.bmHideAll,
      // qtyHideAll : formValue.qtyHideAll,
      // unitHideAll : formValue.unitHideAll,
      // unitCostHideAll : formValue.unitCostHideAll,
      // itemTotalHideAll : formValue.itemTotalHideAll
    });
  }

  // UPDATE SELECTION SETTING
  updateFBSelectionsSettings(formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/selections_settings').set({
      selEmailRecipient: formValue.selEmailRecipient,
      selDefaultOpening: formValue.selDefaultOpening,
      selDefaultClosing: formValue.selDefaultClosing,
      selSetJobNum: formValue.selSetJobNum,
      selSetCode: formValue.selSetCode,
      // varSetStartNumber: formValue.varSetStartNumber,
      // bmLineitem: formValue.bmLineitem,
      // bmTotalFigure: formValue.bmTotalFigure,
      // bmHideAll: formValue.bmHideAll,
      // qtyHideAll : formValue.qtyHideAll,
      // unitHideAll : formValue.unitHideAll,
      // unitCostHideAll : formValue.unitCostHideAll,
      // itemTotalHideAll : formValue.itemTotalHideAll
    });
  }

  // UPDATE RFI SETTING
   // UPDATE SELECTION SETTING
   updateFBRfiSettings(formValue): any {
    console.log('formvalue', formValue)
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/admin').doc('/rfis_settings').set({
      rfiEmailRecipient: formValue.rfiEmailRecipient,
      rfiDefaultOpening: formValue.rfiDefaultOpening,
      rfiDefaultClosing: formValue.rfiDefaultClosing,
      rfiSetJobNum: formValue.rfiSetJobNum,
      rfiSetCode: formValue.rfiSetCode,
      // varSetStartNumber: formValue.varSetStartNumber,
      // bmLineitem: formValue.bmLineitem,
      // bmTotalFigure: formValue.bmTotalFigure,
      // bmHideAll: formValue.bmHideAll,
      // qtyHideAll : formValue.qtyHideAll,
      // unitHideAll : formValue.unitHideAll,
      // unitCostHideAll : formValue.unitCostHideAll,
      // itemTotalHideAll : formValue.itemTotalHideAll
    });
  }
  
  
  getFBDashboardSearchDateDailyReport(date): any {
    var startDate = new Date(date) ;
    var endDate = new Date(date);
    endDate.setDate(startDate.getDate() + 1);
    //console.log(startDate);
    //console.log(endDate);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBDashboardSearchDateWeeklyReport(date): any {
    var startDate = new Date(date) ;
    var endDate = new Date(date);
    endDate.setDate(startDate.getDate() + 1);
    //console.log(startDate);
    //console.log(endDate);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref
    .where("weekendDate", '>=', startDate)
    .where("weekendDate", '<', endDate));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBDashboardSearchDateWorker(date): any {
    var startDate = new Date(date) ;
    var endDate = new Date(date);
    endDate.setDate(startDate.getDate() + 1);
    //console.log(startDate);
    //console.log(endDate);
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBDashboardSearchProjectDailyReport(projectId): any {
    //console.log(projectId);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("projectId", '==', projectId)
    .orderBy("todaysDate", 'desc'));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBDashboardSearchProjectWeeklyReport(projectId): any {
    //console.log(projectId);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref
    .where("projectId", '==', projectId)
    .orderBy("weekendDate", 'desc'));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  getFBDashboardSearchProjectWorker(projectId): any {
    //console.log(projectId);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("projectId", '==', projectId)
    .orderBy("selectedDate", 'desc'));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  // getFBDashboardSearchWorkerTimesheet(workerID): any {
  //   let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
  //   .where("workerID", '==', workerID)
  //   .orderBy("selectedDate", 'desc')
  //   .limit(10));
  //   return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  // }

  getFBDashboardSearchTradeReport(tradeID): any {
    //console.log(tradeID);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("tradesIdArray", 'array-contains', tradeID)
    .orderBy("todaysDate", 'desc')
    .limit(10));
    return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
  }

  filterFBDailyReportsbyDateRangeOnly(startDate,endDate): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    // .where("staffIdArray", 'array-contains', workerID)
    // .where("projectId", '==', projectId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsbyDateRangeOnly2(startDate,endDate): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2); 
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    // .where("projectId", '==', projectId)
    // .where("workerID", '==', workerID)
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate2));
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsbyDateRange(projectId,startDate,endDate,workerID): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("staffIdArray", 'array-contains', workerID)
    .where("projectId", '==', projectId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsbyDateRange2(projectId,startDate,endDate,workerID): any {
    //console.log(projectId);
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    //console.log(workerID);  
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("projectId", '==', projectId)
    .where("workerID", '==', workerID)
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate2));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsbyDateRangeProjectOnly(projectId,startDate,endDate): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("projectId", '==', projectId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsbyDateRangeProjectOnly2(projectId,startDate,endDate): any {
    //console.log(projectId);
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("projectId", '==', projectId)
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate2));
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsbyDateRangeWorkerOnly(startDate,endDate,workerID): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("staffIdArray", 'array-contains', workerID)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    //return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsbyDateRangeWorkerOnly2(startDate,endDate,workerID): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    //console.log(workerID);  
    // let itemCol= this.afs.collection(this.accountFirebase+'/timesheet', ref => ref.where("projectId", '==', projectId).where("selectedDate", '>=', startDate).where("selectedDate", '<', endDate));
    // return itemCol.valueChanges();
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .where("workerID", '==', workerID)
    .where("selectedDate", '>=', startDate)
    .where("selectedDate", '<', endDate2));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsTradebyDateRangeOnly(startDate,endDate): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    // .where("tradesIdArray", 'array-contains', tradeId)
    // .where("projectId", '==', projectId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsTradebyDateRange(projectId,startDate,endDate,tradeId): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("tradesIdArray", 'array-contains', tradeId)
    .where("projectId", '==', projectId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }
  
  filterFBDailyReportsTradebyDateRangeProjectOnly(projectId,startDate,endDate): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("projectId", '==', projectId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  filterFBDailyReportsTradebyDateRangeTradeOnly(startDate,endDate,tradeId): any {
    //console.log(startDate);
    //console.log(endDate);
    var endDate2 = new Date(endDate);
    endDate2.setDate(endDate.getDate() + 1);
    //console.log(endDate2);
    let itemCol= this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .where("tradesIdArray", 'array-contains', tradeId)
    .where("todaysDate", '>=', startDate)
    .where("todaysDate", '<', endDate2));
    // return itemCol.valueChanges({ idField: 'id' }).pipe(take(1));
    return itemCol.get();
  }

  sendFBClientProjectRequest(): any {
    const callable = this.functions.httpsCallable('sendFBClientProjectRequest');
    return callable;
  }

  sendFBAdminProjectRequest(): any {
    const callable = this.functions.httpsCallable('sendFBAdminProjectRequest');
    return callable;
  }

  createProjectRequest(formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projectRequests').add(formValue)
  }

  updateFBProjectRequest(id,formValue): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projectRequests').doc(id).update(formValue)
  }

  deleteFBProjectRequest(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projectRequests').doc(id).delete()
  }
  
  updateFBProjectRequestApprove(id): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projectRequests').doc(id).update({
      approve:true
    })
  }

  addFBActivityLog(passData): any {
    return this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs').add(passData)
  }

  getFBLogs(): any {
    let itemCol = this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs')
    return itemCol.valueChanges();
  }

  getFBTemperature(lat,lon,selectedDate) {
    //Openweather Map API
   // return this.link.get("https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&APPID=dabc2b57d81c4493c08ab63bb4d9e326&units=metric" );
     //Visual Crossing Map Map API
    return this.link.get("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"+lat+","+lon+"/"+selectedDate+"?key=99BRBZ8PEVHE4JWS4ERQ9248Q&unitGroup=metric" );
  } 
  
  // async pageTokenExample(){
  //   // Create a reference under which you want to list
  //   const storage = getStorage();
  //   const listRef = ref(storage, 'files/uid');
  
  //   // Fetch the first page of 100.
  //   const firstPage = await list(listRef, { maxResults: 10 });
  
  //   // Use the result.
  //   // processItems(firstPage.items)
  //   // processPrefixes(firstPage.prefixes)
  
  //   // Fetch the second page if there are more elements.
  //   if (firstPage.nextPageToken) {
  //     const secondPage = await list(listRef, {
  //       maxResults: 10,
  //       pageToken: firstPage.nextPageToken,
  //     });
  //     // processItems(secondPage.items)
  //     // processPref ixes(secondPage.prefixes)
  //   }
  // }


  // Get Logo
  getLogoURL(){
    return this.logoURL;
  }

  getPDFURL1(){
    return this.pdfHeaderUrl1;
  }

  getPDFURL2(){
    return this.pdfHeaderUrl2;
  }
  
  getPDFFooterURL(){
    return this.pdfFooterURL;
  }
  
  checkToken(){
    return this.link.post<any>(this.tokenURL, this.httpOptions)
  }
  
  bridgeURLData(){
    return this.bridgeURL;
  }
  // verifyToken(): Observable<boolean> {
  //   const token = this.userDetails.token;
  //   return token
  //     ? this.link.post<any>(this.tokenURL, this.httpOptions).pipe(
  //         map(res => true, error => false)
  //       )
  //     : of(false);
  // }

  // API for Users
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// STAGING 

  addNewUser(data) {
    const url = this.apiURL+'/users';
    return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  }

  updateUser(id,data) {
    const url = this.apiURL+'/users/'+id;
    return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  }
  deleteUser(id) {
    const url = this.apiURL+'/users/'+id+'?reassign=1&force=true';
    return this.link.delete<any>(url, this.httpOptions)
  }
  updatePassword(id,data) {
    const url = this.apiURL+'/users/'+id;
    return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  }

  getAllUsers() {
    const url = this.apiURL+'/users/?per_page=100&roles=project_owner,app_admin,project_worker,project_supervisor';
    return this.link.get<any[]>(url);
  }

  getProjectSupervisors() {
    const url = this.apiURL+'/users/?per_page=100&roles=project_supervisor,app_admin';
    return this.link.get<any[]>(url);
  }

  getProjectOwners() {
    const url = this.apiURL+'/users/?per_page=100&roles=project_owner';
    return this.link.get<any[]>(url);
  }

  getProjectWorkers() {
    const url = this.apiURL+'/users/?per_page=100&roles=project_worker';
    return this.link.get<any[]>(url);
  }

  getWPUser(id){
    const url = this.apiURL+'/users/'+id;
    return this.link.get<any[]>(url);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// LIVE 

  // addNewUser(data) {
  //   const url = 'https://www.dcb.com.au/wp-json/wp/v2/users';
  //   return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  // }

  // updateUser(id,data) {
  //   const url = 'https://www.dcb.com.au/wp-json/wp/v2/users/'+id;
  //   return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  // }

  // updatePassword(id,data) {
  //   const url = 'https://www.dcb.com.au/wp-json/wp/v2/users/'+id;
  //   return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  // }

  // getAllUsers() {
  //   const url = 'https://www.dcb.com.au/wp-json/wp/v2/users?roles=project_owner,report_admin';
  //   return this.link.get<any[]>(url);
  // }

  // getProjectOwners() {
  //   const url = 'https://www.dcb.com.au/wp-json/wp/v2/users?roles=project_owner';
  //   return this.link.get<any[]>(url);
  // }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// START 
 
  getUser(id){
    const url = this.bridgeURL + '/users/id/'+id;
    return this.link.get<any[]>(url);
  }
  
  sendUserNotification(data) {
    const url = this.bridgeURL + '/report/user/notification/';
    return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  }
  
  sendTestEmail(data) {
    const url = this.bridgeURL + '/report/test/email/';
    return this.link.post<any>(url, JSON.stringify(data), this.httpOptions)
  }

  // WP CUSTOM API 

  getProjects() {
    const url = this.bridgeURL + '/projects/all';
    return this.link.get<any[]>(url);
  }

  getActiveProjects() {
    const url = this.bridgeURL + '/projects/active';
    return this.link.get<any[]>(url);
  }

  getArchivedProjects() {
    const url = this.bridgeURL + '/projects/archived';
    return this.link.get<any[]>(url);
  }

  addProject(data){
    const url = this.bridgeURL + '/projects/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  addProjectImage(data){
    const url = this.bridgeURL + '/projects/add-image/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteProject(id){
    const url = this.bridgeURL + '/projects/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateProject(id,data) {
    const url = this.bridgeURL + '/projects/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateProjectDetailsOrder(id,data) {
    const url = this.bridgeURL + '/projects/update-details/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateProjectMaterials(id,data) {
    const url = this.bridgeURL + '/projects/update-materials/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateProjectMaterialId(id,data) {
    const url = this.bridgeURL + '/projects/update-material-id/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteProjectMaterialId(id,data) {
    const url = this.bridgeURL + '/projects/delete-material-id/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateProjectStages(id,data) {
    const url = this.bridgeURL + '/projects/update-stages/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateProjectStageId(id,data) {
    const url = this.bridgeURL + '/projects/update-stage-id/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteProjectStageId(id,data) {
    const url = this.bridgeURL + '/projects/delete-stage-id/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateProjectWithImage(id,data) {
    const url = this.bridgeURL + '/projects/update-image/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getProject(id) {
    const url = this.bridgeURL + '/projects/id/'+id;
    return this.link.get<any[]>(url);
  }

  // getSupervisors() {
  //   const url = this.bridgeURL + '/supervisors/all';
  //   return this.link.get<any[]>(url);
  // }

  // addSupervisor(data){
  //   const url = this.bridgeURL + '/supervisors/add/';
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // }

  // deleteSupervisor(id){
  //   const url = this.bridgeURL + '/supervisors/delete/'+id;
  //   return this.link.post<any[]>(url, this.httpOptions)
  // }

  // updateSupervisor(id,data) {
  //   const url = this.bridgeURL + '/supervisors/update/'+id;
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // }

  // getSupervisor(id) {
  //   const url = this.bridgeURL + '/supervisors/id/'+id;
  //   return this.link.get<any[]>(url);
  // }

  getTrades() {
    const url = this.bridgeURL + '/trades/all';
    return this.link.get<any[]>(url);
  }

  addTrade(data){
    const url = this.bridgeURL + '/trades/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importTrades(data){
    const url = this.bridgeURL + '/trades/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteTrade(id){
    const url = this.bridgeURL + '/trades/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateTrade(id,data) {
    const url = this.bridgeURL + '/trades/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getTrade(id) {
    const url = this.bridgeURL + '/trades/id/'+id;
    return this.link.get<any[]>(url);
  }

  addTradeStaff(data,id){
    const url = this.bridgeURL + '/trades/add-staff/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  // getTradeStaffs() {
  //   const url = this.bridgeURL + '/tradestaff/all';
  //   return this.link.get<any[]>(url);
  // }

  // addTradeStaff(data){
  //   const url = this.bridgeURL + '/tradestaff/add/';
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // }

  // importTradeStaff(data){
  //   const url = this.bridgeURL + '/tradestaff/import/';
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // }

  // deleteTradeStaff(id){
  //   const url = this.bridgeURL + '/tradestaff/delete/'+id;
  //   return this.link.post<any[]>(url, this.httpOptions)
  // }

  // updateTradeStaff(id,data) {
  //   const url = this.bridgeURL + '/tradestaff/update/'+id;
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // }

  // getTradeStaff(id) {
  //   const url = this.bridgeURL + '/tradestaff/id/'+id;
  //   return this.link.get<any[]>(url);
  // }
 
  getEmployees() {
    const url = this.bridgeURL + '/employees/all';
    return this.link.get<any[]>(url);
  }

  addEmployee(data){
    const url = this.bridgeURL + '/employees/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importEmployees(data){
    const url = this.bridgeURL + '/employees/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteEmployee(id){
    const url = this.bridgeURL + '/employees/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateEmployee(id,data) {
    const url = this.bridgeURL + '/employees/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getEmployee(id) {
    const url = this.bridgeURL + '/employees/id/'+id;
    return this.link.get<any[]>(url);
  }

  getVisitors() {
    const url = this.bridgeURL + '/visitors/all';
    return this.link.get<any[]>(url);
  }

  addVisitor(data){
    const url = this.bridgeURL + '/visitors/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importVisitor(data){
    const url = this.bridgeURL + '/visitors/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteVisitor(id){
    const url = this.bridgeURL + '/visitors/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateVisitor(id,data) {
    const url = this.bridgeURL + '/visitors/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getVisitor(id) {
    const url = this.bridgeURL + '/visitors/id/'+id;
    return this.link.get<any[]>(url);
  }

  getSuppliers() {
    const url = this.bridgeURL + '/suppliers/all';
    return this.link.get<any[]>(url);
  }

  addSupplier(data){
    const url = this.bridgeURL + '/suppliers/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importSupplier(data){
    const url = this.bridgeURL + '/suppliers/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteSupplier(id){
    const url = this.bridgeURL + '/suppliers/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateSupplier(id,data) {
    const url = this.bridgeURL + '/suppliers/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getSupplier(id) {
    const url = this.bridgeURL + '/suppliers/id/'+id;
    return this.link.get<any[]>(url);
  }
  
  getCategories() {
    const url = this.bridgeURL + '/categories/all';
    return this.link.get<any[]>(url);
  }

  addCategory(data){
    const url = this.bridgeURL + '/categories/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importCategory(data){
    const url = this.bridgeURL + '/categories/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteCategory(id){
    const url = this.bridgeURL + '/categories/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateCategory(id,data) {
    const url = this.bridgeURL + '/categories/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getCategory(id) {
    const url = this.bridgeURL + '/categories/id/'+id;
    return this.link.get<any[]>(url);
  }

  getStages() {
    const url = this.bridgeURL + '/stages/all';
    return this.link.get<any[]>(url);
  }

  addStage(data){
    const url = this.bridgeURL + '/stages/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importStage(data){
    const url = this.bridgeURL + '/stages/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteStage(id){
    const url = this.bridgeURL + '/stages/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateStage(id,data) {
    const url = this.bridgeURL + '/stages/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getStage(id) {
    const url = this.bridgeURL + '/stages/id/'+id;
    return this.link.get<any[]>(url);
  }

  getCostcentres() {
    const url = this.bridgeURL + '/costcentres/all';
    return this.link.get<any[]>(url);
  }

  addCostcentre(data){
    const url = this.bridgeURL + '/costcentres/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importCostcentre(data){
    const url = this.bridgeURL + '/costcentres/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteCostcentre(id){
    const url = this.bridgeURL + '/costcentres/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateCostcentre(id,data) {
    const url = this.bridgeURL + '/costcentres/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getCostcentre(id) {
    const url = this.bridgeURL + '/costcentres/id/'+id;
    return this.link.get<any[]>(url);
  }

  getTools() {
    const url = this.bridgeURL + '/tools/all';
    return this.link.get<any[]>(url);
  }

  addTool(data){
    const url = this.bridgeURL + '/tools/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importTool(data){
    const url = this.bridgeURL + '/tools/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteTool(id){
    const url = this.bridgeURL + '/tools/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateTool(id,data) {
    const url = this.bridgeURL + '/tools/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getTool(id) {
    const url = this.bridgeURL + '/tools/id/'+id;
    return this.link.get<any[]>(url);
  }

  getReasons() {
    const url = this.bridgeURL + '/reasons/all';
    return this.link.get<any[]>(url);
  }

  addReason(data){
    const url = this.bridgeURL + '/reasons/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importReasons(data){
    const url = this.bridgeURL + '/reasons/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteReason(id){
    const url = this.bridgeURL + '/reasons/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateReason(id,data) {
    const url = this.bridgeURL + '/reasons/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getReason(id) {
    const url = this.bridgeURL + '/reasons/id/'+id;
    return this.link.get<any[]>(url);
  }

  getTradeCategories() {
    const url = this.bridgeURL + '/tradecategories/all';
    return this.link.get<any[]>(url);
  }

  addTradeCategory(data){
    const url = this.bridgeURL + '/tradecategories/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importTradeCategories(data){
    const url = this.bridgeURL + '/tradecategories/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteTradeCategory(id){
    const url = this.bridgeURL + '/tradecategories/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateTradeCategory(id,data) {
    const url = this.bridgeURL + '/tradecategories/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getTradeCategory(id) {
    const url = this.bridgeURL + '/tradecategories/id/'+id;
    return this.link.get<any[]>(url);
  }

  getProducts() {
    const url = this.bridgeURL + '/products/all';
    return this.link.get<any[]>(url);
  }

  addProduct(data){
    const url = this.bridgeURL + '/products/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  importProduct(data){
    const url = this.bridgeURL + '/products/import/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteProduct(id){
    const url = this.bridgeURL + '/products/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateProduct(id,data) {
    const url = this.bridgeURL + '/products/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getProduct(id) {
    const url = this.bridgeURL + '/products/id/'+id;
    return this.link.get<any[]>(url);
  }

  getQuestions() {
    const url = this.bridgeURL + '/questions/all';
    return this.link.get<any[]>(url);
  }

  addQuestion(data){
    const url = this.bridgeURL + '/questions/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteQuestion(id){
    const url = this.bridgeURL + '/questions/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  updateQuestion(id,data) {
    const url = this.bridgeURL + '/questions/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getQuestion(id) {
    const url = this.bridgeURL + '/questions/id/'+id;
    return this.link.get<any[]>(url);
  }

  addWeeklyReport(data) {
    const url = this.bridgeURL + '/weekly-reports/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateWeeklyReport(id, data) {
    const url = this.bridgeURL + '/weekly-reports/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateWeeklyReportWithImage(id, data) {
    const url = this.bridgeURL + '/weekly-reports/update/with-images/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  checkExistWeeklyReport(data) {
    const url = this.bridgeURL + '/weekly-reports/check-exist/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  updateProjectWeeklyReport(data) {
    const url = this.bridgeURL + '/weekly-reports/project-update/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }
  

// DAILY REPORTS

  getDailyReports() {
    const url = this.bridgeURL + '/daily-reports/all';
    return this.link.get<any[]>(url);
  }

  addDailyReport(data) {
    const url = this.bridgeURL + '/daily-reports/add/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getDailyReport(data) {
    const url = this.bridgeURL + '/daily-reports/get/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  getDailyReportPreload(data) {
    const url = this.bridgeURL + '/daily-reports/preload/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  filterDailyReports(id) {
    const url = this.bridgeURL + '/daily-reports/filter/id/'+id;
    return this.link.get<any[]>(url);
  }

  deleteDailyReport(id){
    const url = this.bridgeURL + '/daily-reports/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  filterDailyReportbyDate(data) {
    const url = this.bridgeURL + '/daily-reports/filter-date/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  filterDailyReportbyDate2(data) {
    const url = this.bridgeURL + '/daily-reports/filter-date2/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  filterDailyReportbyDateRange(data) {
    const url = this.bridgeURL + '/daily-reports/filter-date-range/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  filterDailyReportbyDateRange2(data) {
    const url = this.bridgeURL + '/daily-reports/filter-date-range2/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  filterDailyReportTradebyDate(data) {
    const url = this.bridgeURL + '/daily-reports/filter-date-trade/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  filterDailyReportTradebyDateRange(data) {
    const url = this.bridgeURL + '/daily-reports/filter-date-range-trade/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  // WEEKLY REPORTS

  getWeeklyReports() {
    const url = this.bridgeURL + '/weekly-reports/all';
    return this.link.get<any[]>(url);
  }

  filterWeeklyReports(id) {
    const url = this.bridgeURL + '/weekly-reports/filter/id/'+id;
    return this.link.get<any[]>(url);
  }

  getWeeklyReportsClient(id) {
    const url = this.bridgeURL + '/weekly-reports/client/'+id;
    return this.link.get<any[]>(url);
  }

  getWeeklyReportsSupervisor(id) {
    const url = this.bridgeURL + '/weekly-reports/supervisor/'+id;
    return this.link.get<any[]>(url);
  }

  geDailyReportsSupervisor(id) {
    const url = this.bridgeURL + '/daily-reports/supervisor/'+id;
    return this.link.get<any[]>(url);
  }

  getProjectsClient(id) {
    const url = this.bridgeURL + '/weekly-reports/client-project/'+id;
    return this.link.get<any[]>(url);
  }
 
  getProjectsSupervisor(id) {
    const url = this.bridgeURL + '/weekly-reports/supervisor-project/'+id;
    return this.link.get<any[]>(url);
  }

  getProjectsWorker(id) {
    const url = this.bridgeURL + '/weekly-reports/worker-project/'+id;
    return this.link.get<any[]>(url);
  }

  getWeeklyReportsQuery(data) {
    const url = this.bridgeURL + '/weekly-reports/query';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getArchivedWeeklyReportsQuery(data) {
    const url = this.bridgeURL + '/archived-reports/query';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getClientWeeklyReportsQuery(id, data) {
    const url = this.bridgeURL + '/client-reports/query/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getWeeklyReport(id) {
    const url = this.bridgeURL + '/weekly-reports/id/'+id;
    return this.link.get<any[]>(url);
  }

  deleteWeeklyReport(id){
    const url = this.bridgeURL + '/weekly-reports/delete/'+id;
    return this.link.post<any[]>(url, this.httpOptions)
  }

  // ARCHIVE REPORTS

  getArchiveReports() {
    const url = this.bridgeURL + '/archive-reports/all';
    return this.link.get<any[]>(url);
  }

  deleteWeeklyReportsImages(data){
    const url = this.bridgeURL + '/weekly-reports/delete-images/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  archiveWeeklyReportsProjects1(id){
    const url = this.bridgeURL + '/weekly-reports/archive/project1/'+id;
    return this.link.get<any[]>(url, this.httpOptions)
  }

  archiveWeeklyReportsProjects2(data){
    const url = this.bridgeURL + '/weekly-reports/archive/project2/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  archiveWeeklyReportsProjects3(id){
    const url = this.bridgeURL + '/weekly-reports/archive/project3/'+id;
    return this.link.get<any[]>(url, this.httpOptions)
  }

  submitForApproval(data) {
    const url = this.bridgeURL + '/report/send/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  submitForClientApproval(data) {
    const url = this.bridgeURL + '/report/send-client/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  submitForClientProjectRequest(data) {
    const url = this.bridgeURL + '/report/send-client-project-request/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 
  // uploadImage(data) {
  //   const url = this.bridgeURL + '/image/upload/';
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // }  

  getEmailSettings() {
    const url = this.bridgeURL + '/email-settings/';
    return this.link.get<any[]>(url);
  }

  updateEmailSettings(data) {
    const url = this.bridgeURL + '/email-settings/update/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  // TIME LOGS
  submitTime(data) {
    const url = this.bridgeURL + '/time/submit-time/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  getTime(data) {
    const url = this.bridgeURL + '/time/get-time/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  getDefaultTime(data) {
    const url = this.bridgeURL + '/time/get-default-time/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  updateTime(id,data) {
    const url = this.bridgeURL + '/time/update-time/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  approveTime(data){
    const url = this.bridgeURL + '/time/approve-time/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  rejectTime(data){
    const url = this.bridgeURL + '/time/reject-time/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }
  
  archiveTime(data){
    const url = this.bridgeURL + '/time/archive-time/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  unarchiveTime(data){
    const url = this.bridgeURL + '/time/unarchive-time/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  deleteTime(data){
    const url = this.bridgeURL + '/time/delete/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }
  
  // UPLOAD IMAGES DAILY
  uploadImages(id,data) {
    const url = this.bridgeURL + '/image/add/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  // UPDATE IMAGES DAILY
  updateImages(id,data) {
    const url = this.bridgeURL + '/image/update/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  // GetPLOAD IMAGES DAILY
  getImages(id,data) {
    const url = this.bridgeURL + '/image/get/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  
  // GetPLOAD IMAGES DAILY
  getWeeklyImagesDiary(id,data) {
    const url = this.bridgeURL + '/image/get-weekly/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  // GetPLOAD IMAGES Worker
  // getWeeklyImagesWorker(id,data) {
  //   const url = this.bridgeURL + '/image/get-weekly-worker/'+id;
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // } 

  // // Task
  // getTask(id,data) {
  //   const url = this.bridgeURL + '/task/get-task/'+id;
  //   return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  // } 

  // Get Weekly Worker Logs
  getWeeklyWorkerlogs(id,data) {
    const url = this.bridgeURL + '/get-weekly-worker-logs/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  // Get Previous Week Data
  getPreviousWeeklyReportData(id,data) {
    const url = this.bridgeURL + '/get-previous-weekly-report-data/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  // Get Daily Worker Logs
  getDailyWorkerlogs(id,data) {
    const url = this.bridgeURL + '/get-daily-worker-logs/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  getDailyWorkerlog(id) {
    const url = this.bridgeURL + '/get-daily-worker-log/'+id;
    return this.link.get<any[]>(url);
  } 

   // Get Diary Weather
   getDiaryWeather(id,data) {
    const url = this.bridgeURL + '/weather/get-weather/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  // Get Diary Weather for All week
  getDiaryData(id,data) {
    const url = this.bridgeURL + '/weekly/get-daily-data/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  getTemperature(data) {
    const url = this.bridgeURL + '/temperature/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
    // const url = environment.baseUrl + '/data/2.5/weather';
    // const params = new HttpParams()
    // .set('appid', environment.appId)
    // .set('zip', zip+','+code)
    // .set('units', 'metric');

    // let httpOptions2 = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'text/plain'
    //   })
    // } 
    // return this.link.get<any[]>(url,{params});

  } 
  
  //Submit Feedback
  submitFeedback(data){
    const url = this.bridgeURL + '/feedback/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  submitFeedbackImage(data,updateID){
    const url = this.bridgeURL + '/feedback/image/'+updateID;
    return this.link.post<any[]>(url, data)
  }

  //Submit Error
  submitError(data){
    const url = this.bridgeURL + '/submit-error/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }


   //ACTIVITY LOG
 
  addActivityLog(id,data) {
    const url = this.bridgeURL + '/logs/add/'+id;
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  } 

  getActivityLogs(curpage,perpage) {
    const url = this.bridgeURL + '/logs?page='+curpage+'&perpage='+perpage;
    return this.link.get<any[]>(url)
  } 

  getActivityLogsQuery(curpage,perpage,data) {
		const url = this.bridgeURL + '/logs/query?page='+curpage+'&perpage='+perpage;
		return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }	
  
  getDiaryOptions() {
		const url = this.bridgeURL + '/options/get';
    return this.link.get<any[]>(url);
	}	

  // Dashboard Lists


  getDashboardWidgetList() {
    const url = this.bridgeURL + '/dashboard-widgets-list';
    return this.link.get<any[]>(url);
  }

  getDashboardSearch(data) {
		const url = this.bridgeURL + '/dashboard-search';
		return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }	

  //Project Request

  getAllProjectRequest() {
    const url = this.bridgeURL + '/project-request/all';
    return this.link.get<any[]>(url);
  }

  getProjectRequest(id) {
    const url = this.bridgeURL + '/project-request/id/'+id;
    return this.link.get<any[]>(url);
  }

  addProjectRequest(data){
    const url = this.bridgeURL + '/project-request/add/';
    return this.httpWithoutInterceptor.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  approveProjectRequest(data){
    const url = this.bridgeURL + '/project-request/approve/';
    return this.httpWithoutInterceptor.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  getProjectRequestEmailSettings() {
    const url = this.bridgeURL + '/project-request/email/';
    return this.httpWithoutInterceptor.get<any[]>(url);
  }
  
  forgotPassword(data){
    const url = this.resetUrl + '/reset-password';
    return this.httpWithoutInterceptor.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  validatePasswordCode(data){
    const url = this.resetUrl + '/validate-code';
    return this.httpWithoutInterceptor.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  resetPassword(data){
    const url = this.resetUrl + '/set-password';
    return this.httpWithoutInterceptor.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  //Google Image

  getGoogleImages(data){
    const url = this.bridgeURL + '/google/get-images/';
    return this.link.post<any[]>(url, JSON.stringify(data), this.httpOptions)
  }

  // SEARCH 
  searchCollection(collectionName: string, query: string, id?:string): Observable<any[]> {
  
    // Make a simple query to Firestore to fetch documents where a field contains the search term
    if (collectionName == 'users') {
      console.log('collectionanem',collectionName);
      console.log('query', query);
      return this.afs
        .collection(collectionName, ref =>
          ref.where('userFirstName', '>=', query)
            .where('userFirstName', '<=', query + '\uf8ff')
        )
        .valueChanges();
    } else if (collectionName == 'variations') {
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection(collectionName, ref =>
        ref.where('projectId', '==', id)
        .where('variationsName', '>=', query)
        .where('variationsName', '<=', query + '\uf8ff')
          //  .where('variationsName', '>=', query)
          //  .where('variationsName', '<=', query + '\uf8ff')
          // .where('variationsName', '==', query)
      ).valueChanges();
    } else if(collectionName == 'selections'){
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection(collectionName, ref =>
        ref.where('projectId', '==', id)
        .where('selectionName', '>=', query)
        .where('selectionName', '<=', query + '\uf8ff')
      ).valueChanges();
    } else if(collectionName == 'rfis'){
      return this.afs.collection('/accounts').doc(this.accountFirebase).collection(collectionName, ref =>
        ref.where('projectId', '==', id)
        .where('rfiName', '>=', query)
        .where('rfiName', '<=', query + '\uf8ff')
      ).valueChanges();
    }
  
    // Return an empty array if no matching collection
    // return [];
  }


  // UPDATE RFI RECEIPIENT EMAIL
  updateRecipientEmails(emails: string[], projectId: string, type:string) {
    console.log('emails:', emails);
    const itemCol = this.afs.collection('/accounts')
      .doc(this.accountFirebase)
      .collection('/projects')
      .doc(projectId);
   
      let updateItems
      if(type == 'Rfi'){
         updateItems = itemCol.update({ recipientRFI: emails })
      } else if(type == 'Variation'){
        updateItems = itemCol.update({recipientVariation: emails})
      } else if(type == 'Selection'){
        updateItems = itemCol.update({recipientSelection: emails})
      }
    return updateItems
      .then(() => {
        console.log(`Field "recipient${type}" updated successfully`);
        return { success: true, message: 'Recipients updated successfully' }; // Return a success response
      })
      .catch((error) => {
        console.error('Error updating Firestore document:', error);
        throw error; // Propagate the error to the caller
      });
  }

  // UPDATE CCS AND BCCS
  updateCCsAndBCCs(emails: string[], type: 'cc' | 'bcc', projectId: string, moduleName?:string): any {
    console.log('email',emails);
    console.log("type", type);
    console.log('projectId', projectId);
    console.log('modulename',moduleName);
    const itemCol = this.afs
      .collection('/accounts')
      .doc(this.accountFirebase)
      .collection('/projects')
      .doc(projectId);
      
      console.log('emails', emails);
      console.log('type', type);
      console.log('projectId', projectId);
    let key
    if(moduleName == 'variation'){
      key = 'VariationEmail'
    } else if(moduleName == 'selection'){
      key = 'selectionEmail'
    } else if (moduleName == 'rfi'){
      key = 'rfiEmail'
    }
    const updateField = type === 'cc' 
    ? { [`${key}CC`]: emails }  
    : { [`${key}BCC`]: emails };

    console.log('updatefield', updateField);

    return itemCol.update(updateField)
      .then(() => {
        console.log(`Field "clientEmail${type.toUpperCase()}" updated successfully`);
        return { success: true, message: 'Recipients updated successfully' };
      })
      .catch((error) => {
        console.error('Error updating Firestore document:', error);
        throw error;
      });
  }

  // CHANGE TABLE LIMIT
  async changeTableLimit(email: string, length: number, moduleName?: any) {
    console.log('moduleName:', email);
    
    // Fetch the document reference based on email
    const querySnapshot = await this.afs.collection('/users', ref => ref
      .where('userEmail', '==' , email)).get().toPromise();
    console.log('querySnapshot', querySnapshot);
    
    // Check if the document exists
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;  // Get the first matching document ID
      const itemDoc = this.afs.collection('/users').doc(docId);  // Reference to the document
      console.log('itemDoc', itemDoc);
      
      // Determine the key based on moduleName
      let key = moduleName;
      // if (moduleName === 'project') {
      //   key = 'project';
      // } else if (moduleName === 'variation') {
      //   key = 'variation';
      // } else if(moduleName === 'selection'){
      //   key = 'selection'
      // } else if (moduleName === 'rfi'){
      //   key = rfi
      // }
  
      // Get the current TableLimits
      const userDoc:any = await itemDoc.get().toPromise();
      const currentTableLimits = userDoc.data()?.TableLimits || [];
      
      // Check if the key already exists in the TableLimits array
      let keyExists = false;
      for (let i = 0; i < currentTableLimits.length; i++) {
        if (currentTableLimits[i][`${key}Tablelimit`] !== undefined) {
          currentTableLimits[i][`${key}Tablelimit`] = length;  // Update the existing value
          keyExists = true;
          break;
        }
      }
  
      // If key doesn't exist, push the new entry into TableLimits
      if (!keyExists) {
        const updatedTableLimit = {
          [`${key}Tablelimit`]: length
        };
        currentTableLimits.push(updatedTableLimit);
      }
  
      // Update the TableLimits in Firestore
      await itemDoc.update({
        TableLimits: currentTableLimits
      });
  
      console.log('TableLimits updated successfully');
    } else {
      console.log('No matching document found');
    }
  }
  
  // GET TABLE DATA
 // Function in your service (data_api) to fetch the table limit
 async getTableLimit(email: string, moduleName?: string): Promise<number | null> {
  console.log('email:', email);
  
  try {
    // Fetch the document based on email
    const querySnapshot = await this.afs.collection('/users', ref => ref
      .where('userEmail', '==', email)).get().toPromise();

    // Check if we found any matching documents
    if (!querySnapshot.empty) {
      const doc: any = querySnapshot.docs[0];  // Get the first matching document
      console.log('doc:', doc);

      const tableLimits = doc.data().TableLimits; // Assuming TableLimits is an array in the document

      if (tableLimits && tableLimits.length > 0) {

        let data = `${moduleName}Tablelimit`
        // if (moduleName === 'project') {
        //   data = 'projectTablelimit';
        // } else if (moduleName === 'variation') {
        //   data = 'variationTablelimit';
        // } else if(moduleName === 'selection'){
        //   data = 'selectionTablelimit'
        // }

        // Loop through TableLimits to find the correct key and return its value
        let projectTableLimit = null;
        for (let i = 0; i < tableLimits.length; i++) {
          if (tableLimits[i][data] !== undefined) {
            projectTableLimit = tableLimits[i][data];
            break;  // Exit the loop once we find the value
          }
        }

        console.log('Project Table Limit:', projectTableLimit);

        // Return the projectTablelimit value so it can be used elsewhere
        return projectTableLimit;
      } else {
        console.log('No TableLimits found for this user.');
        return null;  // No TableLimits field found
      }
    } else {
      console.log('No user found with the given email.');
      return null;  // No user found
    }
  } catch (error) {
    console.error('Error fetching table limit:', error);
    return null;  // In case of an error, return null
  }
}


  
}
