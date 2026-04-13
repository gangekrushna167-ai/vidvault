import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateCollection } from "../hooks/useCollections";

export function CreateCollectionForm() {
  const createCollection = useCreateCollection();
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await createCollection.mutateAsync(trimmed);
    toast.success(`Collection "${trimmed}" created`);
    setTitle("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3"
      data-ocid="create-collection-form"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New collection name…"
        className="bg-card border-input flex-1 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
        data-ocid="input-new-collection"
      />
      <Button
        type="submit"
        className="gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        disabled={!title.trim() || createCollection.isPending}
        data-ocid="btn-create-collection"
      >
        <Plus className="w-4 h-4" />
        Create
      </Button>
    </form>
  );
}
