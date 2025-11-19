import axios from 'axios';

const API_BASE =
    process.env.REACT_APP_API_BASE ||
    "https://hospital-backend-app-d5hzfjfqfbakbdcu.southeastasia-01.azurewebsites.net";

const BILLING_URL = `${API_BASE}/api/billing`;
const PAYMENTS_URL = `${API_BASE}/api/payments`;
const REPORTS_URL = `${API_BASE}/api/reports`;

// Billing Service
export const generateBill = async (appointmentId, labCharges, medicineCharges, discountPercent, notes) => {
    try {
        const response = await axios.post(`${BILLING_URL}/generate`, {
            appointmentId,
            labCharges: parseFloat(labCharges) || 0,
            medicineCharges: parseFloat(medicineCharges) || 0,
            discountPercent: parseFloat(discountPercent) || 0,
            notes: notes || ''
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to generate bill' };
    }
};

export const getBillById = async (billId) => {
    try {
        const response = await axios.get(`${BILLING_URL}/${billId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch bill' };
    }
};

export const getPatientBills = async (patientId) => {
    try {
        const response = await axios.get(`${BILLING_URL}/patient/${patientId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch bills' };
    }
};

export const getAllBills = async (status = '', from = '', to = '') => {
    try {
        const response = await axios.get(`${BILLING_URL}/all`, {
            params: { status, from, to }
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch bills' };
    }
};

export const updateBillingConfig = async (taxPercentage, consultationFeeBase) => {
    try {
        const response = await axios.post(`${BILLING_URL}/config`, {
            taxPercentage,
            consultationFeeBase
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update config' };
    }
};

// Payment Service
export const recordPayment = async (billId, amountPaid, paymentMode, transactionReference) => {
    try {
        const response = await axios.post(`${PAYMENTS_URL}/record`, {
            billId,
            amountPaid: parseFloat(amountPaid),
            paymentMode,
            transactionReference: transactionReference || ''
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to record payment' };
    }
};

export const getPaymentHistory = async (patientId) => {
    try {
        const response = await axios.get(`${PAYMENTS_URL}/history/${patientId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch payment history' };
    }
};

export const getAllPayments = async () => {
    try {
        const response = await axios.get(`${PAYMENTS_URL}/all`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch payments' };
    }
};

// Report Service
export const getFinancialReport = async (startDate = '', endDate = '') => {
    try {
        const response = await axios.get(`${REPORTS_URL}/financial`, {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch report' };
    }
};
