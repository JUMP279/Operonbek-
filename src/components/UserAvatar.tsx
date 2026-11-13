import React from 'react';

export interface AvatarMeta {
  id: number;
  gender: 'male' | 'female';
  name: string;
  label: string;
  bg: string;
  shirt: string;
  skin: string;
  hair: string;
  hairStyle: 'short' | 'classic' | 'wavy' | 'bob';
  glasses?: boolean;
  accessory?: 'earrings' | 'necklace' | 'none';
}

// Exactly 4 Avatars: 2 Male, 2 Female
export const AVATAR_LIST: AvatarMeta[] = [
  // 1. Male 1: Classic & Glasses
  {
    id: 1,
    gender: 'male',
    name: 'Shohjahon',
    label: 'Мужчина (в очках, классика)',
    bg: '#DBEAFE', // Soft Blue
    shirt: '#1E3A8A', // Navy Blue
    skin: '#FED7AA',
    hair: '#1F2937',
    hairStyle: 'classic',
    glasses: true,
    accessory: 'none'
  },
  // 2. Male 2: Modern & Executive
  {
    id: 2,
    gender: 'male',
    name: 'Jasur',
    label: 'Мужчина (современный предприниматель)',
    bg: '#DCFCE7', // Soft Emerald
    shirt: '#065F46', // Dark Emerald
    skin: '#FDBA74',
    hair: '#111827',
    hairStyle: 'short',
    glasses: false,
    accessory: 'none'
  },
  // 3. Female 1: Elegant & Wavy Hair
  {
    id: 3,
    gender: 'female',
    name: 'Madina',
    label: 'Женщина (волнистые волосы)',
    bg: '#FCE7F3', // Soft Pink
    shirt: '#BE185D', // Rose Pink
    skin: '#FED7AA',
    hair: '#4A044E',
    hairStyle: 'wavy',
    glasses: false,
    accessory: 'earrings'
  },
  // 4. Female 2: Modern Bob & Chic
  {
    id: 4,
    gender: 'female',
    name: 'Laylo',
    label: 'Женщина (каре, современный стиль)',
    bg: '#EDE9FE', // Soft Purple
    shirt: '#6D28D9', // Deep Purple
    skin: '#FDE68A',
    hair: '#312E81',
    hairStyle: 'bob',
    glasses: true,
    accessory: 'necklace'
  }
];

export const UserAvatarIcon: React.FC<{
  avatarId: number;
  size?: number;
  className?: string;
  showBadge?: boolean;
}> = ({ avatarId, size = 40, className = '', showBadge = false }) => {
  const av = AVATAR_LIST.find((a) => a.id === avatarId) || AVATAR_LIST[0];
  const isGirl = av.gender === 'female';

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full overflow-hidden shrink-0 border-2 border-white shadow-2xs select-none ${className}`}
    >
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        {/* Background Circle */}
        <circle cx="20" cy="20" r="20" fill={av.bg} />

        {/* Back Hair for Long/Wavy Female hairstyle */}
        {isGirl && av.hairStyle === 'wavy' && (
          <path
            d="M10 20C10 14 14 10 20 10C26 10 30 14 30 20C31 27 29 36 29 40H11C11 36 9 27 10 20Z"
            fill={av.hair}
          />
        )}

        {/* Shirt / Top Clothing */}
        <path d="M6 40C6 31 12 28 20 28C28 28 34 31 34 40" fill={av.shirt} />

        {/* Neck */}
        <rect x="17" y="21" width="6" height="8" rx="2" fill={av.skin} />

        {/* Necklace if enabled */}
        {av.accessory === 'necklace' && (
          <path d="M16 28C17.5 30.5 22.5 30.5 24 28" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
        )}

        {/* Head Shape */}
        <circle cx="20" cy="18" r="8.5" fill={av.skin} />

        {/* Hairstyle */}
        {!isGirl ? (
          /* Male Hairstyle */
          <path
            d="M12 16C12 11 15 9 20 9C25 9 28 11 28 16C28 14 26 11 20 11C14 11 12 14 12 16Z"
            fill={av.hair}
          />
        ) : (
          /* Female Hairstyle */
          <>
            {av.hairStyle === 'bob' && (
              <path
                d="M11 16C11 10 15 9 20 9C25 9 29 10 29 16C29 21 28 24 27 24C26 21 26 12 20 12C14 12 14 21 13 24C12 24 11 21 11 16Z"
                fill={av.hair}
              />
            )}

            {av.hairStyle === 'wavy' && (
              <path
                d="M11 15C12 10 15 9 20 9C25 9 28 10 29 15C29 20 28 25 26.5 25C26 21 25.5 12.5 20 12.5C14.5 12.5 14 21 13.5 25C12 25 11 20 11 15Z"
                fill={av.hair}
              />
            )}
          </>
        )}

        {/* Earrings */}
        {av.accessory === 'earrings' && (
          <>
            <circle cx="11.5" cy="19.5" r="1" fill="#F59E0B" />
            <circle cx="28.5" cy="19.5" r="1" fill="#F59E0B" />
          </>
        )}

        {/* Glasses if enabled */}
        {av.glasses && (
          <>
            <rect x="13" y="15" width="5.5" height="4.5" rx="1.5" stroke={av.hair} strokeWidth="1.2" fill="none" />
            <rect x="21.5" y="15" width="5.5" height="4.5" rx="1.5" stroke={av.hair} strokeWidth="1.2" fill="none" />
            <line x1="18.5" y1="17.2" x2="21.5" y2="17.2" stroke={av.hair} strokeWidth="1.2" />
          </>
        )}

        {/* Eyes */}
        <circle cx="16" cy="17" r="0.9" fill={av.hair} />
        <circle cx="24" cy="17" r="0.9" fill={av.hair} />

        {/* Eyelashes for female avatars */}
        {isGirl && (
          <>
            <path d="M14.8 15.8L14.2 14.8" stroke={av.hair} strokeWidth="0.8" strokeLinecap="round" />
            <path d="M25.2 15.8L25.8 14.8" stroke={av.hair} strokeWidth="0.8" strokeLinecap="round" />
          </>
        )}

        {/* Cheeks Blush for Female */}
        {isGirl && (
          <>
            <circle cx="14.5" cy="19" r="1.2" fill="#F43F5E" opacity="0.35" />
            <circle cx="25.5" cy="19" r="1.2" fill="#F43F5E" opacity="0.35" />
          </>
        )}

        {/* Smile */}
        <path
          d="M17.5 21C18.5 22.4 21.5 22.4 22.5 21"
          stroke={isGirl ? '#E11D48' : av.hair}
          strokeWidth={isGirl ? '1.4' : '1.2'}
          strokeLinecap="round"
        />
      </svg>

      {/* Gender indicator badge */}
      {showBadge && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold ${
            isGirl ? 'bg-pink-500' : 'bg-blue-600'
          }`}
        >
          {isGirl ? '♀' : '♂'}
        </span>
      )}
    </div>
  );
};
