const mainApp = document.querySelector(".app");
const firebaseAuthContainer = document.querySelector(
  "#firebaseui-auth-container"
);
const logOutButton = document.querySelector(".logout");
const createpostElement = document.querySelector(".create-post");
const uploadButton = document.querySelector(".upload");
const instagramButton = document.querySelector(".instagram");
const filesEl = document.querySelector("#files");
const sendButton = document.querySelector("#send");
const uploading = document.querySelector("#uploading");
const progressEl = document.querySelector("#progress");
// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu_Hq9SeSitOWerRvgxLpQ93oHGV3Tt8U",
  authDomain: "instagram-clone-49c9d.firebaseapp.com",
  projectId: "instagram-clone-49c9d",
  storageBucket: "instagram-clone-49c9d.firebasestorage.app",
  messagingSenderId: "878787730844",
  appId: "1:878787730844:web:16f2726e2db6930370bc59",
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
const storageRef = storage.ref("test-path");
const db = firebase.firestore();
const ui = new firebaseui.auth.AuthUI(firebase.auth());
console.log(app);
console.log(auth);
console.log(storage);
console.log(storageRef);
console.log(db);

function redirectToAuth() {
  mainApp.style.display = "none";
  createpostElement.style.display = "none";
  firebaseAuthContainer.style.display = "block";

  ui.start("#firebaseui-auth-container", {
    callbacks: {
      signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        console.log("authResult", authResult.user.uid);
        // this.userId = authResult.user.uid;
        // this.$authUserText.innerHTML = user.displayName;
        redirectToApp();
      },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    // signInFlow: 'popup',
    // signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    //other config options
  });
};
function redirectToApp (){
  mainApp.style.display = "block";
  firebaseAuthContainer.style.display = "none";
  createpostElement.style.display = "none";
};

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log(user.uid);
    // this.userId = user.uid;
    // this.$authUserText.innerHTML = user.displayName;
    redirectToApp();
  } else {
    // console.log("not loggedin");
    redirectToAuth();
  }
});

logOutButton.addEventListener("click", () => {
  console.log("user signed out");
  handleLogout();
});

function handleLogout (){
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      createpostElement.style.display = "none";
      redirectToAuth();
      console.log("user signed out");
    })
    .catch((error) => {
      // An error happened.
      console.log("An error has occured");
    });
};

uploadButton.addEventListener("click", () => {
  createPostHandler();
});

function createPostHandler(){
  mainApp.style.display = "none";
  firebaseAuthContainer.style.display = "none";
  createpostElement.style.display = "block";
};

instagramButton.addEventListener("click", () => {
  redirectToApp();
});

let files = [];
filesEl.addEventListener("change", (e) => {
  files = e.target.files;
});

const fileRef = storage.ref("akhil.png");
console.log("hi", storage);
fileRef
  .getDownloadURL()
  .then(function (url) {
    console.log(url);
  })
  .catch(function (error) {
    console.log("error encountered");
  });

sendButton.addEventListener("click", () => {
  //checks if files are selected

  if (files.length != 0) {
    //loops through all the selected files
    for (let i = 0; i < files.length; i++) {
      //create a storage reference
      let storageRef = firebase.storage().ref(files[i].name);
      //upload file
      const upload = storageRef.put(files[i]);
      //update progressbar
      upload.on(
        "state_changed",
        function progress(snapshot) {
          let percentage =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressEl.value = percentage;
        },
        function error() {
          alert("error uploading file");
        },
        function completed() {
          // Get the download URL
          upload.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            // Create post object
            const post = {
              userId: firebase.auth().currentUser.uid,
              caption: document.querySelector("#caption").value,
              photoURL: downloadURL,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            };
            // Add post to Firestore
            db.collection("posts")
              .add(post)
              .then(function (docRef) {
                console.log("Post created with ID: ", docRef.id);
                uploading.innerHTML += `${files[i].name} uploaded and post created <br />`;
              })
              .catch(function (error) {
                console.error("Error adding post: ", error);
              });
          });
        }
      );
    }
  } else {
    alert("No file chosen");
  }
});
