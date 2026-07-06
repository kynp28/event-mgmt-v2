import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export const Invoice = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide navbar and footer for print mode
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        nav { display: none !important; }
        body { background: white; color: black; }
        .glass-card { background: white; border: none; box-shadow: none; }
        .btn { display: none; }
      }
    `;
    document.head.appendChild(style);

    const fetchBooking = async () => {
      try {
        const res = await api.get('/bookings/my');
        // Find the specific booking. (In a real app, there'd be an endpoint to fetch 1 booking)
        const b = res.data.data.find((x: any) => x.bookingId === Number(id));
        setBooking(b);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();

    return () => {
      document.head.removeChild(style);
    };
  }, [id]);

  if (loading) return <div className="container mt-10">Loading Invoice...</div>;
  if (!booking) return <div className="container mt-10">Invoice not found.</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div className="glass-card" style={{ padding: '40px', backgroundColor: 'white', color: 'black' }}>
        <div className="flex justify-between items-start mb-8 border-b pb-4 border-gray-300">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary" style={{ color: '#8b5cf6' }}>EventSpace.</h1>
            <p className="text-gray-600">Event Space Booking System</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl text-gray-800">INVOICE</h2>
            <p className="text-gray-500 mt-2">Invoice #: INV-{booking.bookingId.toString().padStart(5, '0')}</p>
            <p className="text-gray-500">Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-500 font-bold mt-2">Status: {booking.status.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">Billed To:</h3>
            <p className="text-gray-700">{booking.vendor?.username || 'Vendor'}</p>
            <p className="text-gray-600">{booking.vendor?.email}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">Event Organizer:</h3>
            <p className="text-gray-700">{booking.event?.organizer?.username || 'Organizer'}</p>
            <p className="text-gray-600">{booking.event?.eventName}</p>
            <p className="text-gray-600">{booking.event?.location}</p>
          </div>
        </div>

        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="py-2 text-gray-800">Description</th>
              <th className="py-2 text-gray-800 text-center">Qty</th>
              <th className="py-2 text-gray-800 text-right">Unit Price</th>
              <th className="py-2 text-gray-800 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4 text-gray-700">Booth Booking - {booking.booth?.boothNo}</td>
              <td className="py-4 text-gray-700 text-center">1</td>
              <td className="py-4 text-gray-700 text-right">฿{booking.totalAmount}</td>
              <td className="py-4 text-gray-700 text-right">฿{booking.totalAmount}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-4 text-right font-bold text-gray-800">Total:</td>
              <td className="py-4 text-right font-bold text-lg" style={{ color: '#8b5cf6' }}>฿{booking.totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Thank you for using EventSpace.</p>
          <p>If you have any questions concerning this invoice, please contact support@eventspace.com</p>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
};
