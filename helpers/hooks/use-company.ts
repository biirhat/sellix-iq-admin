import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getCompanies = async () => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  // console.log("Fetched companies:", data);
  return data;
};

export const useCompanies = () => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  return { data, isLoading, error, refetch, isRefetching };
};

// deleting company by id and its img from bucket
export const deleteCompany = async ({ id, imageUrl }: { id: string; imageUrl: string | null }) => {
  // First, delete the database record
  const { error: dbError } = await supabase.from("companies").delete().eq("id", id);
  if (dbError) throw dbError;

  // NOTE: We intentionally do NOT delete the company image from storage when a company
  // is deleted. Keeping images preserves historical assets and prevents accidental data
  // loss. If you want to remove images manually, use a separate cleanup tool or pass
  // explicit intent in a future API to delete stored images.
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      // Invalidate and refetch the companies query to update the list
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

// Update company details, including handling company logo uploads and cleanup
export const updateCompany = async ({ id, ...updates }: { id: string } & any) => {
  // Fetch the current company image so we can remove it if needed
  const { data: existingCompany } = await supabase.from("companies").select("image_url").eq("id", id).single();
  const prevImageUrl: string | null = existingCompany?.image_url ?? null;

  const hasImageField = Object.prototype.hasOwnProperty.call(updates, "image_url");
  let newImageUrl = updates.image_url;

  // If a local file URI is provided, upload it to the company-logos bucket
  if (hasImageField && typeof newImageUrl === "string" && newImageUrl.startsWith("file://")) {
    const uri = newImageUrl;
    const fileExt = uri.split(".").pop() || "jpg";
    const fileName = `${id}/logo.${fileExt}`;
    const fileType = `image/${fileExt}`;

    const formData = new FormData();
    formData.append("file", { uri, name: fileName, type: fileType } as any);

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(fileName, formData, { contentType: fileType, upsert: true });

    if (uploadError) throw uploadError;

    newImageUrl = supabase.storage.from("company-logos").getPublicUrl(fileName).data.publicUrl;
  }

  const updateData: any = { ...updates };
  if (hasImageField) {
    // For companies we use an empty string to represent "no image" because of DB constraints
    updateData.image_url = newImageUrl ?? "";
  }

  // Remove id from update payload
  delete updateData.id;

  const { data, error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // If the image was updated or removed, clean up the previous image from storage
  if (hasImageField && prevImageUrl && prevImageUrl.includes("/company-logos/")) {
    const isImageRemoved = updateData.image_url === "";
    const isImageReplaced = updateData.image_url !== prevImageUrl;

    if (isImageRemoved || isImageReplaced) {
      try {
        const prevPath = prevImageUrl.split("/company-logos/")[1];
        if (prevPath) {
          const { error: storageError } = await supabase.storage.from("company-logos").remove([prevPath]);
          if (storageError) {
            console.warn("Could not remove previous company image from storage:", storageError.message);
          }
        }
      } catch (e) {
        console.warn("Error removing previous company image from storage:", e);
      }
    }
  }

  return data;
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompany,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      if (data) queryClient.invalidateQueries({ queryKey: ["company", data.id] });
    },
  });
};
