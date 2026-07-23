import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, Croissant, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center bg-orange-50 overflow-hidden py-20 lg:py-0 min-h-[600px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                ✨ Kopi & Kenangan Manis
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                Cita Rasa <br/>
                <span className="text-primary">Lokal</span>, <br/>
                Gaya Modern.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Nikmati secangkir kopi segar dengan sentuhan rasa otentik Indonesia. 
                Pesan sekarang, lewati antrean, dan rasakan nikmatnya setiap tegukan.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu">
                  <Button size="lg" className="w-full sm:w-auto gap-2 rounded-full text-base">
                    Pesan Sekarang <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/menu?category=Makanan">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 rounded-full text-base bg-white/50 backdrop-blur">
                    Lihat Menu
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative rotate-3 bg-white">
                <img 
                  src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Iced Coffee" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-primary">
                  <Star className="w-6 h-6 fill-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">4.9/5</p>
                  <p className="text-sm text-muted-foreground">Rating Pelanggan</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-orange-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-primary">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Kopi Pilihan</h3>
              <p className="text-muted-foreground">Biji kopi terbaik dari petani lokal, dipanggang dengan sempurna untuk rasa yang kaya.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-orange-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-primary">
                <Croissant className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Roti Segar</h3>
              <p className="text-muted-foreground">Teman ngopi paling pas. Dipanggang fresh setiap pagi untuk menemani harimu.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-orange-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Harga Hemat</h3>
              <p className="text-muted-foreground">Kualitas premium tidak harus mahal. Banyak promo menanti untuk pesananmu.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
