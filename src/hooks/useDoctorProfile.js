import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getDoctorProfile, updateDoctorProfile } from "../api/doctors";

export const useDoctorProfile = () => {
  const queryClient = useQueryClient();

  // Récupération du profil professionnel du docteur
  const profileQuery = useQuery({
    queryKey: ["doctorProfile"],
    queryFn: async () => {
      return await getDoctorProfile();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Mutation pour mettre à jour le profil professionnel
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      return await updateDoctorProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorProfile"] });
      toast.success("Profil professionnel mis à jour avec succès !");
    },
    onError: (error) => {
      console.error(
        "Erreur lors de la mise à jour du profil professionnel:",
        error
      );
      toast.error("Erreur lors de la sauvegarde du profil professionnel");
    },
  });

  return {
    doctorProfile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateDoctorProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
