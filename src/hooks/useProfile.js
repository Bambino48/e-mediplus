import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getCurrentUser, updateProfileRequest } from "../api/auth";

export const useProfile = () => {
  const queryClient = useQueryClient();

  // Récupération du profil utilisateur
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");
      return await getCurrentUser(token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");
      return await updateProfileRequest(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil mis à jour avec succès !");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la sauvegarde du profil");
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
