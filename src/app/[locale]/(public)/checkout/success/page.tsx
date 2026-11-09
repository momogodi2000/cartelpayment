'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Truck, ArrowRight, HeartHandshake, FileText } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    async function checkOrder() {
      try {
        const res = await fetch(`/api/tracking/order?ref=${encodeURIComponent(ref)}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error fetching order confirmation:', err);
      } finally {
        setLoading(false);
      }
    }

    checkOrder();
  }, [ref]);

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#EDE7DC] p-8 sm:p-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold">
          Payment Acknowledged
        </span>
        <h1 className="text-3xl font-serif text-[#183C32] mt-2 mb-4">
          Congratulations on your New Companion!
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed max-w-lg mx-auto">
          Your order has been registered under reference{' '}
          <strong className="text-[#183C32] font-mono text-base">{ref || 'PWL-2026-CONFIRMED'}</strong>. An email
          confirmation containing your receipt and private tracking credentials has been dispatched.
        </p>

        {order && (
          <div className="bg-[#F8F6F0] border border-[#EDE7DC] rounded-xl p-5 my-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Animal:</span>
              <span className="font-semibold text-gray-800">{order.items?.[0]?.animalName} ({order.items?.[0]?.animalBreed})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Destination:</span>
              <span className="font-semibold text-gray-800">{order.deliveryCity}, {order.deliveryCountry}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Settled:</span>
              <span className="font-bold text-[#183C32]">€{((order.totalCents || 0) / 100).toFixed(2)} EUR</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
            <FileText className="w-5 h-5 text-[#183C32] mb-2" />
            <h4 className="text-xs font-bold text-gray-900">1. Veterinary Review</h4>
            <p className="text-[11px] text-gray-500 mt-1">Health certificate and EU passport endorsement.</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
            <HeartHandshake className="w-5 h-5 text-[#183C32] mb-2" />
            <h4 className="text-xs font-bold text-gray-900">2. Breeder Handover</h4>
            <p className="text-[11px] text-gray-500 mt-1">Preparation of dietary and pedigree pack.</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
            <Truck className="w-5 h-5 text-[#183C32] mb-2" />
            <h4 className="text-xs font-bold text-gray-900">3. Doorstep Delivery</h4>
            <p className="text-[11px] text-gray-500 mt-1">Climate-controlled European transport coordination.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t">
          <Link
            href={`/track-order?ref=${encodeURIComponent(ref)}`}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#183C32] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#122e26] transition-all"
          >
            <span>Track Order Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/support"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <span>Contact Concierge Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F0] py-20 text-center font-serif text-[#183C32]">
          Confirming order status...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
