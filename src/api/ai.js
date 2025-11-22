/* eslint-disable no-unused-vars */
// src/api/ai.js
export async function triageSymptoms(symptomsText) {
    const lower = symptomsText.toLowerCase();
    if (lower.includes("fièvre") || lower.includes("toux")) {
        return {
            triage: "Risque infection respiratoire",
            recommendation: "Consulter un généraliste ou un pneumologue",
            urgency: "modérée",
        };
    }
    if (lower.includes("douleur") && lower.includes("poitrine")) {
        return {
            triage: "Symptômes cardiaques possibles",
            recommendation: "Urgence : contacter un cardiologue immédiatement",
            urgency: "haute",
        };
    }
    return {
        triage: "Aucune alerte grave détectée",
        recommendation: "Surveiller les symptômes ou prendre RDV avec un généraliste",
        urgency: "basse",
    };
}

export async function getRecommendations(type = "doctor", location = "Abidjan") {
    if (type === "doctor") {
        return {
            items: [
                { id: 1, name: "Dr. Marie Kouassi", specialty: "Généraliste", distance_km: 1.2, rating: 4.8 },
                { id: 2, name: "Dr. Jean-Marc Bamba", specialty: "Cardiologue", distance_km: 2.5, rating: 4.9 },
            ],
        };
    }
    if (type === "pharmacy") {
        return {
            items: [
                { id: 10, name: "Pharmacie du Soleil", address: "Abidjan Plateau", open: true },
                { id: 11, name: "Pharmacie de la Paix", address: "Yopougon", open: false },
            ],
        };
    }
    return { items: [] };
}
