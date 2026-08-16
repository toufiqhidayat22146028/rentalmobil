import { Phone, Mail, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-semibold mb-4">Kontak Kami</h1>
      <p className="mb-6 text-sm text-gray-600">Hubungi tim kami melalui informasi berikut untuk pertanyaan atau bantuan seputar layanan rental mobil.</p>

      <div className="grid gap-6">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary-600" />
          <span>0856-6299-954</span>
        </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <span>Jl. Hamzah Fansuri No. 12, Dusun Rundeng Tengah, Kampong Pasar Rundeng, Kec. Rundeng, Kota Subulussalam, Aceh 27822</span>
          </div>
      </div>

      <div className="mt-10 p-6 rounded-3xl border border-blue-100 bg-blue-50/50 text-center">
        <h2 className="text-lg font-medium text-blue-900 mb-2">Butuh Bantuan Cepat?</h2>
        <p className="text-sm text-blue-700 mb-5">
          Gunakan fitur Chatbot di pojok kanan bawah, atau hubungi kami langsung via WhatsApp untuk respons instan.
        </p>
        <a
          href="https://wa.me/628566299954?text=Halo%20Admin%20Subulussalam%20Rent%20Car,%20saya%20memiliki%20pertanyaan%20seputar%20peminjaman%20mobil."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Phone className="w-4 h-4" />
          Chat WhatsApp
        </a>
      </div>
    </div>
  );
};

export default ContactPage;
