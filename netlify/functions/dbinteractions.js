const { createClient } = supabase;

const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const db = createClient(supabaseUrl, supabaseKey);

async function getData() {
   const { data, error } = await db.from("public_nicknames").select("*");

   if (error) {
      console.error("Ошибка:", error);
      return;
   }

   const publiclist = document.getElementById("publiclist");

   data.forEach((user) => {
      const usercontent = document.createElement("tr");

      usercontent.setAttribute("onclick", `selectUser('${user.chat_id}')`);

      const usnametd = document.createElement("td");
      usnametd.textContent = user.nickname;

      const usdesc = document.createElement("td");
      usdesc.textContent = user.description;

      usercontent.appendChild(usnametd);
      usercontent.appendChild(usdesc);

      publiclist.appendChild(usercontent);
   });
}

getData();

const regform = document.getElementById("signup-form");
const alertBox = document.getElementById("RegAlert");

regform.addEventListener("submit", (e) => {
   e.preventDefault();

   const nickname = document.getElementById("reg-nickname").value.trim();
   const chat_id = document.getElementById("reg-chatid").value.trim();
   const description = document.getElementById("reg-description").value.trim();
   const descEnabled = document.getElementById("actdescdiv").checked;

   const nameRegex = /^[A-Za-zА-Яа-яЁё0-9_]{3,25}$/;
   const chatIdRegex = /^-?\d{7,15}$/;

   alertBox.innerHTML = "";
   alertBox.className = "";

   if (!nameRegex.test(nickname)) {
      SignDelay("Nickname must contain 3-25 letters", "reg-nickname");
      return;
   }

   if (!chatIdRegex.test(chat_id)) {
      SignDelay("Invalid telegram Chat ID format", "reg-chatid");
      return;
   }

   if (descEnabled && description !== "") {
      if (!nameRegex.test(description)) {
         SignDelay("Description must contain 3-25 letters", "reg-description");
         return;
      }
   }
   SignDelay("Form validated successfully!", "ok");

   sendToDatabase(nickname, chat_id, description);
});

function SignDelay(message, state) {
   if (state == "ok") {
      $(alertBox).html('<div class="alert alert-success text-center" role="alert" id="regreponse" style="display:none;"></div>');
      $("#regreponse").text(message).fadeIn(500).delay(5000).fadeOut(500);
      const modalElement = document.getElementById("RegModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      setTimeout(function () {
         modal.hide();
      }, 6000);
   } else {
      $(alertBox).html('<div class="alert alert-danger text-center" role="alert" id="regreponse" style="display:none;"></div>');
      $("#regreponse").text(message).fadeIn(500).delay(5000).fadeOut(500);
      $("#" + state).css({
         border: "2px solid rgba(255, 0, 0, 0.329)",
         "box-shadow": "0px 0px 21px 3px #AB0000",
      });
      setTimeout(function () {
         $("#" + state).css({
            border: "",
            "box-shadow": "",
         });
      }, 5500);
   }
}

async function sendToDatabase(nickname, chat_id, description) {
   const supabase = createClient(supabaseUrl, supabaseKey);

   try {
      const { error } = await supabase.from("public_nicknames").insert([
         {
            nickname,
            chat_id,
            description: description || null,
         },
      ]);

      if (error) {
         $("#RegAlert").html('<div class="alert alert-danger text-center" role="alert" id="regreponse" style="display:none;"></div>');
         $("#regreponse").text("Conflict: an occuped nickname or Telegram ID").fadeIn(500).delay(5000).fadeOut(500);
         return {
            statusCode: 500,
            body: JSON.stringify(error),
         };
      }
      $(alertBox).html('<div class="alert alert-success text-center" role="alert" id="regreponse" style="display:none;"></div>');
      $("#regreponse").text("Sucessfully registered!").fadeIn(500).delay(5000).fadeOut(500);
      const modalElement = document.getElementById("RegModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      setTimeout(function () {
         modal.hide();
         window.location.reload();
      }, 6000);

      return {
         statusCode: 200,
         body: JSON.stringify({ success: true }),
      };
   } catch (err) {
      // $("#RegAlert").html('<div class="alert alert-danger text-center" role="alert" id="regreponse" style="display:none;"></div>');
      // $("#regreponse").text("Conflict: You are already registered or choosed an occuped nickname").fadeIn(500).delay(5000).fadeOut(500);
      return {
         statusCode: 500,
         body: JSON.stringify({ error: err.message }),
      };
   }
}
