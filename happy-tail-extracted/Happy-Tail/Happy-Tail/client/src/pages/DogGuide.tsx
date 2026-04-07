import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Dog, Heart, XCircle, ChevronLeft, Utensils, Star, Shield, Activity, Scissors, Users, MapPin, Clock, Scale } from "lucide-react";
import { allBreeds, type BreedInfo } from "@/data/breeds-data";
import { useLanguage } from "@/lib/language-context";

function BreedCard({ breed, onClick }: { breed: BreedInfo; onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover-elevate transition-all"
      onClick={onClick}
      data-testid={`card-breed-${breed.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={breed.imageUrl}
          alt={breed.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x250/f59e0b/ffffff?text=${encodeURIComponent(breed.name)}`;
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-800 font-display text-lg leading-tight">{breed.name}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs bg-primary/10 text-primary border-none">
            {breed.size}
          </Badge>
        </div>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{breed.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {breed.traits.slice(0, 3).map((trait) => (
            <span key={trait} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {trait}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function BreedDetail({ breed, onBack }: { breed: BreedInfo; onBack: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto"
      data-testid="breed-detail"
    >
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6 gap-2 text-gray-500"
        data-testid="button-back-breeds"
      >
        <ChevronLeft className="w-4 h-4" /> {t.common.back}
      </Button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
        <div className="aspect-[21/9] overflow-hidden bg-gray-100 relative">
          <img
            src={breed.imageUrl}
            alt={breed.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/800x340/f59e0b/ffffff?text=${encodeURIComponent(breed.name)}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2" data-testid="text-breed-name">
              {breed.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {breed.traits.map((trait) => (
                <Badge key={trait} className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">{t.breedGuide.origin}</p>
              <p className="text-sm font-bold text-gray-700">{breed.origin}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">{t.breedGuide.lifespan}</p>
              <p className="text-sm font-bold text-gray-700">{breed.lifespan}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Scale className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">{t.breedGuide.weight}</p>
              <p className="text-sm font-bold text-gray-700">{breed.weight}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Dog className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Group</p>
              <p className="text-sm font-bold text-gray-700">{breed.group}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold font-display text-gray-800 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{breed.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" /> Likings
              </h3>
              <ul className="space-y-2">
                {breed.likings.map((item, i) => (
                  <li key={i} className="text-green-700 text-sm flex items-center gap-2">
                    <Star className="w-3 h-3 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Dislikings
              </h3>
              <ul className="space-y-2">
                {breed.dislikings.map((item, i) => (
                  <li key={i} className="text-red-700 text-sm flex items-center gap-2">
                    <Shield className="w-3 h-3 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-6">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5" /> {t.breedGuide.diet}
            </h3>
            <p className="text-amber-700 text-sm leading-relaxed">{breed.eatingHabits}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> {t.breedGuide.exercise}
              </h3>
              <p className="text-blue-700 text-sm">{breed.exerciseNeeds}</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
              <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                <Scissors className="w-4 h-4" /> {t.breedGuide.grooming}
              </h3>
              <p className="text-purple-700 text-sm">{breed.groomingLevel}</p>
            </div>

            <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
              <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Good With
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {breed.goodWith.map((item, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">{t.breedGuide.care}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{breed.careGuide}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const sizeFilters = ["All", "Toy", "Small", "Medium", "Large", "Giant"];

export default function DogGuide() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<BreedInfo | null>(null);
  const [sizeFilter, setSizeFilter] = useState("All");

  const filteredBreeds = allBreeds.filter((breed) => {
    const matchesSearch = breed.name.toLowerCase().includes(search.toLowerCase()) ||
      breed.traits.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      breed.origin.toLowerCase().includes(search.toLowerCase()) ||
      breed.group.toLowerCase().includes(search.toLowerCase());
    const matchesSize = sizeFilter === "All" || breed.size.toLowerCase().includes(sizeFilter.toLowerCase());
    return matchesSearch && matchesSize;
  });

  if (selectedBreed) {
    return (
      <div className="max-w-6xl mx-auto">
        <BreedDetail breed={selectedBreed} onBack={() => setSelectedBreed(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" data-testid="breed-guide-page">
      <PageHeader 
        title={t.breedGuide.title} 
        description={t.breedGuide.subtitle}
      />

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t.breedGuide.searchBreeds}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
            data-testid="input-search-breeds"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              data-testid="button-clear-search"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {sizeFilters.map((size) => (
            <button
              key={size}
              onClick={() => setSizeFilter(size)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                sizeFilter === size
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              data-testid={`filter-size-${size.toLowerCase()}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400" data-testid="text-breed-count">
          Showing {filteredBreeds.length} of {allBreeds.length} breeds
        </p>
      </div>

      {filteredBreeds.length === 0 ? (
        <div className="text-center py-16">
          <Dog className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">{t.locations.noResults}</h3>
          <p className="text-gray-400 text-sm">Try a different search term or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBreeds.map((breed) => (
            <BreedCard key={breed.name} breed={breed} onClick={() => setSelectedBreed(breed)} />
          ))}
        </div>
      )}
    </div>
  );
}
