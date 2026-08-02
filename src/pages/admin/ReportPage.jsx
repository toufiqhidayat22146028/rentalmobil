import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, DollarSign, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const ReportPage = () => {
  const [period, setPeriod] = useState('bulanan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.reports.getReports(period);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      setError(api.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData || !reportData.transactions) return;

    // Siapkan data untuk Sheet Transaksi
    const wsData = [
      ['ID Transaksi', 'Tgl Dibuat', 'Nama Peminjam', 'Mobil', 'Tgl Mulai', 'Tgl Selesai', 'Durasi (Hari)', 'Dengan Sopir', 'Total Biaya', 'Status Peminjaman', 'Status Pembayaran'],
      ...reportData.transactions.map(t => [
        t.id,
        new Date(t.dibuat_pada).toLocaleString('id-ID'),
        t.nama_pengguna,
        `${t.merek} ${t.nama_mobil}`,
        t.tanggal_mulai,
        t.tanggal_kembali,
        t.durasi_hari,
        t.dengan_sopir ? 'Ya' : 'Tidak',
        t.total_biaya,
        t.status,
        t.status_pembayaran
      ])
    ];

    // Buat Workbook dan Worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Styling sedikit (lebar kolom)
    ws['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 20 }, { wch: 20 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, `Laporan ${period}`);

    // Export file Excel
    XLSX.writeFile(wb, `Laporan_Penyewaan_${period}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading && !reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat data laporan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="font-bold text-lg mb-1">Gagal Memuat Laporan</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchReportData} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl text-sm font-semibold transition-colors">
          Coba Lagi
        </button>
      </div>
    );
  }

  const { kpi, popularCars, transactions } = reportData;
  const maxCount = popularCars[0]?.count || 1;

  // Ringkasan status dari data transaksi terfilter
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const activeCount = transactions.filter(t => t.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Laporan & Keuangan</h1>
          <p className="text-slate-500 text-sm mt-1">Ringkasan transaksi berdasarkan periode waktu</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="harian">Harian (Hari Ini)</option>
            <option value="mingguan">Mingguan (7 Hari Terakhir)</option>
            <option value="bulanan">Bulanan (Bulan Ini)</option>
          </select>

          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-green-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> 
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-2 text-blue-600 font-medium text-sm animate-pulse">
          Memperbarui data...
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pendapatan', value: formatCurrency(kpi.totalPendapatan), icon: DollarSign, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
          { label: 'Total Transaksi', value: kpi.totalTransaksi, icon: ClipboardList, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { label: 'Transaksi Selesai', value: kpi.transaksiSelesai, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
          { label: 'Peminjaman Dgn Sopir', value: kpi.denganSopir, icon: Users, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
        ].map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white border ${border} p-5 rounded-2xl shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-display font-extrabold text-slate-800">{value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Cars */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <h3 className="font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Mobil Paling Banyak Disewa
          </h3>
          
          {popularCars.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">Belum ada transaksi pada periode ini.</div>
          ) : (
            <div className="space-y-5">
              {popularCars.map((car, i) => (
                <div key={car.id} className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-slate-300 w-5 text-right">{i + 1}</span>
                  <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm border border-slate-200/50">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-slate-700 truncate">{car.name}</span>
                      <span className="text-slate-500 font-medium ml-2 flex-shrink-0">{car.count}x Transaksi</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(car.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 w-28">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Pendapatan</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(car.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <h3 className="font-display font-bold text-slate-800 mb-6">Status Peminjaman</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">Data kosong</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Menunggu (Pending)', value: pendingCount, color: 'bg-amber-100 text-amber-700' },
                { label: 'Disetujui', value: approvedCount, color: 'bg-blue-100 text-blue-700' },
                { label: 'Sedang Aktif', value: activeCount, color: 'bg-indigo-100 text-indigo-700' },
                { label: 'Selesai', value: kpi.transaksiSelesai, color: 'bg-green-100 text-green-700' },
                { label: 'Dibatalkan', value: kpi.dibatalkan, color: 'bg-red-100 text-red-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-600">{label}</span>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold ${color}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
