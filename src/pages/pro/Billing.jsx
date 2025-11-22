import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { listPaymentsByDoctor } from "../../api/payments.js";
import ProLayout from "../../layouts/ProLayout.jsx";
import { usePaymentsStore } from "../../store/paymentsStore.js";

const doctorId = "1"; // à remplacer par celui connecté

export default function Billing() {
    const { data, isLoading } = useQuery({
        queryKey: ["payments", { doctorId }],
        queryFn: () => listPaymentsByDoctor(doctorId),
    });

    const setPayments = usePaymentsStore((s) => s.setPayments);
    const payments = usePaymentsStore((s) => s.payments);

    useEffect(() => {
        if (data?.items) setPayments(data.items);
    }, [data, setPayments]);

    return (
        <ProLayout title="Mes revenus">
            {isLoading ? (
                <div className="card grid place-items-center py-20">Chargement...</div>
            ) : !payments.length ? (
                <div className="card">Aucun paiement reçu pour le moment.</div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b">
                                <th className="py-2">Date</th>
                                <th>Patient</th>
                                <th>Montant</th>
                                <th>Fournisseur</th>
                                <th>Facture</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p.id} className="border-b last:border-none">
                                    <td className="py-2">
                                        {new Date(p.paid_at).toLocaleDateString()}
                                    </td>
                                    <td>{p.patient_id}</td>
                                    <td>{(p.amount_cents / 100).toLocaleString()} FCFA</td>
                                    <td>{p.provider}</td>
                                    <td>
                                        <a
                                            href={p.invoice.pdf_url}
                                            className="text-cyan-600 hover:underline"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </ProLayout>
    );
}
