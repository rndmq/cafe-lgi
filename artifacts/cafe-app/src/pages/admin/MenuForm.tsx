import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useCreateMenu, 
  useUpdateMenu, 
  useGetMenu, 
  useRequestUploadUrl,
  getListMenusQueryKey,
  getGetMenuQueryKey,
  getGetMenuSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, UploadCloud } from "lucide-react";
import { supabase, MENU_IMAGES_BUCKET } from "@/lib/supabaseClient";

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
  const uploadMutation = useRequestUploadUrl();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name || !price) return;

  let finalImageUrl = imageUrl;

  try {
    if (file) {
      // 1. Request upload URL
      const uploadRes = await uploadMutation.mutateAsync({
        data: {
          name: file.name,
          size: file.size,
          contentType: file.type
        }
      });

      const { uploadURL, bucketPath } = uploadRes as unknown as {
        uploadURL: string;
        bucketPath: string;
      };

      // 2. Upload file ke Supabase bucket dengan raw PUT
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload gagal: ${uploadResponse.statusText}`);
      }

      // 3. VERIFY ke server bahwa file sudah tersimpan
      const token_admin = localStorage.getItem("adminToken");
      const verifyRes = await fetch("/api/storage/uploads/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token_admin}`,
        },
        body: JSON.stringify({ bucketPath }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.error || "Verifikasi upload gagal");
      }

      const verifyData = await verifyRes.json();
      finalImageUrl = verifyData.objectPath;
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
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Error details:", err);
    toast({ 
      title: "Gagal menyimpan", 
      description: errorMsg,
      variant: "destructive" 
    });
  }
};
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => setLocation("/admin/menus")}>
        <ArrowLeft className="w-4 h-4" /> Batal
      </Button>

      <h1 className="text-3xl font-bold mb-8">
        {isEditing ? "Edit Menu" : "Tambah Menu Baru"}
      </h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Nama Menu</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                    src={file ? URL.createObjectURL(file) : (imageUrl.startsWith("http") ? imageUrl : `/api/storage${imageUrl}`)} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1 relative">
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="pl-10" />
                  <UploadCloud className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
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

            <Button type="submit" className="w-full h-12 mt-6" disabled={isSaving}>
  {isSaving && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
  {isEditing ? "Simpan Perubahan" : "Tambahkan Menu"}
</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}