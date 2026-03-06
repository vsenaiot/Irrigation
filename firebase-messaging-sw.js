importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCQcgEN51zZ3wnQGt3cd2cTBKpfsR55VEU",
  authDomain: "irrigation-iot-esp.firebaseapp.com",
  databaseURL: "https://irrigation-iot-esp-default-rtdb.firebaseio.com",
  projectId: "irrigation-iot-esp",
  storageBucket: "irrigation-iot-esp.firebasestorage.app",
  messagingSenderId: "877141032044",
  appId: "1:877141032044:web:e5f4c417466ce936f76c49"
});

const messaging = firebase.messaging();
