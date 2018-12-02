$(function(){
  //- Initialize Firebase
  var config = {
    apiKey: "AIzaSyC-XWwfh5qmk4eb8Uy4EyEj5d6FSbrSQsI",
    authDomain: "the-works-alison.firebaseapp.com",
    databaseURL: "https://the-works-alison.firebaseio.com",
    projectId: "the-works-alison",
    storageBucket: "the-works-alison.appspot.com",
    messagingSenderId: "893353596974"
  };
  firebase.initializeApp(config);
  $(".contact__form").on('submit', event => {
    event.preventDefault();
    const name = $("#name").val();
    const email = $("#email").val();
    const message = $("#message").val();
    firebase.database().ref("contacts").push({
      name, 
      email,
      message,
    })
    $(".contact__form").trigger("reset");
  })
})