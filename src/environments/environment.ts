// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // appId: 'fe48000468c9969ec4c8a11f01ba7372',
  baseUrl: '/api',
  firebase: {
    // apiKey: 'AIzaSyDqB5JkGT7wTX3VvIXlIxJqNbSfST98RhQ',
    // authDomain: 'diary-app-dd67c.firebaseapp.com',
    // projectId: 'diary-app-dd67c',
    // storageBucket: 'diary-app-dd67c.appspot.com',
    // messagingSenderId: '1098266361050',
    // appId: '1:1098266361050:web:3ddcd4df975f766ba379e3',

    // TRADIES DIARIES

    apiKey: "AIzaSyBkCKCPyDH2g_pOSWtAo4XbCIIVe-p44mg",
    authDomain: "tradies-diary.firebaseapp.com",
    projectId: "tradies-diary",
    storageBucket: "tradies-diary.appspot.com", 
    messagingSenderId: "952186528665",
    appId: "1:952186528665:web:084c647fdcc14e1b11a908"


    // TRADIES TESTING
    // apiKey: "AIzaSyBDyJ0qlN1plui2WkIDnOklRhq9h_YYNKw",
    // authDomain: "tradies-testing-444503.firebaseapp.com",
    // projectId: "tradies-testing-444503",
    // storageBucket: "tradies-testing-444503.firebasestorage.app",
    // messagingSenderId: "86042921892",
    // appId: "1:86042921892:web:fe36d6625e4aaa07facf31",
  }
};
