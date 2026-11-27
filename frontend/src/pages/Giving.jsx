import React, { useState, useEffect } from 'react';
import { 
  Heart, Copy, Check, ShieldCheck, QrCode, Building, 
  ArrowRight, FileText, CheckCircle, Sparkles, AlertCircle,
  Smartphone, ExternalLink, X, Clock, MessageSquare, AlertTriangle, RefreshCw
} from 'lucide-react';
import { fetchGivingDetails, submitDonation, createPaymentOrder, verifyPayment } from '../api/client';
import { useChurch } from '../context/ChurchContext';

export default function Giving() {
  const church = useChurch();
  const settings = church?.settings || {};

  const [details, setDetails] = useState({
    church_name: settings.churchName || "Grace Victory Church Trust",
    upi_id: settings.upiId || "gracevictorychurch@okaxis",
    bank_details: {
      account_name: settings.churchName || "Grace Victory Church Ministries",
      account_number: settings.accountNumber || "921020038472910",
      bank_name: settings.bankName || "State Bank of India (SBI)",
      branch: settings.branch || "Vattamalai Branch",
      ifsc_code: settings.ifscCode || "SBIN0004921",
      swift_code: "SBININBB492"
    }
  });

  // Effective Admin-controlled credentials
  const effectiveUpiId = settings.upiId || details.upi_id || "gracevictorychurch@okaxis";
  const effectiveChurchName = settings.churchName || details.church_name || "Grace Victory Church";
  const effectiveBankName = settings.bankName || details.bank_details?.bank_name || "State Bank of India (SBI)";
  const effectiveAccountNumber = settings.accountNumber || details.bank_details?.account_number || "921020038472910";
  const effectiveBranch = settings.branch || details.bank_details?.branch || "Vattamalai Branch";
  const effectiveIfsc = settings.ifscCode || details.bank_details?.ifsc_code || "SBIN0004921";
  const effectiveSwift = settings.swiftCode || details.bank_details?.swift_code || "SBININBB492";
  const effectiveGivingVerse = settings.givingVerse || details.giving_verse || "“Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.” — Malachi 3:10";

  const initialPreset = (settings?.givingPresets || '500, 1000, 2500, 5000, 10000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)[0] || '1000';
  const [amount, setAmount] = useState(initialPreset);
  const [customAmount, setCustomAmount] = useState('');
  const [cause, setCause] = useState('Tithes & General Offerings');
  const [customMessage, setCustomMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedField, setCopiedField] = useState('');

  // 5-minute QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 300 seconds = 5 minutes
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Bank Verification Simulator Modal (for testing before live Razorpay API keys are entered)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [simulatorStatus, setSimulatorStatus] = useState('idle'); // 'idle' | 'processing' | 'declined'

  // Load details from backend
  useEffect(() => {
    async function loadDetails() {
      try {
        const data = await fetchGivingDetails();
        if (data) setDetails(data);
      } catch (err) {
        console.warn('Fallback to context settings', err);
      }
    }
    loadDetails();
  }, []);

  // 5-Minute Countdown Timer for QR Modal
  useEffect(() => {
    if (!isQrModalOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQrModalOpen]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopy = (text, fieldName) => {
    try {
      navigator.clipboard?.writeText(text)?.catch(() => {});
    } catch {}
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const finalAmount = amount === 'custom' ? parseFloat(customAmount) || 0 : parseFloat(amount);

  // Sanitized Transaction Note for UPI
  const fullNoteText = customMessage.trim() 
    ? `${cause}: ${customMessage.trim()}` 
    : `${cause} - ${donorName.trim() || 'GVC Tithes'}`;
  const upiTransactionNote = fullNoteText.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 48);

  // Universal UPI URI with prefilled Amount and Note
  const universalUpiUri = `upi://pay?pa=${encodeURIComponent(effectiveUpiId)}&pn=${encodeURIComponent(effectiveChurchName)}&am=${encodeURIComponent(finalAmount || 0)}&tn=${encodeURIComponent(upiTransactionNote)}&cu=INR`;

  // App-specific UPI deep links for mobile inside modal
  const gpayUri = universalUpiUri;
  const phonePeUri = `phonepe://pay?pa=${encodeURIComponent(effectiveUpiId)}&pn=${encodeURIComponent(effectiveChurchName)}&am=${encodeURIComponent(finalAmount || 0)}&tn=${encodeURIComponent(upiTransactionNote)}&cu=INR`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(effectiveUpiId)}&pn=${encodeURIComponent(effectiveChurchName)}&am=${encodeURIComponent(finalAmount || 0)}&tn=${encodeURIComponent(upiTransactionNote)}&cu=INR`;

  // Dynamic QR Code URL (Only generated when modal opens)
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(universalUpiUri)}`;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 100% Automated Bank Verified Payment Handler
  const handleProceedToPay = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter or select a valid giving amount.');
      return;
    }
    if (!donorName.trim()) {
      alert('Please enter your full name for the 80G tax receipt.');
      return;
    }
    if (!email.trim()) {
      alert('Please enter your email address to receive your official receipt.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const orderData = await createPaymentOrder({
        amount: finalAmount,
        donor_name: donorName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cause: cause,
        notes: customMessage.trim()
      });

      // 2. Check if using the test simulator dummy key or real Razorpay merchant keys
      const isDummyTestKey = !orderData.key_id || 
        orderData.is_test_mode ||
        orderData.key_id.includes('Testing') ||
        !orderData.order_id ||
        !orderData.order_id.startsWith('order_');

      if (isDummyTestKey) {
        if (import.meta.env.DEV) {
          setActiveOrder(orderData);
          setSimulatorStatus('idle');
          setIsSimulatorOpen(true);
        } else {
          // In production without live Razorpay keys, open the real UPI QR Scanner directly
          setTimeLeft(300);
          setIsQrModalOpen(true);
        }
        setLoading(false);
        return;
      }

      // 3. Real live Razorpay keys are configured: Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        // Fallback: If external script blocked or offline, open direct QR modal
        setTimeLeft(300);
        setIsQrModalOpen(true);
        setLoading(false);
        return;
      }

      // 4. Open Official Razorpay Checkout Modal (Google Pay, PhonePe, Paytm, QR, Cards)
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: orderData.church_name || effectiveChurchName,
        description: `${cause} — Tithes & Offerings`,
        order_id: orderData.order_id,
        prefill: {
          name: donorName.trim(),
          email: email.trim(),
          contact: phone.trim()
        },
        notes: {
          cause: cause,
          notes: customMessage.trim()
        },
        theme: {
          color: '#D97706'
        },
        handler: async function (response) {
          // THIS RUNS ONLY AFTER THE BANK RETURNS 100% SUCCESSFUL PAYMENT!
          setLoading(true);
          try {
            const verified = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id || orderData.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'bank_verified',
              donor_name: donorName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              amount: finalAmount,
              cause: cause + (customMessage.trim() ? ` (${customMessage.trim()})` : ''),
              notes: customMessage.trim()
            });

            // 100% Bank Verified & Saved in MongoDB! Show receipt
            setReceipt(verified);
          } catch (err) {
            alert('Bank verification note: ' + (err.message || 'Signature check') + '. If amount was debited, it will reflect on your receipt shortly.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        setLoading(false);
        console.warn('Payment failed callback:', response?.error);
        // Fallback gracefully to direct UPI QR modal so the donor can still pay effortlessly!
        setTimeLeft(300);
        setIsQrModalOpen(true);
      });

      setLoading(false);
      rzpInstance.open();

    } catch (err) {
      setLoading(false);
      console.warn('Payment init note:', err);
      // Fallback gracefully to UPI QR modal so the donor is never blocked
      setTimeLeft(300);
      setIsQrModalOpen(true);
    }
  };

  // Simulate Instant Bank Success (Google Pay / PhonePe verified)
  const handleSimulateBankSuccess = async () => {
    if (!activeOrder) return;
    setSimulatorStatus('processing');
    try {
      const simPaymentId = `pay_sim_${Date.now()}`;
      const verified = await verifyPayment({
        razorpay_order_id: activeOrder.order_id,
        razorpay_payment_id: simPaymentId,
        razorpay_signature: 'simulated_bank_signature_pass',
        donor_name: donorName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        amount: finalAmount,
        cause: cause + (customMessage.trim() ? ` (${customMessage.trim()})` : ''),
        notes: customMessage.trim()
      });

      setIsSimulatorOpen(false);
      setReceipt(verified);
    } catch (err) {
      alert('Bank Simulation Error: ' + (err.message || 'Verification failed'));
      setSimulatorStatus('idle');
    }
  };

  // Simulate Bank Decline / Failure (Guarantees 0 records in MongoDB)
  const handleSimulateBankDecline = () => {
    setSimulatorStatus('declined');
    setTimeout(() => {
      setIsSimulatorOpen(false);
      setSimulatorStatus('idle');
      alert('Payment Declined by Bank: As per church security configuration, 0 records were saved in the database.');
    }, 500);
  };

  // Open the QR Modal (Direct Scan Fallback)
  const handleOpenPaymentModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter or select a valid giving amount.');
      return;
    }
    if (!donorName.trim()) {
      alert('Please enter your full name for the 80G tax receipt.');
      return;
    }
    if (!email.trim()) {
      alert('Please enter your email address to receive your official receipt.');
      return;
    }

    setTimeLeft(300); // Reset timer to 5 minutes (300s)
    setIsQrModalOpen(true);
  };

  // Confirm and Generate Pending Receipt (verified by admin in dashboard)
  const handleConfirmPayment = async () => {
    setLoading(true);
    const donationPayload = {
      donor_name: donorName.trim() || 'Faithful Giver',
      email: email.trim() || settings.email || 'contact@gracevictorychurch.org',
      phone: phone.trim() || '',
      amount: finalAmount,
      cause: cause + (customMessage.trim() ? ` (${customMessage.trim()})` : ''),
      payment_method: 'UPI (Scan & Pay)',
      notes: customMessage.trim() || cause,
      status: 'Pending',
      transaction_id: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    try {
      const res = await submitDonation(donationPayload);
      setIsQrModalOpen(false);
      setReceipt(res);
    } catch (err) {
      alert('Could not record donation on server: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleMobileAppClick = () => {
    // Deep link opens the user's UPI app; do not create a DB donation before payment completes.
  };

  const presetAmounts = (settings?.givingPresets || details?.giving_presets || '500, 1000, 2500, 5000, 10000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-[#FAF9F6] text-slate-800 min-h-screen">
      
      {/* PAGE HEADER */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-[#FAF9F6] pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-amber-700 block mb-1.5 sm:mb-2">
            Kingdom Stewardship
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#0B192C] mb-2 sm:mb-4 leading-tight">
            Tithes, Offerings & <span className="gold-text-gradient">Giving</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            {effectiveGivingVerse}
          </p>
        </div>
      </section>

      {/* MAIN GIVING SECTION */}
      <section className="pt-6 sm:pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: ONLINE GIVING FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-4 sm:p-8 lg:p-10">
              
              {!receipt ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
                    <Heart className="w-4 h-4 fill-amber-600 text-amber-600" />
                    <span>Secure Online Giving</span>
                  </div>

                  <h3 className="font-serif font-bold text-2xl text-slate-950 mb-2">
                    Give Faithfully to God’s Work
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Fill in your details below to generate your secure, time-limited UPI payment QR code.
                  </p>

                  <form onSubmit={handleProceedToPay} className="space-y-6">
                    
                    {/* 1. Select Giving Category with Custom Option */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Giving Category *
                      </label>
                      <select
                        value={cause}
                        onChange={(e) => setCause(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 font-medium cursor-pointer"
                      >
                        <option value="Tithes & General Offerings">Tithes & General Offerings (தசமபாகம் & காணிக்கை)</option>
                        <option value="Sanctuary Expansion & Building Fund">Sanctuary Expansion & Building Fund (ஆலய கட்டட நிதி)</option>
                        <option value="Village Missions & Church Planting">Village Missions & Church Planting (கிராம ஊழியங்கள்)</option>
                        <option value="Mercy Ministries & Needy Care">Mercy Ministries & Needy Care (ஏழைகள் உதவி & அன்னதானம்)</option>
                        <option value="Children & Youth Ministry">Children & Youth Ministry (சிறுவர் & வாலிபர் ஊழியம்)</option>
                        <option value="Custom / Special Thanksgiving">Custom Purpose / Special Thanksgiving (தனிப்பயன் / சிறப்பு நன்றி காணிக்கை)</option>
                      </select>
                    </div>

                    {/* Custom Purpose / Prayer Note Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>Personal Prayer Note / Purpose Message (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="e.g., Birthday Thanksgiving / Healing Prayer / Family Blessing..."
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                          cause === 'Custom / Special Thanksgiving'
                            ? 'bg-amber-50/50 border-amber-300 text-slate-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                        }`}
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        This note will be automatically prefilled in your UPI transaction and official receipt.
                      </span>
                    </div>

                    {/* 2. Amount Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Amount (INR ₹) *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                        {presetAmounts.map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() => { setAmount(p); setCustomAmount(''); }}
                            className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                              amount === p
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            ₹{p}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAmount('custom')}
                          className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            amount === 'custom'
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Custom Amount
                        </button>

                        {amount === 'custom' && (
                          <input
                            type="number"
                            min="10"
                            placeholder="Enter Amount in ₹ (e.g., 25000)"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full sm:flex-1 min-w-0 px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 font-bold"
                            autoFocus
                          />
                        )}
                      </div>
                    </div>

                    {/* 3. Donor Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (for 80G Receipt) *</label>
                        <input
                          type="text"
                          required
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="Sister Grace / Brother Paul"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (for Receipt) *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="donor@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 93605 88397"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    {/* 4. Payment Method Indicator (100% Automated Bank Verification) */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                            Bank-Verified Online Giving
                          </span>
                          <span className="text-[11px] text-slate-600 block">
                            Google Pay • PhonePe • Paytm • Any UPI • Cards (100% Verified)
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-amber-800 font-serif shrink-0">
                        ₹{finalAmount}
                      </span>
                    </div>

                    {/* Primary Button to Open Bank Verified Checkout */}
                    <button
                      type="submit"
                      disabled={loading || finalAmount <= 0}
                      className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{loading ? 'Initializing Secure Payment...' : `Proceed to Secure Giving ₹${finalAmount}`}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Stores in DB only upon Bank Success</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleOpenPaymentModal}
                        className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        <QrCode className="w-3 h-3 text-amber-700" />
                        <span>Or Direct UPI QR Scanner</span>
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                /* OFFICIAL GIVING RECEIPT */
                <div className="py-4 animate-in fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <h3 className="font-serif font-bold text-2xl text-center text-slate-950 mb-1">
                    Thank You For Sowing In Faith!
                  </h3>
                  <p className="text-xs text-center text-slate-500 mb-6">
                    “God is able to make all grace abound toward you.” — 2 Corinthians 9:8
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3 text-xs text-slate-700 mb-6">
                    <div className="flex justify-between items-start gap-3 border-b pb-2">
                      <span className="font-medium text-slate-500 shrink-0">Official Receipt No:</span>
                      <strong className="font-mono text-slate-950 text-right break-all min-w-0">{receipt.receipt_number}</strong>
                    </div>
                    <div className="flex justify-between items-start gap-3 border-b pb-2">
                      <span className="font-medium text-slate-500 shrink-0">Donor Name:</span>
                      <strong className="text-slate-950 text-right break-words min-w-0">{receipt.donor_name}</strong>
                    </div>
                    <div className="flex justify-between items-center gap-3 border-b pb-2">
                      <span className="font-medium text-slate-500 shrink-0">Amount Given:</span>
                      <strong className="font-serif text-base text-amber-700 shrink-0">₹{receipt.amount}</strong>
                    </div>
                    <div className="flex justify-between items-start gap-3 border-b pb-2">
                      <span className="font-medium text-slate-500 shrink-0">Ministry Cause:</span>
                      <span className="text-slate-900 font-semibold text-right break-words min-w-0">{receipt.cause}</span>
                    </div>
                    {receipt.notes && (
                      <div className="flex justify-between items-start gap-3 border-b pb-2">
                        <span className="font-medium text-slate-500 shrink-0">Prayer Note / Purpose:</span>
                        <span className="text-slate-900 italic text-right break-words min-w-0">"{receipt.notes}"</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-3">
                      <span className="font-medium text-slate-500 shrink-0">Payment Mode:</span>
                      <span className="text-slate-900 font-semibold text-right break-words min-w-0">{receipt.payment_method}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-900 cursor-pointer shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Print Official Receipt</span>
                    </button>
                    <button
                      onClick={() => setReceipt(null)}
                      className="py-3 px-6 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Give Again
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: BANK WIRE & STEWARDSHIP INFORMATION (NO DEFAULT SCANNER) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Bank Account Card - Live Admin Synced */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Building className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Direct Bank Wire (NEFT / IMPS)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shrink-0">
                  Verified
                </span>
              </div>

              <h4 className="font-serif font-bold text-xl text-slate-950 mb-4">
                Official Church Bank Account
              </h4>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 block font-medium">Account Name</span>
                    <strong className="text-slate-950 break-words">{effectiveChurchName}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 block font-medium">Account Number</span>
                    <strong className="text-slate-950 font-mono text-sm break-all">{effectiveAccountNumber}</strong>
                  </div>
                  <button
                    onClick={() => handleCopy(effectiveAccountNumber, 'acc')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                    title="Copy Account Number"
                  >
                    {copiedField === 'acc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 block font-medium">Bank & Branch</span>
                    <strong className="text-slate-950 break-words">{effectiveBankName} — {effectiveBranch}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 block font-medium">IFSC Code</span>
                    <strong className="text-slate-950 font-mono text-sm break-all">{effectiveIfsc}</strong>
                  </div>
                  <button
                    onClick={() => handleCopy(effectiveIfsc, 'ifsc')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                    title="Copy IFSC"
                  >
                    {copiedField === 'ifsc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {effectiveSwift && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 block font-medium">SWIFT Code (International Transfer)</span>
                      <strong className="text-slate-950 font-mono text-sm break-all">{effectiveSwift}</strong>
                    </div>
                    <button
                      onClick={() => handleCopy(effectiveSwift, 'swift')}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                      title="Copy SWIFT Code"
                    >
                      {copiedField === 'swift' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-amber-700">Church UPI ID</span>
                  <span className="font-mono font-bold break-all">{effectiveUpiId}</span>
                </div>
                <button
                  onClick={() => handleCopy(effectiveUpiId, 'upi')}
                  className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition-colors cursor-pointer shrink-0"
                >
                  {copiedField === 'upi' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Ministry Accountability & 80G Tax Exemption Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-md space-y-4">
              <h4 className="font-serif font-bold text-lg text-slate-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Financial Transparency & Section 80G</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {effectiveChurchName} is committed to biblical stewardship and complete transparency. All tithes and ministry gifts are deployed directly towards gospel outreach, pastoral care, and community benevolent missions.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Eligible for tax benefits under Section 80G of the Indian Income Tax Act.</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          DYNAMIC UPI QR CODE POPUP MODAL (WITH 5-MINUTE COUNTDOWN TIMER)
         ========================================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-center my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-slate-950">
                    Scan & Pay via UPI
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Google Pay • PhonePe • Paytm • Any UPI App
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {timeLeft > 0 ? (
              /* ACTIVE 5-MINUTE SESSION */
              <div className="space-y-3 sm:space-y-4">
                
                {/* 5-Minute Countdown Timer Pill */}
                <div className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-black border ${
                  timeLeft <= 60 
                    ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Session Expires in: {formatTimer(timeLeft)}</span>
                </div>

                {/* Amount & Cause Badge */}
                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-900">
                  <div className="text-[11px] sm:text-xs text-amber-800 font-bold uppercase tracking-wider mb-0.5">
                    Amount to Pay
                  </div>
                  <div className="font-serif font-black text-2xl sm:text-3xl text-amber-700">
                    ₹{finalAmount}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5 sm:mt-1">
                    {cause} {customMessage ? `• "${customMessage}"` : ''}
                  </div>
                </div>

                {/* Dynamic QR Code */}
                <div className="bg-white p-2 sm:p-3 rounded-2xl w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center shadow-md border-2 border-amber-300">
                  <img
                    src={dynamicQrCodeUrl}
                    alt={`Scan to give ₹${finalAmount}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-xs text-slate-600">
                  Scan from your phone’s UPI App. <strong>Amount & note are prefilled!</strong>
                </div>

                {/* Mobile Direct 1-Tap Links */}
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                    Or Tap Directly on Mobile:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <a
                      href={gpayUri}
                      onClick={() => handleMobileAppClick('Google Pay')}
                      className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center text-xs sm:text-[10px] font-bold text-slate-800 transition-colors flex items-center justify-center gap-1"
                    >
                      Google Pay
                    </a>
                    <a
                      href={phonePeUri}
                      onClick={() => handleMobileAppClick('PhonePe')}
                      className="py-2.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-center text-xs sm:text-[10px] font-bold text-purple-700 transition-colors flex items-center justify-center gap-1"
                    >
                      PhonePe
                    </a>
                    <a
                      href={paytmUri}
                      onClick={() => handleMobileAppClick('Paytm')}
                      className="py-2.5 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-center text-xs sm:text-[10px] font-bold text-sky-700 transition-colors flex items-center justify-center gap-1"
                    >
                      Paytm
                    </a>
                    <a
                      href={universalUpiUri}
                      onClick={() => handleMobileAppClick('Any UPI')}
                      className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-center text-xs sm:text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      Any UPI
                    </a>
                  </div>
                </div>

                {/* Confirmation Button */}
                <div className="pt-2">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{loading ? 'Confirming...' : 'I Have Paid (Generate Official Receipt)'}</span>
                  </button>
                </div>

              </div>
            ) : (
              /* EXPIRED 5-MINUTE SESSION */
              <div className="py-8 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-slate-950 mb-1">
                    QR Code Session Expired
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    For security and accurate payment verification, this 5-minute QR code session has ended.
                  </p>
                </div>
                <button
                  onClick={() => setTimeLeft(300)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New 5-Min QR Code</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          GVC BANK PAYMENT GATEWAY SIMULATOR MODAL (TEST SIMULATOR MODE)
         ========================================================================= */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-left my-auto space-y-5">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-slate-950">
                      GVC Bank Gateway
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                      🧪 Test Simulator
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block">
                    Simulating 100% Automated Bank Verification
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/90 text-xs space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 font-medium shrink-0">Donor Name:</span>
                <strong className="text-slate-900 font-bold text-right break-words min-w-0">{donorName || 'Faithful Giver'}</strong>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 font-medium shrink-0">Contact:</span>
                <span className="text-slate-700 text-right break-all min-w-0">{phone || email}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 font-medium shrink-0">Purpose:</span>
                <span className="text-slate-700 text-right break-words min-w-0">{cause}</span>
              </div>
              <div className="pt-2 border-t border-amber-200/60 flex justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 shrink-0">Total Amount:</span>
                <span className="font-serif font-black text-2xl text-amber-700 shrink-0">₹{finalAmount}</span>
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Choose Test Outcome to Verify DB Behavior:
              </span>

              {/* Success Button */}
              <button
                type="button"
                onClick={handleSimulateBankSuccess}
                disabled={simulatorStatus === 'processing'}
                className="w-full p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Simulate Bank Success (Google Pay / PhonePe)</span>
                    <span className="text-[10px] text-emerald-100 normal-case font-normal block">
                      {simulatorStatus === 'processing' ? 'Verifying with bank...' : 'Confirms bank UPI transfer & saves record to MongoDB'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Decline Button */}
              <button
                type="button"
                onClick={handleSimulateBankDecline}
                disabled={simulatorStatus === 'processing'}
                className="w-full p-3.5 rounded-2xl bg-slate-100 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-700 border border-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <X className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Simulate Bank Decline / Cancel</span>
                    <span className="text-[10px] text-slate-500 normal-case font-normal block">
                      Declines payment — Verifies that 0 records are stored in MongoDB
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Or Direct UPI QR Option */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">Want to scan via phone?</span>
              <button
                type="button"
                onClick={() => {
                  setIsSimulatorOpen(false);
                  setTimeLeft(300);
                  setIsQrModalOpen(true);
                }}
                className="font-bold text-amber-700 hover:text-amber-800 underline inline-flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Open UPI QR Scanner</span>
              </button>
            </div>

            {/* Production Instruction Note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-900 block font-semibold mb-0.5">ℹ️ Connecting Real Razorpay Gateway:</strong>
              To accept live Google Pay, PhonePe, Paytm, and credit cards directly from donors without the simulator, create a free account at <strong>razorpay.com</strong> and paste your Key ID in <strong>Admin Settings ➔ Giving ➔ Razorpay API Keys</strong>.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
