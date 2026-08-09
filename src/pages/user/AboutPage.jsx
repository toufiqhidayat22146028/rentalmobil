
const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-semibold mb-4">Tentang Kami</h1>
      <p className="mb-6 text-sm text-gray-600">
        Subulussalam Rent Car hadir untuk menyediakan layanan sewa mobil dengan
        kenyamanan, keamanan, dan harga yang transparan. Kami siap membantu
        perjalanan Anda dengan mobil kendaraan yang terawat dan tim yang
        profesional.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 p-6 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3">Visi</h2>
          <p className="text-sm text-gray-600">
            Menjadi pilihan utama pelanggan dalam layanan rental mobil dengan
            standar kualitas terbaik dan layanan yang ramah.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 p-6 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3">Misi</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>Menyediakan mobil yang terawat dan nyaman.</li>
            <li>Memberikan proses pemesanan yang cepat dan mudah.</li>
            <li>Mendukung perjalanan bisnis maupun liburan dengan layanan penuh.</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold mb-3">Mengapa memilih kami?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Dengan pengalaman layanan transportasi lokal dan fokus pada kepuasan
          pelanggan, kami memastikan setiap perjalanan Anda menjadi lebih mudah,
          aman, dan menyenangkan.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
