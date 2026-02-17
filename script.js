$("#toggleCheckbox").on("click", function () {
   $("#advanced").slideToggle("slow", function () {});
});

function setState(state) {
   $("body").removeClass("success error");

   if (state) {
      $("body").addClass(state);
   }
}

document
   .getElementById("messageForm")
   .addEventListener("submit", async function (event) {
      event.preventDefault();

      const senderName = document.getElementById("sender-name").value;
      const NRmessage = document.getElementById("message").value;
      const recipient = document.getElementById("recipient-select").value;
      const fileInput = document.getElementById("file");

      if (!recipient) {
         document.getElementById("response").innerHTML =
            '<div class="alert alert-danger">Please select a recipient.</div>';
         return;
      }

      const formData = new FormData();
      formData.append("chat_id", recipient);
      formData.append(
         "caption",
         senderName ? `From: ${senderName}\n${NRmessage}` : NRmessage
      );

      if (fileInput.files.length > 0) {
         formData.append("document", fileInput.files[0]);
      }

      const endpoint =
         fileInput.files.length > 0 ? "sendDocument" : "sendMessage";

      try {
         const response = await fetch("netlify/functions/sendmessage", {
            method: "POST",
            body: JSON.stringify({
               chat_id: recipient,
               text: senderName
                  ? `From: ${senderName}\n${NRmessage}`
                  : NRmessage,
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
               $("#response").html(
                  '<div class="alert alert-success bg-transparent" role="alert" id="anResponse" style="display:none;"></div>'
               );

               $("#anResponse")
                  .text("Message sent successfully!")
                  .fadeIn(500)
                  .delay(5000)
                  .fadeOut(500);
            });
            setState("success");

            setTimeout(function () {
               setState("");
            }, 5000);
         } else {
            $(document).ready(function () {
               $("#response").html(
                  '<div class="alert alert-danger bg-transparent" role="alert" id="anResponse" style="display:none;"></div>'
               );

               $("#anResponse")
                  .text(`Error: ${data.description}`)
                  .fadeIn(500)
                  .delay(5000)
                  .fadeOut(500);
            });
            setState("error");

            setTimeout(function () {
               setState("");
            }, 5000);
         }
      } catch (error) {
         $(document).ready(function () {
            $("#response").html(
               '<div class="alert alert-danger bg-transparent" role="alert" id="anResponse" style="display:none;"></div>'
            );

            $("#anResponse")
               .text("Failed to send the message. Please try again later.")
               .fadeIn(500)
               .delay(5000)
               .fadeOut(500);
         });

         setState("error");

         setTimeout(function () {
            setState("");
         }, 5000);
      }
   });
