<script>
const PASSWORD = "Wealthy@62";
const BASE = "https://hdigitalpro7.github.io/videomeeting/WEB_UIKITS.html";

function makeId(len=8){ return Math.random().toString(36).substring(2,2+len); }

const generateBtn = document.getElementById('generateBtn');
const popup = document.getElementById('popup');
const rebookBtn = document.getElementById('rebookBtn');

function generateLink() {
  const pass = document.getElementById('password').value;
  const duration = document.getElementById('duration').value;
  if(pass !== PASSWORD){ alert("❌ Incorrect password"); return; }

  const meetingId = makeId();
  const link = `${BASE}?meetingId=${meetingId}&duration=${duration}`;

  // Save to localStorage: only 1 active meeting
  localStorage.setItem("activeMeeting", JSON.stringify({id:meetingId, duration:duration, joined:false}));

  const linkA = document.getElementById('meetingLink');
  linkA.href = link;
  linkA.textContent = link;
  document.getElementById('linkDiv').style.display = 'block';
}

// Check if user already has an active meeting
generateBtn.addEventListener('click', () => {
  const active = JSON.parse(localStorage.getItem("activeMeeting"));
  if(active && !active.joined){
    // Show rebook popup
    popup.style.display = 'flex';
  } else {
    generateLink();
  }
});

// Rebook button click
rebookBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  generateLink();
});

// Meeting page logic
if(window.location.pathname.endsWith("WEB_UIKITS.html")){
  const params = new URLSearchParams(window.location.search);
  const meetingId = params.get("meetingId");

  const active = JSON.parse(localStorage.getItem("activeMeeting"));
  if(!active || active.id !== meetingId){
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:50px;color:red;'>❌ This link has expired. Please rebook your session.</h2>";
  } else if(active.joined){
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:50px;color:red;'>❌ This link has already been used. Please rebook your session.</h2>";
  } else {
    active.joined = true;
    localStorage.setItem("activeMeeting", JSON.stringify(active));
    document.body.innerHTML = `<h2 style='text-align:center;margin-top:50px;color:green;'>✅ Welcome to your session! Duration: ${active.duration} minutes.</h2>`;
  }
}
</script>