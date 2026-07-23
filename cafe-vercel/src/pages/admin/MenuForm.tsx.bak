import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useCreateMenu, 
  useUpdateMenu, 
  useGetMenu, 
  getListMenusQueryKey,
  getGetMenuQueryKey,
  getGetMenuSummaryQueryKey
} from "@/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, UploadCloud } from "lucide-react";

export default function MenuForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id;
  const menuId = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: initialMenu, isLoading: initLoading } = useGetMenu(menuId, { 
    query: { enabled: isEditing, queryKey: getGetMenuQueryKey(menuId) } 
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"Makanan" | "Minuman">("Minuman");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialMenu && isEditing) {
      setName(initialMenu.name);
      setDescription(initialMenu.description || "");
      setPrice(initialMenu.price.toString());
      setCategory(initialMenu.category);
      setIsAvailable(initialMenu.isAvailable);
      setImageUrl(initialMenu.imageUrl || "");
    }
  }, [initialMenu, isEditing]);

  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const adminToken = localStorage.getItem("adminToken") || "";
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/storage/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload gagal" }));
      throw new Error(err.error || "Upload gagal");
    }

    const data = await res.json();
    return data.url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    let finalImageUrl = imageUrl;

    try {
      if (file) {
        setIsUploading(true);
        finalImageUrl = await uploadImage(file);
        setIsUploading(false);
      }

      const menuData = {
        name,
        description,
        price: Number(price),
        category,
        isAvailable,
        imageUrl: finalImageUrl || undefined
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: menuId, data: menuData });
        queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey(menuId) });
        toast({ title: "Berhasil diubah" });
      } else {
        await createMutation.mutateAsync({ data: menuData });
        toast({ title: "Menu ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: getListMenusQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMenuSummaryQueryKey() });
      setLocation("/admin/menus");
      
    } catch (err) {
      setIsUploading(false);
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  if (isEditing && initLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/menus")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Menu" : "Tambah Menu Baru"}</h1>
          <p className="text-muted-foreground">{isEditing ? "Ubah detail menu" : "Isi detail menu baru"}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nama Menu *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Contoh: Es Teh Manis" />
              </div>

              <div className="space-y-2">
                <Label>Harga *</Label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} required min={0} placeholder="15000" />
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as "Makanan" | "Minuman")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minuman">Minuman</SelectItem>
                    <SelectItem value="Makanan">Makanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Foto Menu</Label>
              <div className="flex items-center gap-4">
                {(file || imageUrl) && (
                  <img 
                    src={file ? URL.createObjectURL(file) : imageUrl} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1 relative">
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="pl-10" />
                  <UploadCloud className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              {isUploading && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Mengunggah foto...
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="available" 
                checked={isAvailable}
                onChange={e => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="available" className="cursor-pointer">Tersedia untuk dipesan</Label>
            </div>

            <Button type="submit" className="w-full h-12 mt-6" disabled={isPending}>
              {isPending && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {isEditing ? "Simpan Perubahan" : "Tambahkan Menu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
