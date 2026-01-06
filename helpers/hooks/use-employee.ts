import { useAuth } from "@/contexts/AuthProvidere";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Note: This hook is for 'company_admin' to manage their own employees.
// It automatically scopes queries to the logged-in user's company_id.

// 1. Fetch Employees for the current admin's company
export function useEmployees() {
  const { user: adminUser } = useAuth();
  const companyId = adminUser?.profile?.company_id;

  return useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!companyId) return []; // Don't fetch if admin has no company

      const { data, error } = await supabase
        .from("users")
        .select("*")
        // Only get users from the same company
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId, // Only run query if companyId is available
  });
}

// 2. Fetch a single employee
export function useEmployee(id: string) {
  const { user: adminUser } = useAuth();
  const companyId = adminUser?.profile?.company_id;

  return useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .eq("company_id", companyId) // Ensure employee belongs to the admin's company
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!companyId,
  });
}

// 3. Delete an employee
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch user to get avatar_url and verify company_id
      const { data: employee, error: fetchError } = await supabase
        .from("users")
        .select("avatar_url, company_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Security check: ensure the employee belongs to the admin's company
      if (employee.company_id !== adminUser?.profile?.company_id) {
        throw new Error("Permission denied: You can only delete employees from your own company.");
      }

      // Delete from DB
      const { error: deleteError } = await supabase.from("users").delete().eq("id", id);
      if (deleteError) throw deleteError;

      // Clean up avatar from storage
      const avatarUrl = employee?.avatar_url;
      if (avatarUrl && avatarUrl.includes("/avatars/")) {
        try {
          const imagePath = avatarUrl.split("/avatars/")[1];
          if (imagePath) {
            await supabase.storage.from("avatars").remove([imagePath]);
          }
        } catch (e) {
          console.warn("Could not remove employee avatar from storage:", e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", adminUser?.profile?.company_id] });
    },
  });
}

// 4. Update an employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & any) => {
      // Fetch existing employee to get avatar and verify company
      const { data: existingEmployee, error: fetchError } = await supabase
        .from("users")
        .select("avatar_url, company_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Security check
      if (existingEmployee.company_id !== adminUser?.profile?.company_id) {
        throw new Error("Permission denied: You can only edit employees from your own company.");
      }
      
      // Prevent role escalation
      if (updates.role && (updates.role === 'super_admin' || updates.role === 'company_admin')) {
          throw new Error("Permission denied: Cannot assign admin roles.");
      }

      // Handle avatar upload logic (same as useUpdateUser)
      const hasAvatarField = Object.prototype.hasOwnProperty.call(updates, "avatar_url");
      let newAvatarUrl = updates.avatar_url;

      if (hasAvatarField && typeof newAvatarUrl === "string" && newAvatarUrl.startsWith("file://")) {
        const uri = newAvatarUrl;
        const fileExt = uri.split(".").pop() || "jpg";
        const fileName = `${id}/avatar.${fileExt}`;
        const fileType = `image/${fileExt}`;

        const formData = new FormData();
        formData.append("file", { uri, name: fileName, type: fileType } as any);

        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, formData, { contentType: fileType, upsert: true });
        if (uploadError) throw uploadError;

        newAvatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;
      }
      
      const updateData: any = { ...updates };
      if (hasAvatarField) {
        updateData.avatar_url = newAvatarUrl;
      }
      delete updateData.id;

      // Perform update
      const { data, error } = await supabase.from("users").update(updateData).eq("id", id).select().single();
      if (error) throw error;

      // Cleanup old avatar if changed
      const prevAvatarUrl = existingEmployee.avatar_url;
      if (hasAvatarField && prevAvatarUrl && prevAvatarUrl !== newAvatarUrl) {
        try {
          const prevPath = prevAvatarUrl.split("/avatars/")[1];
          if (prevPath) {
            await supabase.storage.from("avatars").remove([prevPath]);
          }
        } catch (e) {
          console.warn("Error removing previous avatar:", e);
        }
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate both the list and the single employee queries
      queryClient.invalidateQueries({ queryKey: ["employees", adminUser?.profile?.company_id] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["employee", data.id] });
      }
    },
  });
}
