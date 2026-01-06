import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 1. وەرگرتنا هەمی یوزەران (Fetch All Users)
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
export function useUsersAdmin() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "company_admin")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// 2. وەرگرتنا یوزەرەکێ ب تنێ (Fetch Single User)
export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id, // تەنێ دەما ID هەبیت دێ کار کەت
  });
}

// 3. سڕینەڤەیا یوزەری (Delete User)
// تێبینی: سڕینەڤە د سستەمێ Auth دا پێدڤی ب Admin API هەیە
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, fetch the user's avatar (so we can remove it from storage)
      const { data: user, error: fetchError } = await supabase.from("users").select("avatar_url").eq("id", id).single();
      if (fetchError) {
        console.warn(`Could not fetch user ${id} before deletion, avatar might not be removed from storage.`, fetchError.message);
      }

      // Delete the database record
      const { error: deleteError } = await supabase.from("users").delete().eq("id", id);
      if (deleteError) throw deleteError;

      // If the user had an avatar stored in our 'avatars' bucket, remove it
      const avatarUrl = user?.avatar_url;
      if (avatarUrl && avatarUrl.includes("/avatars/")) {
        try {
          const imagePath = avatarUrl.split("/avatars/")[1];
          if (imagePath) {
            const { error: storageError } = await supabase.storage
              .from("avatars")
              .remove([imagePath]);
            if (storageError) {
              console.warn("Could not delete avatar from storage:", storageError.message);
            }
          }
        } catch (e) {
          console.error("Error parsing avatar URL for deletion:", e);
        }
      }
    },
    onSuccess: () => {
      // پشتی سڕینەڤە، لیستا یوزەران نوو بکەڤە
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// 4. نووکرنا زانیاریێن یوزەری (Update User)
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & any) => {
      // Fetch the current avatar so we can remove it if needed
      const { data: existingUser } = await supabase.from("users").select("avatar_url").eq("id", id).single();
      const prevAvatarUrl: string | null = existingUser?.avatar_url ?? null;

      const hasAvatarField = Object.prototype.hasOwnProperty.call(updates, "avatar_url");
      let newAvatarUrl = updates.avatar_url;

      // If a local file is provided, upload it and get the new public URL
      if (hasAvatarField && typeof newAvatarUrl === "string" && newAvatarUrl.startsWith("file://")) {
        const uri = newAvatarUrl;
        const fileExt = uri.split(".").pop() || "jpg";
        const fileName = `${id}/avatar.${fileExt}`;
        const fileType = `image/${fileExt}`;

        const formData = new FormData();
        formData.append("file", { uri, name: fileName, type: fileType } as any);

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, formData, { contentType: fileType, upsert: true });

        if (uploadError) throw uploadError;

        newAvatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;
      }

      const updateData: any = { ...updates };
      if (hasAvatarField) {
        updateData.avatar_url = newAvatarUrl;
      }

      // Remove id from the update payload
      delete updateData.id;

      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // If the avatar was updated or removed, clean up the previous avatar from storage
      if (hasAvatarField && prevAvatarUrl && prevAvatarUrl.includes("/avatars/")) {
        const isAvatarRemoved = newAvatarUrl === null;
        const isAvatarReplaced = newAvatarUrl !== prevAvatarUrl;

        if (isAvatarRemoved || isAvatarReplaced) {
          try {
            const prevPath = prevAvatarUrl.split("/avatars/")[1];
            if (prevPath) {
              const { error: storageError } = await supabase.storage.from("avatars").remove([prevPath]);
              if (storageError) {
                console.warn("Could not remove previous avatar from storage:", storageError.message);
              }
            }
          } catch (e) {
            console.warn("Error removing previous avatar from storage:", e);
          }
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["user", data.id] });
      }
    },
  });
}