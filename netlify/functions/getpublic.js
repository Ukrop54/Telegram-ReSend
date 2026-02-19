import { createClient } from "@supabase/supabase-js";

export async function handler() {
   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

   const { data, error } = await supabase.from("public_nicknames").select("*");

   if (error) {
      return {
         statusCode: 500,
         body: JSON.stringify(error),
      };
   }

   return {
      statusCode: 200,
      body: JSON.stringify(data),
   };
}
