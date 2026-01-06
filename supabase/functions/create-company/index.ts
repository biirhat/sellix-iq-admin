import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- 1. Initialize Admin Client ---
    const supabaseUrl = Deno.env.get("EXPO_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Server configuration error: Missing Supabase credentials.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- 2. Parse Form Data ---
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("file") as File | null;

    if (!name || !phone || !address) {
      throw new Error("Missing required fields: name, phone, and address.");
    }

    // --- 3. Create Company Record ---
    const { data: newCompany, error: createError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        is_active: isActive,
        image_url: "", // Placeholder
      })
      .select("id")
      .single();

    if (createError) throw createError;

    const companyId = newCompany.id;
    let uploadedUrl = "";

    // --- 4. Upload Image if Provided ---
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop() || "jpg";
      const fileName = `companies/${companyId}/logo.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("company-logos")
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseAdmin.storage
        .from("company-logos")
        .getPublicUrl(fileName);
      
      uploadedUrl = urlData.publicUrl;

      // --- 5. Update Company with Image URL ---
      const { error: updateError } = await supabaseAdmin
        .from("companies")
        .update({ image_url: uploadedUrl })
        .eq("id", companyId);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Company created successfully",
        company: {
          id: companyId,
          name,
          image_url: uploadedUrl,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-company function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
