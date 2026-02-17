import { createClient } from "@supabase/supabase-js";

export async function handler(event) {
   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

   const { nickname, chatId } = JSON.parse(event.body);

   const { data, error } = await supabase.from("nicknames").insert([{ nickname, chat_id: chatId }]);

   if (error) {
      return {
         statusCode: 500,
         body: JSON.stringify(error),
      };
   }

   return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
   };
}
