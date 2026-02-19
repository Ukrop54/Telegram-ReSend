import { createClient } from "@supabase/supabase-js";

export async function handler(event) {
   if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
   }

   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

   try {
      const { nickname, chatId, description, isPublic } = JSON.parse(event.body);

      if (!nickname || !chatId) {
         return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing fields" }),
         };
      }

      const table = isPublic ? "public_nicknames" : "private_nicknames";

      const { error } = await supabase.from(table).insert([
         {
            nickname,
            chat_id: chatId,
            description: description || null,
         },
      ]);

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
   } catch (err) {
      return {
         statusCode: 500,
         body: JSON.stringify({ error: err.message }),
      };
   }
}
