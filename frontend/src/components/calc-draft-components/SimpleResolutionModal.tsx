"use client"
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, CreditCard, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ExceptionDetails {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  exception: string;
  bankStatus: 'valid' | 'missing';
  currentBankDetails: {
    bankName?: string;
    bankAccountNumber?: string;
    iban?: string;
    swiftCode?: string;
  };
  baseSalary: number;
  netPay: number;
  requiresBankDetails: boolean;
}

interface ResolutionModalProps {
  exception: any;
  runId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SimpleExceptionResolutionModal: React.FC<ResolutionModalProps> = ({
  exception,
  runId,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exceptionDetails, setExceptionDetails] = useState<ExceptionDetails | null>(null);
  
  // Form state
  const [resolutionNote, setResolutionNote] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');

  useEffect(() => {
    fetchExceptionDetails();
  }, []);

  const fetchExceptionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${exception.employeeId}/details`
      );
      
      if (!response.ok) throw new Error('Failed to fetch exception details');
      
      const data = await response.json();
      setExceptionDetails(data);
      
      // Pre-fill existing bank details if any
      setBankName(data.currentBankDetails?.bankName || '');
      setBankAccountNumber(data.currentBankDetails?.bankAccountNumber || '');
      setIban(data.currentBankDetails?.iban || '');
      setSwiftCode(data.currentBankDetails?.swiftCode || '');
      
    } catch (error) {
      console.error('Error fetching exception details:', error);
      alert('Failed to load exception details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution note');
      return;
    }

    // If bank status is missing, require bank account number
    if (exceptionDetails?.requiresBankDetails && !bankAccountNumber.trim()) {
      alert('Please provide at least a bank account number to resolve this exception');
      return;
    }

    try {
      setSubmitting(true);
      
      // Simple request body matching your backend
      const requestBody: any = {
        resolutionNote: resolutionNote.trim()
      };

      // Add bank details only if bank status is missing
      if (exceptionDetails?.requiresBankDetails) {
        if (bankName.trim()) requestBody.bankName = bankName.trim();
        if (bankAccountNumber.trim()) requestBody.bankAccountNumber = bankAccountNumber.trim();
        if (iban.trim()) requestBody.iban = iban.trim();
        if (swiftCode.trim()) requestBody.swiftCode = swiftCode.trim();
      }

      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${exception.employeeId}/resolve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resolve exception');
      }

      const result = await response.json();
      console.log('✅ Resolution result:', result);
      
      alert('Exception resolved successfully!');
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Error resolving exception:', error);
      alert(error.message || 'Failed to resolve exception');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading exception details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Resolve Exception</h3>
            <p className="text-sm text-slate-500 mt-1">
              {exceptionDetails?.employeeName}
              <span className="ml-2 font-mono text-xs">
                ({exceptionDetails?.employeeCode})
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exception Details */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  Bank Status: <span className="uppercase">{exceptionDetails?.bankStatus}</span>
                </p>
                <p className="text-sm text-slate-700">{exceptionDetails?.exception}</p>
              </div>
            </div>
          </div>

          {/* Bank Details Form - Show only if bankStatus is MISSING */}
          {exceptionDetails?.requiresBankDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-900">Bank Account Details Required</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., National Bank of Egypt"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Required"
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      SWIFT Code
                    </label>
                    <input
                      type="text"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Salary Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Base Salary</p>
                <p className="text-lg font-bold text-slate-900">
                  EGP {exceptionDetails?.baseSalary.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Net Pay</p>
                <p className={`text-lg font-bold ${
                  (exceptionDetails?.netPay || 0) < 0 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  EGP {exceptionDetails?.netPay.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Resolution Note */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Resolution Note <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Describe how this exception was resolved and any actions taken..."
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-2">
              This note will be recorded with the resolution.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Resolve Exception
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleExceptionResolutionModal;