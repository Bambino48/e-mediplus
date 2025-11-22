// Simple signalling basé sur BroadcastChannel (fonctionne entre onglets du même domaine)
// Remplacez plus tard par Socket.io / Pusher / Ably pour un vrai backend.

export class LocalSignaling {
    constructor(roomId) {
        this.roomId = roomId;
        this.channel = new BroadcastChannel(`teleconsult-${roomId}`);
        this.isClosed = false;
    }
    onMessage(cb) {
        this.channel.onmessage = (e) => cb(e.data);
    }
    send(msg) {
        // Vérifier que le channel n'est pas fermé avant d'envoyer
        if (!this.isClosed && this.channel) {
            try {
                this.channel.postMessage(msg);
            } catch (error) {
                console.warn("Erreur lors de l'envoi de message:", error.message);
                this.isClosed = true;
            }
        } else {
            console.warn("Tentative d'envoi de message sur un canal fermé");
        }
    }
    close() {
        if (!this.isClosed && this.channel) {
            this.channel.close();
            this.isClosed = true;
        }
    }
}
