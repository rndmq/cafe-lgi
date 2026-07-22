import { useState } from "react"
import { useLocation } from "wouter"
import { AlertCircle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  const [, setLocation] = useLocation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">404</h1>
          <h2 className="text-xl font-medium text-gray-700">Halaman tidak ditemukan</h2>
          <p className="text-gray-500">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        <Button 
          onClick={() => setLocation("/")}
          className="rounded-full h-12 px-8 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  )
}