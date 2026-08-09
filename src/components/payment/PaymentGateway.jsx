import { useState, useEffect } from 'react';
import { X, Shield, Lock, AlertCircle } from 'lucide-react';
import { paymentsAPI } from '../../services/api';

const PaymentGateway = ({ isOpen, booking, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && booking && !loading && !error) {
      const initiateMidtransPayment = async () => {
        setLoading(true);
        setError('');
        try {
          // Call backend to get Snap token
          const { data } = await paymentsAPI.process(booking.id, 'midtrans');
          
          if (data.success && data.token) {
            // Trigger Midtrans Snap popup
            window.snap.pay(data.token, {
              onSuccess: function(result) {
                // Payment success
                onSuccess(result.order_id, result.payment_type);
              },
              onPending: function(result) {
                // Payment pending (e.g. waiting for transfer)
                // We can close this or tell them to check email
                onClose();
                alert('Menunggu pembayaran! Cek petunjuk pada aplikasi atau email Anda.');
              },
              onError: function(result) {
                setError('Pembayaran gagal atau ditolak. Silakan coba metode lain.');
              },
              onClose: function() {
                // User closed the Snap popup manually
                setLoading(false);
                onClose();
              }
            });
          } else {
            setError(data.message || 'Gagal membuat transaksi pembayaran.');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Terjadi kesalahan sistem.');
        } finally {
          // Note: we don't setLoading(false) right away if success because Snap handles the UI
        }
      };

      initiateMidtransPayment();
    }
  }, [isOpen, booking]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-700" />
        </div>
        
        {loading && !error ? (
          <>
            <h3 className="font-display font-bold text-gray-800 text-xl mb-2">Menyiapkan Pembayaran...</h3>
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin mx-auto mt-6 mb-2" />
            <p className="text-sm text-gray-500">Membuka gerbang pembayaran aman Midtrans</p>
          </>
        ) : error ? (
          <>
            <div className="flex justify-center mb-2 text-red-500">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="font-display font-bold text-gray-800 text-xl mb-2">Gagal Memuat</h3>
            <p className="text-sm text-red-500 mb-6">{error}</p>
            <button onClick={onClose} className="btn-primary w-full justify-center">Tutup</button>
          </>
        ) : (
          <>
             <h3 className="font-display font-bold text-gray-800 text-xl mb-2">Memproses...</h3>
          </>
        )}

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Dilindungi oleh Midtrans SSL Enkripsi</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
