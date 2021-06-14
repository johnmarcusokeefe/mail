document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archived'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('compose'));

  // By default, load the inbox
  load_mailbox('inbox');
});
//
// compose email page
//
function compose_email(typeofemail="compose") {

  set_button_highlight("compose");
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // jok
  document.querySelector('#emails-list').style.display = 'none';

  // Clear out composition fields
  // allows adding recipient in reply emails
  if(typeofemail == "compose") {
      document.querySelector(".compose-view h3").innerHTML = "New Email";
      document.querySelector('#compose-recipients').value = '';
      document.querySelector('#compose-subject').value = '';
      document.querySelector('#compose-body').value = '';
  }
}
//
//  load mail
//
// archived sent mail currently stay in sent, should also be moved back to inbox on reply
async function load_mailbox(mailbox) {

  set_button_highlight(mailbox);

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // jok
  document.querySelector('#emails-list').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = 
    `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

   //
   // read button on header line
   //
   if(mailbox == 'inbox'){
       const read_link = document.createElement('button');
       read_link.innerHTML = "Mark Unread";
       read_link.className = "col";
       read_link.id = "read-link";
       read_link.disabled = true;
       document.getElementById("emails-view").append(read_link);
       read_link.addEventListener("click", function(){ 
            load_mailbox(mailbox); 
       });
   }

  document.querySelector('#emails-list').innerHTML = "";
  //  email api
    await fetch('emails/'+mailbox) 
         .then(response => response.json())
         .then( emails => {
              emails.forEach(add_email);
            });   
  
}
//
// changes button background color for user feedback
//
function set_button_highlight(button_selected){
  // set highlight button
  buttons = document.querySelectorAll('button');
  for(i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
  }
  current_selection = document.getElementById(button_selected);
  current_selection.classList.add("active");
}

/////////////////////////////////////////////
//                                         //
//  create a single email line and append  //
//                                         // 
/////////////////////////////////////////////
function add_email(emaildata) {
  
  boxtype = document.querySelector('#emails-view h3').innerHTML;

  console.log("add email box type", boxtype, emaildata);
   
   email_line = document.createElement('div');

   if( emaildata.read == true && boxtype == 'Inbox'){
        email_line.className = "email-line light-gray";
       }
    else {
        email_line.className = "email-line";
    }
   //
   // sender
   //
   const sender = document.createElement('div');
   sender.className = "sender col";
   sender.innerHTML = emaildata.sender;
   //
   // subject
   //
   const subject = document.createElement('div');
   subject.className = "subject col";
   subject.innerHTML = emaildata.subject;
   //
   // timestamp
   //
   const timestamp = document.createElement('div');
   timestamp.className = "timestamp col";
   timestamp.innerHTML = emaildata.timestamp

   const clickzone = document.createElement('div');
   clickzone.className = "clickzone";

   // display email if left column clicked
   clickzone.addEventListener('click', function() {
        display_email(emaildata.id);
   });
  
   //
   // construct line with click zone used to seperate the read check box
   //
   clickzone.append(sender);
   clickzone.append(subject);
   clickzone.append(timestamp);
   email_line.append(clickzone);
   
   //
   // archive button - right column
   //
   
   //
   // adds read check box to inbox emails
   //
   if(boxtype == 'Inbox') {
      const read_check = document.createElement('input');
      read_check.setAttribute("type", "checkbox");
      read_check.className = "read-check";
      read_check.id = emaildata.id;
      read_check.addEventListener("change", function(){ 
          check_read_flag(emaildata); 
      });
      email_line.append(read_check);
      if(emaildata.read == false){
          read_check.setAttribute("disabled", "true");
      }
 }
 else {
     
     timestamp.className = "col timestamp-40";
 }
  //
  // append email list
  //
  document.querySelector('#emails-list').appendChild(email_line);

}
//
// change archive flag
// async fixes inbox update issue that needs reloading
//
async function check_read_flag(email) {
   // get the current read value
   flag = "";
   await fetch('emails/'+email.id) 
       .then(response => response.json())
       .then( email => {
            // display email details
            if(email.read == false){
                 flag = true;
            }
            else {
              flag = false;
            }
          });  
  await fetch('emails/'+email.id, {
    method: 'PUT',
    body: JSON.stringify({
      read: flag
      })
   })

   document.getElementById("read-link").disabled = false;
   //load_mailbox('inbox');

}
//
//
// set archive flag
// async fixes inbox load issues 
//
async function archive_email(id, flag) {

  console.log("update flags");
  await fetch('emails/'+id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: flag
      })
   })
 // goes back to inbox by default - archive from sent?
 load_mailbox('inbox');
}

//
// call the get single email
//
async function display_email(id) {
  console.log("display email");
  // fetch an email by its id
  await fetch('emails/'+id) 
       .then(response => response.json())
       .then( email => {
            // display email details
            console.log("email data", email)
            render_email(email);
          });   
}
//
// open a single email to view setting the read flag to true
//
function render_email(email) {
  
  if(document.querySelector('#read-link') != null) {
    document.querySelector('#read-link').style = "display:none";
  }
  
  //
  const email_body = document.createElement('div');
  email_body.className = "email-body";
  //
  const sender = document.createElement('div');
  sender.className = "sender-single";
  sender.innerHTML = "<strong>From: </strong>" + email.sender;
  //
  const recipient = document.createElement('div');
  recipient.className = "recipient-single";
  recipient.innerHTML = "<strong>To: </strong>" + email.recipients[0];
  //
  const subject = document.createElement('div');
  subject.className = "subject-single";
  subject.innerHTML = "<strong>Subject: </strong>"+email.subject;
  //
  const timestamp = document.createElement('div');
  timestamp.className = "timestamp-single";
  timestamp.innerHTML = "<strong>Timestamp: </strong>"+email.timestamp;
  //
  const emailbody = document.createElement('div');
  emailbody.className = "emailbody";
  // innerText is used to render textarea input so that line breaks display 
  emailbody.innerText = email.body;
  
  const archive_button = document.createElement('button');
  archive_button.className = "btn btn-sm btn-outline-primary archive-button";
  if(email.archived == false) {
    archive_button.innerHTML = "Archive";
    archive_button.addEventListener('click', function(){ archive_email(email.id, true); });
  }
  else {
    archive_button.innerHTML = "Un-archive";
    archive_button.addEventListener('click', function(){ archive_email(email.id, false); });
  }
  

  const reply_button = document.createElement('button');
  reply_button.className = "btn btn-sm btn-outline-primary reply-button";
  reply_button.innerHTML = "Reply";
  

  // event listener for reply which populates email fields
  reply_button.addEventListener('click', function() {
      document.querySelector("#compose-recipients").value = email.sender;
      document.querySelector(".compose-view h3").innerHTML = "Reply Email";
      reply_check = email.subject;
      if(reply_check.match(/Re:/)){
        document.querySelector("#compose-subject").value = email.subject;
      }
      else {
        document.querySelector("#compose-subject").value = "Re: "+email.subject;
      }
      
      // on email.timestamp email.sender wrote

      const br = "\n";
      const upper_line = "------------------------------------------------------"; 
      const reply_intro = "On: "+ email.timestamp +" "+ email.sender + " wrote:" + br + email.body + br;
      
      document.querySelector("#compose-body").value = br+br+upper_line+br+reply_intro;
      compose_email("reply");
  });

  const buttons = document.createElement('div');
  buttons.className = "button-group";
  // to remove unwanted behviours from sent and archived boxes
  if(boxtype != "Sent"){
    buttons.append(archive_button);
  }
  if(boxtype != "Archived"){
    buttons.append(reply_button);
  } 
  


  // put it together
  email_body.append(sender, recipient, subject, timestamp, buttons, emailbody);


  // pass the tags and data
  document.querySelector('#emails-view h3').innerHTML = "Email";
  document.querySelector('#emails-list').innerHTML ="";
  document.querySelector('#emails-list').append(email_body);
  // add event listener to reply button
  
  //
  // sets the read flag to true and changes background colour
  //
  console.log("fetch write read flag");
  fetch('emails/'+email.id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
}
//
// Event listener to send email
//
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