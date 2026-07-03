import { MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '@/config/constants';

interface WhatsAppButtonProps {
  hideOnCheckout?: boolean;
}

export default function WhatsAppButton({ hideOnCheckout }: WhatsAppButtonProps) {
  if (hideOnCheckout) return null;

  return (
    <a
      href={CONTACT_INFO.WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 animate-pulse-soft"
      aria-label="تواصل عبر واتساب"
      title="تواصل معنا"
    >
      <MessageCircle className="w-7 h-7" fill="white" />
    </a>
  );
}
