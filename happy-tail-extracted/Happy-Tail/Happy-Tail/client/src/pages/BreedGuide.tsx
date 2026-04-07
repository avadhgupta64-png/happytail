import { useState } from "react";
import { Search, Bone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BreedCard } from "@/components/BreedCard";
import { useBreeds } from "@/hooks/use-breeds";
import { Input } from "@/components/ui/input";

export default function BreedGuide() {
  const { data: breeds, isLoading } = useBreeds();
  const [search, setSearch] = useState("");

  const filteredBreeds = breeds?.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.traits.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto pb-20">
      <PageHeader 
        title="Breed Guide" 
        description="Discover your perfect companion. Learn about traits, care needs, and personality."
      />

      <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            className="pl-12 py-6 rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus-visible:ring-primary focus-visible:border-primary text-lg"
            placeholder="Search breeds (e.g., 'Golden Retriever', 'Friendly')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {filteredBreeds && filteredBreeds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBreeds.map((breed, index) => (
                <BreedCard key={breed.id} breed={breed} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-300">
                <Bone className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-500 mb-2">No breeds found</h3>
              <p className="text-gray-400">Try searching for a different name or trait.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
