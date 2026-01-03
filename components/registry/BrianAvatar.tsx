"use client";

import Image from "next/image";

type BrianAvatarProps = {
  src?: string;
  alt?: string;
  isActive?: boolean;
  isIsabella?: boolean;
};

export function BrianAvatar({
  src = "https://res.cloudinary.com/dptqxjhb8/image/upload/v1767265555/brian-avatar_mfmint.jpg",
  alt = "Brian avatar",
  isActive = false,
  isIsabella = false,
}: BrianAvatarProps) {
  return (
    <div
      className={`brian-avatar ${isActive ? "brian-avatar--active" : ""} ${
        isIsabella ? "brian-avatar--isabella" : ""
      }`}
    >
      <Image src={src} alt={alt} width={40} height={40} priority />
    </div>
  );
}
