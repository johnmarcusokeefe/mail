document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // jok
  document.querySelector('#emails-list').style.display = 'none';


  // Clear out composition fields
  // allows adding recipient in reply emails
  if(this.id == "compose")
      document.querySelector('#compose-recipients').value = '';
      
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // jok
  document.querySelector('#emails-list').style.display = 'block';



  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = 
    `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  process_mail(mailbox)  
}

// get emails - boxtype 
function process_mail(boxtype) {
  // to fix appending each click
  document.querySelector('#emails-list').innerHTML = ""
  fetch('emails/'+boxtype) 
       .then(response => response.json())
       .then( emails => {
            emails.forEach(add_email);
          });   
         
}

function add_email(emaildata) {
    // Create new post
  console.log('emaildata', emaildata)
    const contents =  `
   <div class="sender float-left">${emaildata.sender}</div>
   <div class="subject float-left">${emaildata.subject}</div> 
   <div class="timestamp float-right">${emaildata.timestamp}</div>
   <br>
`        
    const email = document.createElement('li');
    email.dataset.id = emaildata.id;
    // sets mail lines to same style as nav buttons
    console.log(emaildata.read);
    if(emaildata.read == true ){
      email.className = "btn btn-secondary btn-block";
    }
    else 
    {
      email.className = "btn btn-outline-secondary btn-block";
    };
    email.innerHTML = contents;
    email.addEventListener('click', function(){ display_email(this.dataset.id);}, false);
  
    // Add post to DOM
    document.querySelector('#emails-list').append(email); 
  
}
//
// get the email data
//
function display_email(id) {

  // fetch an email by its id
  fetch('emails/'+id) 
       .then(response => response.json())
       .then( email => {
            // display email details
            render_email(email);
          });   
 
}

function render_email(email) {

  const contents =  `
  <div class="email-field">Sender: ${email.sender}</div>
  <div class="email-field">Subject: ${email.subject}</div> 
  <div class="email-field">Date: ${email.timestamp}</div>
  <button class="btn btn-outline-secondary" id="reply">Reply</button>
  <div class="email-body">${email.body}</div>`;

  // prefill recipent to reply email
  document.querySelector('#compose-recipients').value = email.sender;
  // pass the tags and data
  document.querySelector('#emails-list').innerHTML = contents;
  // add event listener to reply button
  document.querySelector('#reply').addEventListener('click', compose_email);
  // sets the read flag to true 
  fetch('emails/'+email.id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  
}

//post email
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#compose-form').onsubmit = function() {    
       fetch('http://127.0.0.1:8000/emails', {
           method: 'POST',
           body: JSON.stringify({
               recipients: document.querySelector('#compose-recipients').value,
               subject: document.querySelector('#compose-subject').value,
               body: document.querySelector('#compose-body').value
           })
       })
       .then(response => response.json())
       .then(result => {
               // print result
               console.log(result);
       });
 };
});