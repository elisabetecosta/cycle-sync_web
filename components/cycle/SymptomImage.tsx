import type { Symptom } from "@/types"

interface SymptomImageProps {
    symptom: Symptom
    className?: string
}

// Default image path for fallback
const DEFAULT_IMAGE_PATH = "/images/symptoms/cramping.webp"

export function SymptomImage({ symptom, className = "" }: SymptomImageProps) {
    return (
        <div className={`relative overflow-hidden rounded-full shadow-md ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-200 opacity-30"></div>
            <img
                src={symptom.imagePath || DEFAULT_IMAGE_PATH}
                alt={symptom.name}
                className="w-full h-full object-cover relative z-10"
            />
            <div className="absolute inset-0 ring-2 ring-white/20 rounded-full"></div>
        </div>
    )
}