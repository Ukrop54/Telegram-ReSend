$("#toggleCheckbox").on("click", function () {
   $("#advanced").slideToggle("slow", function () {});
});

$("#toggleMembers").on("click", function () {
   $("#members-panel").slideToggle("slow", function () {});
});

$("#showpb").on("click", function () {
   $("#pbtable").slideToggle("slow", function () {});
   $("#showpb").toggleClass("bi-chevron-up bi-chevron-down");
});

$("#showpv").on("click", function () {
   $("#pvtable").slideToggle("slow", function () {});
   $("#showpv").toggleClass("bi-chevron-up bi-chevron-down");
});

$(".custom_icircle").hover(function () {
   $(this).toggleClass("bi-info-circle bi-info-circle-fill");
});

$("#actdescdiv").on("click", function () {
   $("#descdiv").slideToggle("slow", function () {});
});

function selectUser(id) {
   document.getElementById("recipient-select").value = id;
   document.getElementById("toggleMembers").checked = false;
   $("#members-panel").slideToggle("slow", function () {});
}

function setState(state) {
   $("body").removeClass("success error");

   if (state) {
      $("body").addClass(state);
   }
}

document.getElementById("messageForm").addEventListener("submit", async function (event) {
   event.preventDefault();

   const senderName = document.getElementById("sender-name").value;
   const NRmessage = document.getElementById("message").value;

   // const recipient = document.getElementById("recipient-select").value;
   recinput = document.getElementById("recipient-select");
   const recipient = "";

   if (!recinput) {
      document.getElementById("response").innerHTML = '<div class="alert alert-danger">Please select a recipient.</div>';
      return;
   } else {
      const value = recinput.value.trim();

      if (/^\d{10}$/.test(value)) {
         recipient == value;
      } else if (/^[a-zA-Z0-9а-яА-Я]{3,25}$/.test(value)) {
         console.log("db");
      } else {
         document.getElementById("response").innerHTML = '<div class="alert alert-danger">Invalid nickname or chat ID</div>';
         return;
      }
   }

   const fileInput = document.getElementById("file");

   const formData = new FormData();
   formData.append("chat_id", recipient);
   formData.append("caption", senderName ? `From: ${senderName}\n${NRmessage}` : NRmessage);

   if (fileInput.files.length > 0) {
      formData.append("document", fileInput.files[0]);
   }

   const endpoint = fileInput.files.length > 0 ? "sendDocument" : "sendMessage";

   try {
      const response = await fetch("/.netlify/functions/sendmessage", {
         method: "POST",
         body: JSON.stringify({
            chat_id: recipient,
            text: senderName ? `From: ${senderName}\n${NRmessage}` : NRmessage,
         }),
         headers: {
            "Content-Type": "application/json",
         },
      });

      const data = await response.json();

      if (data.ok) {
         $("#message").animate({ opacity: 0 }, 300, function () {
            $(this).val("");
            $(this).animate({ opacity: 1 }, 300);
         });
         document.getElementById("file").value = "";

         $(document).ready(function () {
            $("#response").html('<div class="alert alert-success bg-transparent" role="alert" id="anResponse" style="display:none;"></div>');

            $("#anResponse").text("Message sent successfully!").fadeIn(500).delay(5000).fadeOut(500);
         });
         setState("success");

         setTimeout(function () {
            setState("");
         }, 5000);
      } else {
         $(document).ready(function () {
            $("#response").html('<div class="alert alert-danger bg-transparent" role="alert" id="anResponse" style="display:none;"></div>');

            $("#anResponse").text(`Error: ${data.description}`).fadeIn(500).delay(5000).fadeOut(500);
         });
         setState("error");

         setTimeout(function () {
            setState("");
         }, 5000);
      }
   } catch (error) {
      $(document).ready(function () {
         $("#response").html('<div class="alert alert-danger bg-transparent" role="alert" id="anResponse" style="display:none;"></div>');

         $("#anResponse").text("Failed to send the message. Please try again later.").fadeIn(500).delay(5000).fadeOut(500);
      });

      setState("error");

      setTimeout(function () {
         setState("");
      }, 5000);
   }
});

async function loadPublicMembers() {
   const response = await fetch("/.netlify/functions/getPublic");
   const data = await response.json();

   const tbody = document.querySelector("#pbtable tbody");
   tbody.innerHTML = "";

   data.forEach((user) => {
      const row = document.createElement("tr");
      row.onclick = () => selectUser(user.chat_id);

      row.innerHTML = `
      <td>${user.nickname}</td>
      <td>${user.description || "-"}</td>
    `;

      tbody.appendChild(row);
   });
}

document.querySelector(".signup-form").addEventListener("submit", async function (e) {
   e.preventDefault();

   const nickname = document.getElementById("reg-nickname").value.trim();
   const chatId = document.getElementById("reg-chatid").value.trim();
   const description = document.getElementById("reg-description").value.trim();
   const isPublic = document.getElementById("reg-public").checked;

   const response = await fetch("/.netlify/functions/signup", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         nickname,
         chatId,
         description,
         isPublic,
      }),
   });

   const result = await response.json();

   if (result.success) {
      alert("Shortcut created!");

      // автоматически вставляем chat_id в поле получателя
      document.getElementById("recipient-select").value = chatId;

      // закрываем модалку
      const modal = bootstrap.Modal.getInstance(document.getElementById("RegModal"));
      modal.hide();
   } else {
      alert("Error: " + (result.error?.message || "Something went wrong"));
      console.error(result);
   }
});

document.addEventListener("DOMContentLoaded", function () {
   loadPublicMembers();
});
