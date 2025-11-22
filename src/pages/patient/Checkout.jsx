import PaymentButton from "../../components/PaymentButton.jsx";

export default function Checkout() {
    const appointmentId = "apt-123";
    const patientId = "42";
    const doctorId = "1";
    const amount = 15000;

    return (
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            <div className="card">
                <h1 className="text-xl font-semibold mb-2">Paiement de votre consultation</h1>
                <p className="text-slate-600 mb-4">
                    Merci de procéder au paiement pour confirmer votre rendez-vous.
                </p>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Consultation Dr. Marie Kouassi</div>
                        <div className="text-sm text-slate-500">Cardiologie</div>
                    </div>
                    <div className="text-lg font-semibold">{amount.toLocaleString()} FCFA</div>
                </div>
            </div>

            <PaymentButton
                appointmentId={appointmentId}
                patientId={patientId}
                doctorId={doctorId}
                amount={amount}
            />
        </main>
    );
}
