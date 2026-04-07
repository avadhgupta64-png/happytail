import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, ExternalLink, Search, Dog, MapPin, Heart, Shield, Stethoscope, GraduationCap, Camera, Bike, ShoppingBag, Sparkles } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface WhatsAppGroup {
  name: string;
  description: string;
  members: string;
  category: string;
  area: string;
  link: string;
  icon: typeof Users;
  active: boolean;
}

const whatsappGroups: WhatsAppGroup[] = [
  {
    name: "Dog Lovers India",
    description: "One of the largest Indian dog lover communities. Share tips, ask questions, and connect with fellow dog parents across the country.",
    members: "2,400+",
    category: "General",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/6tXJlqOiZvvJJtpRXhmA3E",
    icon: Users,
    active: true,
  },
  {
    name: "Indian Dogs Community",
    description: "Dedicated to Indian dog breeds and pet owners. Discuss desi breeds, share care tips, and connect with responsible dog parents across India.",
    members: "1,800+",
    category: "General",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/9jZ6gaQinohAQyVnlOlN2d",
    icon: Dog,
    active: true,
  },
  {
    name: "All Dogs Community",
    description: "A welcoming space for all dog owners regardless of breed. Share photos, training tips, health advice, and heartwarming stories.",
    members: "1,200+",
    category: "General",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/518xWZ2w6eV0n8Izwtg3Sb",
    icon: Users,
    active: true,
  },
  {
    name: "Dog Rescue & Adoption",
    description: "Dedicated to rescuing and rehoming stray and abandoned dogs. Share adoption posts, foster requests, and rescue alerts.",
    members: "3,100+",
    category: "Rescue",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/542MDV2X0MTEX2loIZ5neO",
    icon: Heart,
    active: true,
  },
  {
    name: "Indian Dog Breeds",
    description: "Celebrating Indian Pariah dogs and indigenous breeds like Rajapalayam, Mudhol Hound, and Kombai. Breed info, care tips, and adoption support.",
    members: "1,500+",
    category: "Breed-Specific",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/CwusL3z3kZCBbYd2ees9kk",
    icon: Dog,
    active: true,
  },
  {
    name: "Dog Food & Nutrition Guide",
    description: "Expert advice on dog nutrition, homemade food recipes, recommended brands available in India, and diet plans for different breeds and ages.",
    members: "950+",
    category: "Health",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/0ghOhvYiR85KsMC5df9CNo",
    icon: Stethoscope,
    active: true,
  },
  {
    name: "Pets Home India",
    description: "A pet care community covering health concerns, vet recommendations, vaccination schedules, grooming tips, and emergency care advice.",
    members: "1,500+",
    category: "Health",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/CRPzEHnKsbqAcHdQ6nALlB",
    icon: Stethoscope,
    active: true,
  },
  {
    name: "Dog Training & Behavior",
    description: "For dog parents seeking training advice. Puppy training, socialization tips, behavioral guidance, and positive reinforcement techniques.",
    members: "700+",
    category: "Training",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/IqJaUj2LbVH5FiXtBhEISh",
    icon: GraduationCap,
    active: true,
  },
  {
    name: "All Dog Breeds Info",
    description: "Learn about different dog breeds, their temperaments, care needs, and suitability for Indian climate. Great for new dog parents choosing a breed.",
    members: "600+",
    category: "Breed-Specific",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/89XyH4ybc8Z7ne2D0L5ORW",
    icon: Dog,
    active: true,
  },
  {
    name: "Dog Lovers Circle",
    description: "Share adorable photos, funny moments, and heartwarming stories about your dogs. A feel-good community for all dog enthusiasts.",
    members: "1,100+",
    category: "Lifestyle",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/HNofOSY5PwwDwlidbGuTJ4",
    icon: Camera,
    active: true,
  },
  {
    name: "Dog Lovers Group",
    description: "Active community of dog lovers sharing daily tips, cute videos, health advice, and connecting with fellow pet parents.",
    members: "850+",
    category: "General",
    area: "All India",
    link: "https://chat.whatsapp.com/GPFz9YfHPTg3V55IUqTWjA",
    icon: Users,
    active: true,
  },
  {
    name: "Pet Owners Community",
    description: "Connect with pet owners to discuss pet care, find trusted vets, share product reviews, and get advice from experienced pet parents.",
    members: "650+",
    category: "General",
    area: "All India",
    link: "https://chat.whatsapp.com/G1CLkRPnTYE6jVXmyQsuBm",
    icon: Users,
    active: true,
  },
  {
    name: "Haryana Dog Group",
    description: "Dog owners from Haryana and nearby NCR areas. Local meetups, vet recommendations, breed discussions, and community events.",
    members: "550+",
    category: "Area-Based",
    area: "Haryana & NCR",
    link: "https://chat.whatsapp.com/invite/LiEzVM9BAKqAjRCTrX1An8",
    icon: MapPin,
    active: true,
  },
  {
    name: "Doggys World",
    description: "Fun and active group for dog lovers. Share memes, videos, training wins, and daily adventures with your four-legged best friend.",
    members: "900+",
    category: "Lifestyle",
    area: "All India",
    link: "https://chat.whatsapp.com/invite/6HHKXE8D6D9DQAFNKZKw36",
    icon: Sparkles,
    active: true,
  },
  {
    name: "Pets & Animals Lovers",
    description: "Broader pet community covering dogs, cats, and other animals. Great for multi-pet households and general animal welfare discussions.",
    members: "1,300+",
    category: "General",
    area: "All India",
    link: "https://chat.whatsapp.com/JldwPSrIhpO1UIIPRA7pFT",
    icon: Heart,
    active: true,
  },
];

const categories = ["All", "General", "Area-Based", "Breed-Specific", "Health", "Training", "Rescue", "Lifestyle"];

const categoryColors: Record<string, string> = {
  "General": "bg-blue-100 text-blue-700",
  "Area-Based": "bg-green-100 text-green-700",
  "Breed-Specific": "bg-purple-100 text-purple-700",
  "Health": "bg-red-100 text-red-700",
  "Training": "bg-amber-100 text-amber-700",
  "Rescue": "bg-pink-100 text-pink-700",
  "Activities": "bg-teal-100 text-teal-700",
  "Lifestyle": "bg-indigo-100 text-indigo-700",
  "Marketplace": "bg-orange-100 text-orange-700",
  "Events": "bg-cyan-100 text-cyan-700",
};

export default function Community() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredGroups = whatsappGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.description.toLowerCase().includes(search.toLowerCase()) ||
      group.area.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto" data-testid="community-page">
      <PageHeader
        title="Community"
        description="Connect with fellow dog owners in Delhi NCR. Join WhatsApp groups to share advice, arrange playdates, and build lasting friendships."
      />

      <Card className="p-5 mb-8 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shrink-0">
            <SiWhatsapp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-300 mb-1">Join Dog Owner Communities</h3>
            <p className="text-green-700 dark:text-green-400 text-sm leading-relaxed">
              Tap any group below to open it in WhatsApp. Connect with thousands of dog parents across Delhi NCR who share tips, vet recommendations, and arrange fun meetups for their furry friends.
            </p>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities by name, topic, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
            data-testid="input-search-communities"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const count = cat === "All" ? whatsappGroups.length : whatsappGroups.filter(g => g.category === cat).length;
            if (count === 0 && cat !== "All") return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                data-testid={`filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat} {cat === "All" ? `(${count})` : count}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4" data-testid="text-community-count">
        Showing {filteredGroups.length} communities
      </p>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No communities found</h3>
          <p className="text-gray-400 text-sm">Try a different search or category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card
                className="p-5 hover-elevate transition-all cursor-pointer"
                onClick={() => window.open(group.link, "_blank")}
                data-testid={`card-community-${index}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                    <SiWhatsapp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base leading-snug">{group.name}</h3>
                      <ExternalLink className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">{group.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className={`text-xs border-none ${categoryColors[group.category] || "bg-gray-100 text-gray-600"}`}>
                        {group.category}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {group.area}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {group.members} members
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="mt-8 p-5 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
        <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Community Guidelines
        </h3>
        <ul className="text-amber-700 dark:text-amber-400 text-sm space-y-1.5">
          <li>Be respectful and kind to all members</li>
          <li>No selling or buying of live animals</li>
          <li>Share verified information only, especially about health</li>
          <li>Report any animal abuse immediately to authorities</li>
          <li>Keep discussions relevant to the group topic</li>
        </ul>
      </Card>
    </div>
  );
}
