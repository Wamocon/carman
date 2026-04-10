import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  alt?: string;
};

export function BrandMark({ className = "h-8 w-8", alt = "CarMan Logo" }: BrandMarkProps) {
  return (
    <Image
      src="/brand/app-icon/carman-idea-11-sage.svg"
      alt={alt}
      width={64}
      height={64}
      className={className}
      priority
    />
  );
}
