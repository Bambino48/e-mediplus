import { useEffect, useRef, useState } from "react";


export default function ChatThread({ roomId, user }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const chanRef = useRef(null);


    useEffect(() => {
        const channel = new BroadcastChannel(`chat-${roomId}`);
        chanRef.current = channel;
        channel.onmessage = (e) => setMessages((m) => [...m, e.data]);
        return () => channel.close();
    }, [roomId]);


    const send = () => {
        if (!text.trim()) return;
        const msg = { id: crypto.randomUUID(), user: user?.name || "Moi", text, ts: Date.now() };
        chanRef.current.postMessage(msg);
        setMessages((m) => [...m, msg]);
        setText("");
    };

    return (
        <div className="card h-full flex flex-col">
            <div className="font-medium mb-2">Chat</div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messages.map((m) => (
                    <div key={m.id} className="text-sm">
                        <span className="font-medium">{m.user}:</span> {m.text}
                    </div>
                ))}
            </div>
            <div className="mt-2 flex gap-2">
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message…" />
                <button className="btn-primary" onClick={send}>Envoyer</button>
            </div>
        </div>
    );
}