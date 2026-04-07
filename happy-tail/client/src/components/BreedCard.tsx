import { type Breed } from "@shared/schema";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BreedCardProps {
  breed: Breed;
  index: number;
}

export function BreedCard({ breed, index }: BreedCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-amber-50"
        >
          <div className="aspect-square overflow-hidden bg-gray-100">
            {breed.imageUrl ? (
              <img
                src={breed.imageUrl}
                alt={breed.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-200">
                <PawPrint className="w-20 h-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <p className="text-white font-medium">View details</p>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold font-display text-gray-800 group-hover:text-primary transition-colors">
              {breed.name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {breed.traits.slice(0, 2).map((trait) => (
                <Badge key={trait} variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
                  {trait}
                </Badge>
              ))}
              {breed.traits.length > 2 && (
                <Badge variant="outline" className="text-gray-400 text-xs">+{breed.traits.length - 2}</Badge>
              )}
            </div>
          </div>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-3xl border-none">
        <div className="grid md:grid-cols-2 h-full">
          <div className="relative h-64 md:h-full bg-gray-100">
            {breed.imageUrl ? (
              <img src={breed.imageUrl} alt={breed.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <PawPrint className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col h-full bg-white">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-3xl font-display font-bold text-primary mb-2">
                {breed.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                {breed.traits.map((trait) => (
                  <Badge key={trait} className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border-none text-sm px-3 py-1">
                    {trait}
                  </Badge>
                ))}
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">About</h4>
                  <DialogDescription className="text-base text-gray-600 leading-relaxed">
                    {breed.description}
                  </DialogDescription>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Care Guide</h4>
                  <div className="bg-amber-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed border border-amber-100">
                    {breed.careGuide}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
