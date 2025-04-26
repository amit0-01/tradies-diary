import { Injectable } from '@angular/core';
// import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, Subject } from 'rxjs';
// import { User } from  'firebase';
// import { auth } from  'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders, HttpBackend  } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {AngularFireAuth} from '@angular/fire/compat/auth'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { DatasourceService } from '../services/datasource.service';

declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  accountFirebase;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute,
    handler: HttpBackend, 
    public firebaseAuth : AngularFireAuth,
    private afs: AngularFirestore,
    private data_api: DatasourceService,
    ) {
      
    // this.firebaseAuth.authState.subscribe((user) => {
    //   if (user) {

    //     user.getIdTokenResult()
    //     .then( idTokenResult => {
    //       if(idTokenResult.claims){
    //           localStorage.setItem('currentUser', JSON.stringify(idTokenResult.claims));
    //           JSON.parse(localStorage.getItem('currentUser')!);
    //       }else{
    //         localStorage.setItem('currentUser', 'null');
    //         JSON.parse(localStorage.getItem('currentUser')!);
    //         this.router.navigate(['/pages/login']);
    //       }
              
    //     });

    //   } else {
    //     localStorage.setItem('currentUser', 'null');
    //     JSON.parse(localStorage.getItem('currentUser')!);
    //     // this.router.navigate(['/pages/login']);
    //   }

    // })

    this.accountFirebase = this.data_api.getCurrentProject();

  }

  signin(email: string, password : string){
    console.log(this.firebaseAuth, 'firebaseauth')
    return this.firebaseAuth.signInWithEmailAndPassword(email,password)
    .then((result) => {
      console.log(result);
      this.firebaseAuth.authState.subscribe((user) => {
        if (user) {

          user.getIdTokenResult()
          .then( idTokenResult => {            
            if(idTokenResult.claims){              
              if(idTokenResult.claims.user_id){
                this.data_api.getFBUser(idTokenResult.claims.user_id).subscribe((data) => {
                  console.log('data', data);

                  if (data?.userAccounts?.includes(this.accountFirebase)) {
                    console.log('User account exists:', data.userAccounts);
                    localStorage.setItem('firstUserRole', JSON.stringify(idTokenResult.claims.userRole))
                    localStorage.setItem('currentUser', JSON.stringify(idTokenResult.claims));
                
                    let currentUserData = localStorage.getItem("currentUser");
                    currentUserData = currentUserData ? JSON.parse(currentUserData) : [];
                
                    console.log(currentUserData);
                
                    currentUserData['validAccount'] = true;

                    console.log(currentUserData);
                
                    localStorage.setItem("currentUser", JSON.stringify(currentUserData));
                
                    this.doClaimsNavigation();
                  } else{
                    this.router.navigate(['/pages/login']);
                    alert('You are not registered as a user on this account');
                  }
                });
                
              }

              
            }else{
              localStorage.setItem('currentUser', 'null');
              JSON.parse(localStorage.getItem('currentUser')!);
              this.router.navigate(['/pages/login']);
            }

          });

        }
      });

    })
    .catch((error) => {

      window.alert(error.message);
    });

    // .then(res=>{

    //   // this.firebaseAuth.idTokenResult.subscribe(idTokenResult => {
    //   //     console.log(idTokenResult);
    //   //     // const claims = idTokenResult.claims;
    //   // });

    //   this.isLoggedIn = true
    //   localStorage.setItem('currentUser',JSON.stringify(res.user))
    //   console.log(res);
      
    //   $.notify({
    //     icon: 'notifications',
    //     message: 'Welcome to <b> Dashboard</b>.'
    //   }, {
    //       type: 'success',
    //       timer: 1000,
    //       placement: {
    //           from: 'top',
    //           align: 'center'
    //       },
    //       template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
    //         '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
    //         '<i class="material-icons" data-notify="icon">notifications</i> ' +
    //         '<span data-notify="title">{1}</span> ' +
    //         '<span data-notify="message">{2}</span>' +
    //         '<div class="progress" data-notify="progressbar">' +
    //           '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
    //         '</div>' +
    //         '<a href="{3}" target="{4}" data-notify="url"></a>' +
    //       '</div>'
    //   });

    //   this.router.navigate(['/dashboard']);
    
    // })
  }

  doClaimsNavigation() {

      console.log('\nWaiting for claims navigation...')

      if (localStorage.getItem('currentUser')) {
          console.log(JSON.parse(localStorage.getItem('currentUser')));
          let userDetails = JSON.parse(localStorage.getItem('currentUser'));
          let userRole = userDetails.userRole;
          console.log(userRole);

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

          if(returnUrl){
            this.router.navigateByUrl(returnUrl);
          }else{
              if (userRole == 'app_admin') {
                this.router.navigate(['/dashboard']);
              }else if(userRole == 'project_supervisor') {
                this.router.navigate(['/dashboard-supervisor']);
              }else if(userRole == 'project_owner') {
                this.router.navigate(['/dashboard-client']);
              }else if(userRole == 'project_worker') {
                this.router.navigate(['/dashboard-worker']);
              }
              else {
                this.router.navigate(['/pages/login']);
              }
          }
      }
  }

  async signup(email: string, password : string){
    await this.firebaseAuth.createUserWithEmailAndPassword(email,password)
    .then(res=>{
      localStorage.setItem('currentUser',JSON.stringify(res.user));
    })
  }
  
  logoutMe(){
    this.firebaseAuth.signOut();
    localStorage.removeItem('currentUser');
    window.location.reload();
  }

  // login(username: string, password: string) {


  //     this.apiURL =  'https://api-staging.tradiesdiary.com/wp-json/jwt-auth/v1/token';

  //   }else if(location.origin == 'https://testing.tradiesdiary.com'){
      
  //     this.apiURL = 'https://apitesting.tradiesdiary.com/wp-json/jwt-auth/v1/token';

  //   }else{

  //     var full = window.location.host
  //     //window.location.host is subdomain.domain.com
  //     var parts = full.split('.')
  //     var sub = parts[0]
  //     this.apiURL = 'https://api-'+sub+'.tradiesdiary.com/wp-json/jwt-auth/v1/token';

  //   }
  //   console.log(this.apiURL);
  //   console.log(username);
  //   console.log(password);
  //   let body: HttpParams = new HttpParams();
  //   body = body.append('username', username);
  //   body = body.append('password', password);

  //       // let mybody = 'user_name=' + username + '&password=' + password;
  //       // return this.http.post<any>('http://balloonaloftcanberra.sitebyspin.com/wp-json/jwt-auth/v1/token', body,
  //       // return this.http.post<any>('http://balloonaloftcanberra.sitebyspin.com/wp-json/jwt-auth/v1/token', {
  //       //   username: username,
  //       //   password: password
  //       // })
  //   return this.http.post<any>(this.apiURL,body)
  //   // return this.http.post<any>('https://www.dcb.com.au/wp-json/jwt-auth/v1/token',body)
  //         .subscribe(
  //           // (res: Response) => {
  //           //   if(res){
  //           //     console.log(res);
  //           //   }
  //           // }
  //           res => {
  //             if(res){
  //               console.log(res)
  //               localStorage.setItem('currentUser', JSON.stringify(res))

  //               let userDetails = JSON.parse(localStorage.getItem('currentUser'));
                
  //               // localStorage.setItem('currentCompany', 'BA')
                         

  //               if(userDetails.user_role =='project_owner'){

  //                   $.notify({
  //                     icon: 'notifications',
  //                     message: 'Welcome to <b>Owner Dashboard</b>.'
  //                   }, {
  //                       type: 'success',
  //                       timer: 1000,
  //                       placement: {
  //                           from: 'top',
  //                           align: 'center'
  //                       },
  //                       template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
  //                         '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
  //                         '<i class="material-icons" data-notify="icon">notifications</i> ' +
  //                         '<span data-notify="title">{1}</span> ' +
  //                         '<span data-notify="message">{2}</span>' +
  //                         '<div class="progress" data-notify="progressbar">' +
  //                           '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
  //                         '</div>' +
  //                         '<a href="{3}" target="{4}" data-notify="url"></a>' +
  //                       '</div>'
  //                   });

  //                   this.router.navigate(['/dashboard-client']);
  //               }else if(userDetails.user_role =='project_supervisor'){

  //                 $.notify({
  //                   icon: 'notifications',
  //                   message: 'Welcome to <b>Supervisor Dashboard</b>.'
  //                 }, {
  //                     type: 'success',
  //                     timer: 1000,
  //                     placement: {
  //                         from: 'top',
  //                         align: 'center'
  //                     },
  //                     template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
  //                       '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
  //                       '<i class="material-icons" data-notify="icon">notifications</i> ' +
  //                       '<span data-notify="title">{1}</span> ' +
  //                       '<span data-notify="message">{2}</span>' +
  //                       '<div class="progress" data-notify="progressbar">' +
  //                         '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
  //                       '</div>' +
  //                       '<a href="{3}" target="{4}" data-notify="url"></a>' +
  //                     '</div>'
  //                 });

  //                   this.router.navigate(['/daily-report']);
  //               }else if(userDetails.user_role =='project_worker'){

  //                   $.notify({
  //                     icon: 'notifications',
  //                     message: 'Welcome to <b> Dashboard</b>.'
  //                   }, {
  //                       type: 'success',
  //                       timer: 1000,
  //                       placement: {
  //                           from: 'top',
  //                           align: 'center'
  //                       },
  //                       template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
  //                         '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
  //                         '<i class="material-icons" data-notify="icon">notifications</i> ' +
  //                         '<span data-notify="title">{1}</span> ' +
  //                         '<span data-notify="message">{2}</span>' +
  //                         '<div class="progress" data-notify="progressbar">' +
  //                           '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
  //                         '</div>' +
  //                         '<a href="{3}" target="{4}" data-notify="url"></a>' +
  //                       '</div>'
  //                   });

  //                   this.router.navigate(['/dashboard-worker']);

  //               }else if(userDetails.user_role =='app_admin'){

  //                 $.notify({
  //                   icon: 'notifications',
  //                   message: 'Welcome to <b>Admin Dashboard</b>.'
  //                 }, {
  //                     type: 'success',
  //                     timer: 1000,
  //                     placement: {
  //                         from: 'top',
  //                         align: 'center'
  //                     },
  //                     template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
  //                       '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
  //                       '<i class="material-icons" data-notify="icon">notifications</i> ' +
  //                       '<span data-notify="title">{1}</span> ' +
  //                       '<span data-notify="message">{2}</span>' +
  //                       '<div class="progress" data-notify="progressbar">' +
  //                         '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
  //                       '</div>' +
  //                       '<a href="{3}" target="{4}" data-notify="url"></a>' +
  //                     '</div>'
  //                 });

  //                 this.router.navigate(['/dashboard']);
  //               }

  //             }
  //           },
  //           err => {
  //             $.notify({
  //               icon: 'notifications',
  //               message: 'Either Username or Password is incorrect'
  //             }, {
  //                 type: 'danger',
  //                 timer: 1000,
  //                 placement: {
  //                     from: 'top',
  //                     align: 'center'
  //                 },
  //                 template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
  //                   '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
  //                   '<i class="material-icons" data-notify="icon">notifications</i> ' +
  //                   '<span data-notify="title">{1}</span> ' +
  //                   '<span data-notify="message">{2}</span>' +
  //                   '<div class="progress" data-notify="progressbar">' +
  //                     '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
  //                   '</div>' +
  //                   '<a href="{3}" target="{4}" data-notify="url"></a>' +
  //                 '</div>'
  //             });
  //           }
  //           // () => console.log('HTTP request completed.')
  //         );
  //       // .pipe(map((res: any) => {
  //       //   console.log(res);
  //       //     // login successful if there's a jwt token in the response
  //       //     if (res) {
  //       //         // store username and jwt token in local storage to keep user logged in between page refreshes
  //       //         // localStorage.setItem('currentUser', JSON.stringify(res));
  //       //         // if (res.program) {
  //       //         //     this.program = res.program.api_url;
  //       //         //     console.log(this.program);
  //       //         //     this.router.navigate([ 'program/' + this.program]);
  //       //         // } else {
  //       //         //     this.router.navigate(['']);
  //       //         // }
  //       //         console.log(res);
  //       //     }
  //       // }
        
  //       // ));
  //   }
    // logout(){
    //   localStorage.removeItem('currentUser');
    //   // $.notify({
    //   //   icon: 'notifications',
    //   //   message: 'Successfully Logged out.'
    //   // }, {
    //   //     type: 'success',
    //   //     timer: 3000,
    //   //     placement: {
    //   //         from: 'top',
    //   //         align: 'center'
    //   //     },
    //   //     template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
    //   //       '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
    //   //       '<i class="material-icons" data-notify="icon">notifications</i> ' +
    //   //       '<span data-notify="title">{1}</span> ' +
    //   //       '<span data-notify="message">{2}</span>' +
    //   //       '<div class="progress" data-notify="progressbar">' +
    //   //         '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
    //   //       '</div>' +
    //   //       '<a href="{3}" target="{4}" data-notify="url"></a>' +
    //   //     '</div>'
    //   // });
    //   window.location.reload();
    // }
//   async  login(email:  string, password:  string) {
//     try {
//           await  this.afAuth.auth.signInWithEmailAndPassword(email, password)
//           console.log('success');
//           this.router.navigate(['/dashboard']);
//       } catch (e) {
//           alert("Error!"  +  e.message);
//       }
//   }
//   async logout(){
//       await this.afAuth.auth.signOut();
//       localStorage.removeItem('user');
//       this.router.navigate(['pages/login']);
//   }
//   get isLoggedIn(): boolean {
//     const  user  =  JSON.parse(localStorage.getItem('user'));
//     return  user  !==  null;
// }

  // /* Sign in */
  // SignIn(email: string, password: string) {
  //   console.log('test2');
  //   this.angularFireAuth
  //     .auth
  //     .signInWithEmailAndPassword(email, password)
  //     .then(res => {
  //       console.log('Successfully signed in!');
  //     })
  //     .catch(err => {
  //       console.log('Something is wrong:',err.message);
  //     });
  // }

  // /* Sign out */
  // SignOut() {
  //   this.angularFireAuth
  //     .auth
  //     .signOut();
  // }  
  
}
