import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import simulatedAdBanner from '../assets/images/simulated_ad_banner_1795399093348.jpg';
import { soundEngine } from '../game/audio';
import { PET_SPECS, PetKind } from '../game/types';

interface SimulatedAdModalProps {
  isOpen: boolean;
  targetPet: PetKind | null;
  onCompleteAndClose: () => void;
}

export const SimulatedAdModal: React.FC<SimulatedAdModalProps> = ({
  isOpen,
  targetPet,
  onCompleteAndClose,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        soundEngine.playClick();
        onCompleteAndClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCompleteAndClose]);

  if (!isOpen) return null;

  const targetPetName = targetPet ? PET_SPECS[targetPet].name : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Anúncio Simulado para Escolha de Pet"
      data-testid="simulated-ad-modal"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
    >
      <div className="relative flex w-full max-w-[380px] flex-col overflow-hidden rounded-3xl border-2 border-[#FACC15] bg-[#0B1020] shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
        {/* Top Ad Chrome Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#080C18] px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[#94A3B8]">
            <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />
            <span>Anúncio Simulado</span>
          </div>

          <button
            type="button"
            data-testid="btn-close-simulated-ad"
            aria-label="Fechar anúncio simulado"
            onClick={() => {
              soundEngine.playClick();
              onCompleteAndClose();
            }}
            className="flex min-h-[34px] items-center gap-1 rounded-xl border border-white/25 bg-[#1E293B] px-3 py-1 text-xs font-bold whitespace-nowrap text-white transition-colors hover:border-[#FACC15] hover:bg-[#334155]"
          >
            <span>Fechar</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Full Simulated Ad Poster Image */}
        <div className="relative aspect-[3/4] max-h-[62vh] w-full overflow-hidden bg-[#0F172A]">
          {!imgError ? (
            <img
              src={simulatedAdBanner}
              alt="Imagem de anúncio simulado de demonstração"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#1E1B4B_0%,#090D1C_75%)] p-6 text-center">
              <Sparkles className="mb-3 h-12 w-12 text-[#FACC15]" />
              <div className="font-display text-xl font-bold text-white">Espaço de Anúncio</div>
              <div className="mt-1 text-xs text-[#CBD5E1]">Simulação visual de propaganda premiada</div>
            </div>
          )}

          {/* Bottom Scrim & Demo Caption */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050814] via-[#050814]/88 to-transparent px-4 pb-4 pt-12 text-center">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#00D4FF]">
              Prévia de Propaganda Premiada
            </div>
            <div className="mt-1 font-display text-lg font-bold text-white">
              {targetPetName
                ? `Liberar Pet ${targetPetName}`
                : 'Liberar Escolha de Pet Guardião'}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
              Imagem demonstrativa simulando um anúncio real. Feche para escolher seu pet.
            </p>
          </div>
        </div>

        {/* Bottom Primary Close & Claim Action */}
        <div className="border-t border-white/10 bg-[#080C18] p-3.5">
          <button
            type="button"
            data-testid="btn-claim-simulated-ad"
            onClick={() => {
              soundEngine.playClick();
              onCompleteAndClose();
            }}
            className="font-display flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-4 py-2.5 text-base font-bold whitespace-nowrap text-white shadow-[0_4px_0_#991B1B] transition-transform active:translate-y-0.5"
          >
            <span>
              {targetPetName
                ? `Fechar e Equipar ${targetPetName}`
                : 'Fechar e Escolher Pet'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
