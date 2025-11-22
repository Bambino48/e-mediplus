// src/api/payments.js
const DB = {
    payments: [],
};

export async function checkoutPayment(payload) {
    // payload: { provider, appointment_id, amount_cents, patient_id, doctor_id }
    if (!payload?.provider || !payload?.appointment_id) {
        throw new Error("Données de paiement incomplètes");
    }
    const id = crypto.randomUUID();
    const pdf_url = `https://example.com/invoice/${id}.pdf`;
    const payment = {
        id,
        ...payload,
        status: "paid",
        paid_at: new Date().toISOString(),
        invoice: {
            id,
            pdf_url,
            tax_rate: 0.18,
            commission_rate: 0.1,
        },
    };
    DB.payments.unshift(payment);
    return { payment };
}

export async function listPaymentsByDoctor(doctor_id) {
    const items = DB.payments.filter((p) => p.doctor_id === doctor_id);
    return { items };
}

export async function listPaymentsByPatient(patient_id) {
    const items = DB.payments.filter((p) => p.patient_id === patient_id);
    return { items };
}
