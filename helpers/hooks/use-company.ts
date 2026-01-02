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

  // If there's an image URL, parse the path and delete the image from storage
  if (imageUrl) {
    try {
      const imagePath = imageUrl.split('/company-logos/')[1];
      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from("company-logos")
          .remove([imagePath]);
        // We don't throw here, as we want to proceed even if image deletion fails
        if (storageError) {
          console.warn("Could not delete image from storage:", storageError.message);
        }
      }
    } catch (e) {
      console.error("Error parsing image path for deletion:", e);
    }
  }
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
