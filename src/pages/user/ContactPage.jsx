import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-semibold mb-4">Kontak Kami</h1>
      <p className="mb-6 text-sm text-gray-600">Hubungi tim kami melalui informasi berikut atau kirim pesan melalui formulir.</p>

      <div className="grid gap-6">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary-600" />
          <span>0812-3456-7890</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary-600" />
          <span>info@subulussalam.com</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary-600" />
          <span>Jl. Contoh No.1, Kota Anda</span>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Kirim Pesan</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="border rounded px-3 py-2" placeholder="Nama" />
            <input className="border rounded px-3 py-2" placeholder="Email" />
            <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="Subjek" />
            <textarea className="border rounded px-3 py-2 sm:col-span-2" rows="5" placeholder="Pesan" />
          </div>
          <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Kirim</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
