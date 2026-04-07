import { Phone, HeartPulse, AlertTriangle, ShieldCheck, MapPin, MessageSquare, Flame, Bug, Pill, Droplets, ChevronRight, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";

const protocols = [
  {
    id: "choking",
    title: "Choking",
    icon: AlertTriangle,
    color: "text-red-600 bg-red-50",
    content: "Check the mouth for obstructions. If visible, remove carefully with tweezers. If not visible, perform the Heimlich: for small dogs, hold them with their back against your chest and push inward/upward below the rib cage. For large dogs, place your fist just behind the last rib and push firmly upward 5 times.",
  },
  {
    id: "cpr",
    title: "CPR (Cardiopulmonary Resuscitation)",
    icon: HeartPulse,
    color: "text-pink-600 bg-pink-50",
    content: "Check for breathing and heartbeat. Place dog on right side on a flat surface. For compressions: push down on the widest part of the chest at 100-120 per minute. Give 2 rescue breaths (close mouth, breathe into nose) every 30 compressions. Continue until breathing resumes or vet arrives.",
  },
  {
    id: "heatstroke",
    title: "Heatstroke (Critical in Delhi Summers)",
    icon: Flame,
    color: "text-orange-600 bg-orange-50",
    content: "Move to AC or shade immediately. Wet the dog with cool (NOT ice cold) water, focusing on paws, ears, and belly. Place cool wet towels on neck and armpits. Offer small sips of water. Do NOT cover with wet towels (traps heat). Rush to vet if temperature exceeds 104\u00b0F (40\u00b0C).",
  },
  {
    id: "poisoning",
    title: "Poisoning / Toxic Ingestion",
    icon: Pill,
    color: "text-purple-600 bg-purple-50",
    content: "Note what was ingested and when. Do NOT induce vomiting unless directed by a vet. Common Delhi hazards: rat poison, chocolate, xylitol, grapes, onions, antifreeze. Call vet immediately. Bring the packaging of the ingested substance if possible.",
  },
  {
    id: "tick-bite",
    title: "Tick Bite / Tick Fever",
    icon: Bug,
    color: "text-green-600 bg-green-50",
    content: "Common in Delhi monsoons. Remove tick with fine tweezers close to skin, pull steadily upward. Clean area with antiseptic. Watch for symptoms: fever, lethargy, loss of appetite, dark urine. Tick fever can be fatal if untreated - consult vet within 24 hours if symptoms appear.",
  },
  {
    id: "bleeding",
    title: "Wounds & Bleeding",
    icon: Droplets,
    color: "text-blue-600 bg-blue-50",
    content: "Apply firm pressure with clean cloth for 5-10 minutes. For paw cuts, wrap snugly with gauze. Do NOT use hydrogen peroxide (damages tissue). Clean with saline solution. If bleeding doesn't stop in 10 minutes or wound is deep, rush to vet. Keep dog calm and still.",
  },
];

const VETS = [
  { id: 1, name: "Max Vets Hospital", phone: "+91 11 4052 5252", address: "Safdarjung Enclave", area: "South Delhi", emergency: true },
  { id: 2, name: "CGS Hospital for Animals", phone: "+91 11 2686 4200", address: "Green Park Extension", area: "South Delhi", emergency: true },
  { id: 3, name: "Cessna Lifeline Vet Hospital", phone: "+91 120 429 2000", address: "Sector 3, Noida", area: "East", emergency: true },
  { id: 4, name: "DCC Animal Hospital", phone: "+91 11 2551 0418", address: "Janakpuri", area: "West Delhi", emergency: false },
  { id: 5, name: "Dr. Rana's Pet Clinic", phone: "+91 98100 52365", address: "Neeti Bagh", area: "South Delhi", emergency: false },
  { id: 6, name: "Petcetera Vet Clinic", phone: "+91 98110 54101", address: "Chittaranjan Park", area: "South Delhi", emergency: false },
  { id: 7, name: "Dr. Kumar's Vet Care", phone: "+91 98110 54101", address: "Dwarka Sector 12", area: "West Delhi", emergency: false },
  { id: 8, name: "Dr. Gupta's Pet Care", phone: "+91 98182 11223", address: "Rohini Sector 9", area: "North Delhi", emergency: false },
  { id: 9, name: "Dr. Verma's Pet Clinic", phone: "+91 98101 23456", address: "Preet Vihar", area: "East Delhi", emergency: false },
  { id: 10, name: "Dr. Aggarwal's Vet Care", phone: "+91 98105 67890", address: "Pitampura", area: "North Delhi", emergency: false },
];

export default function Emergency() {
  const [selectedVet, setSelectedVet] = useState<typeof VETS[0] | null>(null);
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto" data-testid="emergency-page">
      <PageHeader
        title={t.emergency.title}
        description={t.emergency.subtitle}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-10 bg-red-50 rounded-3xl p-6 md:p-8 border border-red-100 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500 text-white mb-4 shadow-lg shadow-red-500/30">
          <Phone className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-display font-bold text-red-800 mb-2">{t.emergency.title}</h2>
        <p className="text-red-600 text-sm mb-6 max-w-md mx-auto">{t.emergency.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {VETS.filter(v => v.emergency).map(vet => (
            <button
              key={vet.id}
              onClick={() => setSelectedVet(vet)}
              className="bg-white rounded-xl p-4 border border-red-100 hover-elevate transition-all text-left"
              data-testid={`button-vet-${vet.id}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-red-500 text-white text-[10px] border-none">24/7</Badge>
              </div>
              <p className="font-bold text-gray-800 text-sm">{vet.name}</p>
              <p className="text-gray-400 text-xs">{vet.address}</p>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedVet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedVet(null)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
              data-testid="vet-contact-modal"
            >
              <Button size="icon" variant="ghost" onClick={() => setSelectedVet(null)} className="absolute top-3 right-3" data-testid="button-close-vet">
                <X className="w-5 h-5" />
              </Button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-display text-gray-800">{selectedVet.name}</h3>
                <p className="text-gray-400 text-sm">{selectedVet.address}</p>
                <p className="text-primary font-mono font-bold mt-1">{selectedVet.phone}</p>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full rounded-xl gap-2"
                  onClick={() => window.location.href = `tel:${selectedVet.phone}`}
                  data-testid="button-call-vet"
                >
                  <Phone className="w-4 h-4" /> {t.emergency.callNow}
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 border-green-300 text-green-700"
                  onClick={() => {
                    const phone = selectedVet.phone.replace(/[^0-9+]/g, '');
                    const msg = encodeURIComponent(`Emergency: My dog needs immediate help. Can you assist?`);
                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                  }}
                  data-testid="button-whatsapp-vet"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVet.name + ' ' + selectedVet.address + ' New Delhi')}`, '_blank')}
                  data-testid="button-directions-vet"
                >
                  <MapPin className="w-4 h-4" /> {t.locations.directions}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-red-500" /> {t.emergency.firstAid}
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {protocols.map((protocol) => (
              <AccordionItem key={protocol.id} value={protocol.id} className="border rounded-2xl overflow-hidden" data-testid={`accordion-${protocol.id}`}>
                <AccordionTrigger className="hover:no-underline px-4 py-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${protocol.color}`}>
                      <protocol.icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{protocol.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">
                    {protocol.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" /> {t.emergency.nearbyVets}
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {VETS.map((vet) => (
              <button
                key={vet.id}
                onClick={() => setSelectedVet(vet)}
                className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 hover-elevate transition-all flex items-center gap-4"
                data-testid={`vet-card-${vet.id}`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-gray-800 text-sm truncate">{vet.name}</p>
                    {vet.emergency && (
                      <Badge className="bg-red-500 text-white text-[10px] border-none shrink-0">24/7</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{vet.address} &middot; {vet.area}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {t.emergency.protocols}
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            "Pale or blue gums/tongue",
            "Rapid or labored breathing",
            "Weak or very rapid pulse",
            "Body temperature above 104\u00b0F",
            "Unresponsive or collapsed",
            "Seizures or tremors",
            "Bleeding that won't stop",
            "Swollen abdomen (bloat)",
          ].map((sign, i) => (
            <div key={i} className="flex items-center gap-2 text-amber-700 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> {sign}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
