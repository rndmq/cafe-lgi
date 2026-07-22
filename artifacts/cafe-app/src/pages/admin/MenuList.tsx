import { useLocation } from "wouter";
import { useEffect } from "react";
import { useListMenus, useDeleteMenu, getListMenusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function MenuList() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!localStorage.getItem("adminToken")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: menus, isLoading } = useListMenus();
  const deleteMutation = useDeleteMenu();

  const handleDelete = (id: number) => {
    if (confirm("Hapus menu ini?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMenusQueryKey() });
          toast({ title: "Berhasil dihapus" });
        }
      });
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80";
    if (url.startsWith("http")) return url;
    return `/api/storage${url}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Menu</h1>
          <p className="text-muted-foreground">Kelola daftar makanan dan minuman</p>
        </div>
        <Link href="/admin/menus/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Menu
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Foto</TableHead>
                  <TableHead>Nama Menu</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus?.map(menu => (
                  <TableRow key={menu.id}>
                    <TableCell>
                      <img 
                        src={getImageUrl(menu.imageUrl ?? null)} 
                        alt={menu.name} 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {menu.name}
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{menu.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{menu.category}</Badge>
                    </TableCell>
                    <TableCell>Rp {menu.price.toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      {menu.isAvailable ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Tersedia</Badge>
                      ) : (
                        <Badge variant="secondary">Habis</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/menus/edit/${menu.id}`}>
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {!menu.isDefault && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => handleDelete(menu.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {menus?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Belum ada menu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
