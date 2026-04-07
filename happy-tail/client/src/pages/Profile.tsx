import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Plus, Trash2, Save, PawPrint, Edit2, X, Dog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import type { DogProfile } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBio((user as any)?.bio || "");
      setProfileImageUrl(user.profileImageUrl || "");
    }
  }, [user]);

  const [showAddDog, setShowAddDog] = useState(false);
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [dogWeight, setDogWeight] = useState("");
  const [dogGender, setDogGender] = useState("");

  const { data: dogProfiles = [], isLoading: dogsLoading } = useQuery<DogProfile[]>({
    queryKey: ["/api/dog-profiles"],
  });

  const updateProfile = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; bio: string; profileImageUrl: string }) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditing(false);
      toast({ title: "Profile updated" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const addDog = useMutation({
    mutationFn: async (data: { dogName: string; breed: string; age: string; weight: string; gender: string }) => {
      const res = await apiRequest("POST", "/api/dog-profiles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dog-profiles"] });
      setShowAddDog(false);
      setDogName("");
      setDogBreed("");
      setDogAge("");
      setDogWeight("");
      setDogGender("");
      toast({ title: "Dog profile added" });
    },
  });

  const deleteDog = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/dog-profiles/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dog-profiles"] });
      toast({ title: "Dog profile removed" });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map(n => n?.[0]?.toUpperCase())
    .join("") || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1" data-testid="text-profile-title">
          {t.nav.profile}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {user?.email}
        </p>
      </motion.div>

      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={editing ? profileImageUrl : (user?.profileImageUrl || "")} alt="Profile" />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {editing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  data-testid="input-profile-image"
                />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">First Name</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your dogs..."
                    className="resize-none"
                    rows={3}
                    data-testid="input-bio"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => updateProfile.mutate({ firstName, lastName, bio, profileImageUrl })}
                    disabled={updateProfile.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {t.common.save}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditing(false)} data-testid="button-cancel-edit">
                    <X className="w-4 h-4 mr-1.5" />
                    {t.common.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-foreground" data-testid="text-display-name">
                  {user?.firstName || user?.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : user?.email?.split("@")[0] || "User"}
                </h2>
                {(user as any)?.bio && (
                  <p className="text-sm text-muted-foreground mt-1" data-testid="text-bio">{(user as any).bio}</p>
                )}
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setFirstName(user?.firstName || "");
                    setLastName(user?.lastName || "");
                    setBio((user as any)?.bio || "");
                    setProfileImageUrl(user?.profileImageUrl || "");
                    setEditing(true);
                  }}
                  data-testid="button-edit-profile"
                >
                  <Edit2 className="w-4 h-4 mr-1.5" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary" />
            {t.common.myDogs}
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowAddDog(!showAddDog)}
            data-testid="button-add-dog"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t.common.addDog}
          </Button>
        </div>

        <AnimatePresence>
          {showAddDog && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card className="p-5 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Dog Name</Label>
                    <Input value={dogName} onChange={(e) => setDogName(e.target.value)} placeholder="Buddy" data-testid="input-dog-name" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Breed</Label>
                    <Input value={dogBreed} onChange={(e) => setDogBreed(e.target.value)} placeholder="Labrador" data-testid="input-dog-breed" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Age</Label>
                    <Input value={dogAge} onChange={(e) => setDogAge(e.target.value)} placeholder="3 years" data-testid="input-dog-age" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Weight</Label>
                    <Input value={dogWeight} onChange={(e) => setDogWeight(e.target.value)} placeholder="25 kg" data-testid="input-dog-weight" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Gender</Label>
                    <Input value={dogGender} onChange={(e) => setDogGender(e.target.value)} placeholder="Male / Female" data-testid="input-dog-gender" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    onClick={() => addDog.mutate({ dogName, breed: dogBreed, age: dogAge, weight: dogWeight, gender: dogGender })}
                    disabled={!dogName || !dogBreed || !dogAge || addDog.isPending}
                    data-testid="button-save-dog"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {t.common.save}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddDog(false)}>
                    {t.common.cancel}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {dogsLoading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">{t.common.loading}</div>
        ) : dogProfiles.length === 0 ? (
          <Card className="p-8 text-center">
            <Dog className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No dogs added yet. Click "{t.common.addDog}" to get started.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {dogProfiles.map((dog) => (
              <motion.div key={dog.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <PawPrint className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground" data-testid={`text-dog-name-${dog.id}`}>{dog.dogName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {dog.breed} &middot; {dog.age}
                          {dog.weight && ` \u00B7 ${dog.weight}`}
                          {dog.gender && ` \u00B7 ${dog.gender}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDog.mutate(dog.id)}
                      data-testid={`button-delete-dog-${dog.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
