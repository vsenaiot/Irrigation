// app.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyCQcgEN51zZ3wnQGt3cd2cTBKpfsR55VEU",
    authDomain: "irrigation-iot-esp.firebaseapp.com",
    databaseURL: "https://irrigation-iot-esp-default-rtdb.firebaseio.com",
    projectId: "irrigation-iot-esp",
    storageBucket: "irrigation-iot-esp.firebasestorage.app",
    messagingSenderId: "877141032044",
    appId: "1:877141032044:web:e5f4c417466ce936f76c49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

const motorId = "device_001";

// References for dashboard elements
const motorCard = document.getElementById("motorCard");
const motorBtn = document.getElementById("motorBtn");
const motorValuesRef = ref(db, `devices/${motorId}/sensors`);
const motorStatusRef = ref(db, `devices/${motorId}/status`);
const valvesContainer = document.getElementById("valveContainer");
const valvesButtons = [];

// --- LOGIN ---
window.login = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(err => {
            document.getElementById("loginError").innerText = err.message;
        });
};

// --- LOGOUT ---
window.logout = function() {
    signOut(auth);
};

// --- Auth Listener ---
onAuthStateChanged(auth, user => {
    if(user){
        document.getElementById("loginDiv").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        startDashboard();
    } else {
        document.getElementById("loginDiv").style.display = "block";
        document.getElementById("dashboard").style.display = "none";
    }
});

// --- START DASHBOARD AFTER LOGIN ---
function startDashboard(){

    valvesContainer.innerHTML = "";
    valvesButtons.length = 0;

    // Motor Toggle
    motorBtn.onclick = async () => {
        const snap = await get(ref(db, `devices/${motorId}/control/motor`));
        const current = snap.val();
        set(ref(db, `devices/${motorId}/control/motor`), current===1?0:1);
    };

    // Motor Sensors
    onValue(motorValuesRef, snap => {
        const data = snap.val();
        if(data){
            document.getElementById("rPhase").innerText = data.voltage.phase_r + " V";
            document.getElementById("yPhase").innerText = data.voltage.phase_y + " V";
            document.getElementById("bPhase").innerText = data.voltage.phase_b + " V";

            document.getElementById("rCurrent").innerText = data.current.phase_r + " A";
            document.getElementById("yCurrent").innerText = data.current.phase_y + " A";
            document.getElementById("bCurrent").innerText = data.current.phase_b + " A";

            document.getElementById("pressure").innerText = data.pressure;
        }
    });

    // Motor Status + Valves
    onValue(motorStatusRef, snap=>{
        const data = snap.val();
        if(data){

            document.getElementById("ebStatus").innerText = data.eb_power;
            document.getElementById("status").innerText = data.motor?"ON":"OFF";

            if(data.motor){
                motorCard.classList.add("on");
                motorCard.classList.remove("off");
                motorBtn.innerText="ON";
            } else {
                motorCard.classList.add("off");
                motorCard.classList.remove("on");
                motorBtn.innerText="OFF";
            }

            if(data.valves){
                valvesButtons.forEach((v)=>{
                    const val = data.valves[v.valveId];
                    if(val===1){
                        v.card.classList.add("on");
                        v.card.classList.remove("off");
                        v.button.innerText="ON";
                    } else {
                        v.card.classList.add("off");
                        v.card.classList.remove("on");
                        v.button.innerText="OFF";
                    }
                });
            }
        }
    });

    // Create valves
    for(let i=1;i<=8;i++){

        const card = document.createElement("div");
        card.className="card off";

        const title = document.createElement("h4");
        title.innerText = "Valve " + i;

        const img = document.createElement("img");
        img.src="assets/valve.png";  // ✅ corrected path

        const button = document.createElement("button");
        button.innerText="OFF";

        card.appendChild(title);
        card.appendChild(img);
        card.appendChild(button);
        valvesContainer.appendChild(card);

        valvesButtons.push({card, button, valveId:`v${i}`});

        button.onclick = async () => {

            // Start blinking
            card.classList.add("processing");

            const snap = await get(ref(db, `devices/${motorId}/control/valves/v${i}`));
            const val = snap.val();
            set(ref(db, `devices/${motorId}/control/valves/v${i}`), val===1?0:1);

            // Stop blinking after 1 second
            setTimeout(()=>{
                card.classList.remove("processing");
            },1000);
        };
    }
}
