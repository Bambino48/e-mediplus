import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer";
import { LocalSignaling } from "../lib/signaling.js";
import { useCallStore } from "../store/callStore.js";
export default function VideoRoom({ roomId }) {
    const navigate = useNavigate();
    const {
        setRoom,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
        micOn,
        camOn,
        toggleMic,
        toggleCam,
        reset,
    } = useCallStore();
    const [isInitiator, setInitiator] = useState(false);
    const peerRef = useRef(null);
    const sigRef = useRef(null);

    const handleHangUp = () => {
        // Nettoyer la connexion
        cleanup();
        // Rediriger vers la page précédente ou le dashboard
        navigate(-1); // Retour à la page précédente
    };

    const cleanup = () => {
        try {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        } catch (error) {
            console.warn("Erreur lors de la destruction du peer:", error);
        }

        try {
            if (sigRef.current && !sigRef.current.isClosed) {
                sigRef.current.close();
                sigRef.current = null;
            }
        } catch (error) {
            console.warn("Erreur lors de la fermeture du signaling:", error);
        }

        try {
            if (localStream) {
                localStream.getTracks().forEach((t) => t.stop());
            }
        } catch (error) {
            console.warn("Erreur lors de l'arrêt des tracks:", error);
        }

        reset();
    };

    useEffect(() => {
        setRoom(roomId);
        const signaling = new LocalSignaling(roomId);
        sigRef.current = signaling;
        signaling.onMessage(async (msg) => {
            if (msg.type === "signal" && peerRef.current) {
                peerRef.current.signal(msg.data);
            }
        });
        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);

            // Heuristique simple : le premier onglet qui ouvre la room se dit "initiator"
            const firstPing = Math.random().toString(36).slice(2);
            if (signaling && !signaling.isClosed) {
                signaling.send({ type: "ping", id: firstPing, t: Date.now() });
            }
            setTimeout(() => setInitiator(true), 300);

            const peer = new SimplePeer({
                initiator: isInitiator,
                trickle: true,
                stream,
            });
            peerRef.current = peer;

            peer.on("signal", (data) => {
                if (sigRef.current && !sigRef.current.isClosed) {
                    sigRef.current.send({ type: "signal", data });
                }
            });
            peer.on("stream", (remote) => setRemoteStream(remote));
            peer.on("error", (err) => console.error("peer error", err));
            peer.on("close", () => cleanup());
        })();

        return () => cleanup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach((t) => (t.enabled = micOn));
            localStream.getVideoTracks().forEach((t) => (t.enabled = camOn));
        }
    }, [localStream, micOn, camOn]);

    return (
        <div className="grid md:grid-cols-2 gap-3">
            <VideoPane title="Vous" stream={localStream} muted />
            <VideoPane title="Interlocuteur" stream={remoteStream} />

            <div className="md:col-span-2 flex items-center justify-center gap-3 mt-2">
                <button className="btn-secondary" onClick={toggleMic}>
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}{" "}
                    Micro
                </button>
                <button className="btn-secondary" onClick={toggleCam}>
                    {camOn ? (
                        <Video className="h-5 w-5" />
                    ) : (
                        <VideoOff className="h-5 w-5" />
                    )}{" "}
                    Caméra
                </button>
                <button className="btn-primary" onClick={handleHangUp}>
                    <PhoneOff className="h-5 w-5" /> Raccrocher
                </button>
            </div>
        </div>
    );
}

function VideoPane({ title, stream, muted }) {
    const ref = useRef();
    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);
    return (
        <div className="card">
            <div className="text-sm text-slate-500 mb-1">{title}</div>
            <video
                ref={ref}
                autoPlay
                playsInline
                muted={muted}
                className="w-full rounded-xl bg-black aspect-video"
            />
        </div>
    );
}
